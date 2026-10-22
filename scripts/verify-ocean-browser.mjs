import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const debug = process.env.BROWSER_DEBUG_URL ?? "http://127.0.0.1:9333";
const base = process.env.TEST_BASE_URL ?? "http://localhost:3000";
const tab = await fetch(`${debug}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, {once:true}); socket.addEventListener("error", reject, {once:true}); });
let requestId = 0;
let loaded;
const pending = new Map();
const errors = [];
const results = [];
const stage = process.env.OCEAN_STAGE ?? "after";
socket.addEventListener("message", ({data}) => {
  const message = JSON.parse(data);
  if (message.method === "Page.loadEventFired") loaded?.();
  if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails);
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") errors.push(message.params.args.map((a) => a.value ?? a.description));
  const item = pending.get(message.id);
  if (item) {
    pending.delete(message.id); clearTimeout(item.timeout);
    if (message.error) item.reject(new Error(JSON.stringify(message.error)));
    else item.resolve(message.result);
  }
});
function send(method, params = {}) {
  const id = ++requestId;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout ${method}`)); },15000);
    pending.set(id,{resolve,reject,timeout}); socket.send(JSON.stringify({id,method,params}));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate",{expression,returnByValue:true,awaitPromise:true});
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve,ms));
async function navigate(path) {
  let timeout;
  const load = new Promise((resolve,reject) => { loaded=resolve; timeout=setTimeout(()=>reject(new Error(`Page timeout ${path}`)),12000); });
  try { await send("Page.navigate",{url:new URL(path,base).href}); await load; }
  finally { clearTimeout(timeout); loaded=undefined; }
  await evaluate("document.fonts.ready"); await delay(250);
}
async function click(selector) {
  const point=await evaluate(`(() => {const el=document.querySelector(${JSON.stringify(selector)});if(!el.closest('body > header'))el.scrollIntoView({block:'center',behavior:'instant'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await send("Input.dispatchMouseEvent",{type:"mousePressed",...point,button:"left",clickCount:1});
  await send("Input.dispatchMouseEvent",{type:"mouseReleased",...point,button:"left",clickCount:1});
  await delay(400);
}
async function screenshot(name,full=false) {
  if(full)await evaluate(`(async()=>{const before=scrollY;for(let y=0;y<document.documentElement.scrollHeight;y+=innerHeight){scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,35))}await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));scrollTo({top:before,behavior:'instant'});await new Promise(r=>requestAnimationFrame(r))})()`);
  const params={format:"png",captureBeyondViewport:full};
  if (full) {const {cssContentSize}=await send("Page.getLayoutMetrics");params.clip={x:0,y:0,width:cssContentSize.width,height:cssContentSize.height,scale:1};}
  const shot=await send("Page.captureScreenshot",params);
  await writeFile(`artifacts/ocean-refinement/${stage}/${name}.png`,Buffer.from(shot.data,"base64"));
}

try {
  await mkdir(`artifacts/ocean-refinement/${stage}`,{recursive:true});
  await send('Page.enable');await send('Runtime.enable');await send('Page.bringToFront');await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  const pages=process.env.OCEAN_PAGES ? process.env.OCEAN_PAGES.split('|') : ['','gallery','destinations','destinations/barelang-bridge','destinations/nongsa-beach','destinations/abang-island','packages','packages/batam-city-escape?preview=draft','packages/coastal-slow-days?preview=draft','packages/island-perspectives?preview=draft','about','contact','booking','faq','privacy','terms'];
  for(const width of process.env.OCEAN_WIDTHS ? process.env.OCEAN_WIDTHS.split(',').map(Number) : stage==='before'?[390,1440]:[320,390,768,1024,1440,1920]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    for(const locale of ['id','en']) {
      for(const page of pages) {
        await navigate(`/${locale}${page?'/'+page:''}`);
        const info=await evaluate(`(() => {
          const h=document.querySelector('main h1'),header=document.querySelector('body > header'),r=h.getBoundingClientRect();
          const canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d',{willReadFrequently:true});
          const rgba=(color)=>{ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);const d=ctx.getImageData(0,0,1,1).data;return [d[0],d[1],d[2],d[3]/255]};
          const over=(fg,bg)=>{const alpha=fg[3]+bg[3]*(1-fg[3]);return [...[0,1,2].map(i=>alpha?(fg[i]*fg[3]+bg[i]*bg[3]*(1-fg[3]))/alpha:0),alpha]};
          const lum=(c)=>{const v=c.slice(0,3).map(n=>{const x=n/255;return x<=.04045?x/12.92:((x+.055)/1.055)**2.4});return .2126*v[0]+.7152*v[1]+.0722*v[2]};
          const contrastIssues=[];let manualBackgrounds=0;let checkedText=0;
          const walker=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
          while(walker.nextNode()){
            const node=walker.currentNode,e=node.parentElement;if(!node.textContent.trim()||!e||e.closest('script,style,svg,[aria-hidden="true"],[inert],nextjs-portal'))continue;
            const s=getComputedStyle(e);if(!e.getClientRects().length||s.visibility==='hidden')continue;
            let bg=[0,0,0,0],manual=false;
            for(let p=e;p;p=p.parentElement){const ps=getComputedStyle(p);if(ps.backgroundImage!=='none'){manual=true;break}bg=over(bg,rgba(ps.backgroundColor));if(bg[3]>=.999)break}
            if(manual){manualBackgrounds++;continue}bg=over(bg,[255,255,255,1]);const fg=over(rgba(s.color),bg);const a=lum(fg),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05);const large=parseFloat(s.fontSize)>=24||(parseFloat(s.fontSize)>=18.66&&parseInt(s.fontWeight)>=700);checkedText++;
            if(ratio<(large?3:4.5)-.02)contrastIssues.push({text:node.textContent.trim().slice(0,90),ratio:+ratio.toFixed(2),required:large?3:4.5,color:s.color,background:bg});
          }
          return {lang:document.documentElement.lang,h1:document.querySelectorAll('main h1').length,headingTop:r.top,headerBottom:header.getBoundingClientRect().bottom,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,
            clipped:[...document.querySelectorAll('main h1,main h2,main h3,main p,main input,main select')].filter(e=>{const b=e.getBoundingClientRect();return b.left < -1 || b.right > innerWidth+1}).map(e=>e.textContent),
            broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).length,contrastIssues,checkedText,manualBackgrounds};
        })()`);
        assert.equal(info.lang,locale);assert.equal(info.h1,1);
        assert.ok(info.scrollWidth<=info.clientWidth+1,`${page} ${locale} ${width}: overflow`);assert.deepEqual(info.clipped,[]);assert.equal(info.broken,0);
        assert.ok(info.headingTop>=info.headerBottom-1,`${page} ${locale} ${width}: direct heading hidden`);
        if(stage!=='before')assert.deepEqual(info.contrastIssues,[],`${page} ${locale} ${width}: AA text contrast`);
        if([390,1440].includes(width)&&['','gallery','destinations','destinations/barelang-bridge','packages','packages/batam-city-escape?preview=draft','about','contact'].includes(page))await screenshot(`${locale}-${width}-${page.replaceAll('/','-').split('?')[0]||'home'}`,true);
        results.push({locale,width,page,...info});
      }
      await navigate(`/${locale}/about`);
      await evaluate(`scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'});const d=document.querySelector('header details');if(d)d.open=true;document.querySelector('header a[href="/${locale}/gallery"]').click()`);
      await delay(900);
      const navigation=await evaluate(`(() => {const h=document.querySelector('main h1').getBoundingClientRect(),b=document.querySelector('body > header').getBoundingClientRect();return {path:location.pathname,scrollY,headingTop:h.top,headerBottom:b.bottom}})()`);
      assert.equal(navigation.path,`/${locale}/gallery`);
      if(stage!=='before')assert.ok(navigation.headingTop>=navigation.headerBottom-1,`${locale} ${width}: Gallery heading hidden after navigation ${JSON.stringify(navigation)}`);
      const other=locale==='id'?'en':'id';
      await click(`header a[hreflang="${other}"]`);
      await evaluate(`new Promise((resolve,reject)=>{const start=Date.now();const check=()=>{if(location.pathname==='/${other}/gallery')resolve();else if(Date.now()-start>8000)reject(new Error('Language navigation timeout: '+location.pathname));else setTimeout(check,80)};check()})`);await delay(250);
      const language=await evaluate(`({path:location.pathname,headingTop:document.querySelector('main h1').getBoundingClientRect().top,headerBottom:document.querySelector('body > header').getBoundingClientRect().bottom,scrollY})`);
      assert.equal(language.path,`/${other}/gallery`);
      if(stage!=='before')assert.ok(language.headingTop>=language.headerBottom-1,`${width}: Gallery heading hidden after language switch ${JSON.stringify(language)}`);
      results.push({locale,width,navigation,language});
      console.log(`PASS ${stage} ${locale} ${width}px: ${pages.length} pages, Gallery navigation/language bounds ${navigation.headingTop}/${navigation.headerBottom}`);
    }
  }
  assert.deepEqual(errors,[]);
  await writeFile(`artifacts/ocean-refinement/${stage}/results.json`,JSON.stringify({results,errors},null,2));
  console.log(`PASS ${stage}: ${results.filter(r=>r.page!==undefined).length} page/locale/viewport combinations; no captured console/hydration errors`);
} finally {await fetch(`${debug}/json/close/${tab.id}`).catch(()=>{});socket.close();}
