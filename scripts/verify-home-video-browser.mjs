import assert from "node:assert/strict";
import { mkdir, writeFile, readFile, stat } from "node:fs/promises";




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
const stage=process.env.VIDEO_STAGE??"after";
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
async function expectEventually(expression,value) {
  for(let i=0;i<100;i++){if(await evaluate(expression)===value)return;await delay(100)}
  assert.equal(await evaluate(expression),value);
}
async function navigate(path) {
  let timeout;
  const load = new Promise((resolve,reject) => { loaded=resolve; timeout=setTimeout(()=>reject(new Error(`Page timeout ${path}`)),12000); });
  try { await send("Page.navigate",{url:new URL(path,base).href}); await load; }
  finally { clearTimeout(timeout); loaded=undefined; }
  await evaluate("document.fonts.ready"); await delay(250);
}
async function click(selector) {
  const point=await evaluate(`(() => {const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center',behavior:'instant'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await send("Input.dispatchMouseEvent",{type:"mousePressed",...point,button:"left",clickCount:1});
  await send("Input.dispatchMouseEvent",{type:"mouseReleased",...point,button:"left",clickCount:1});
  await delay(400);
}
async function key(key,code,windowsVirtualKeyCode) {
  await send("Input.dispatchKeyEvent",{type:key==="Enter"?"keyDown":"rawKeyDown",key,code,windowsVirtualKeyCode,...(key==="Enter"?{text:"\r"}:{})});
  await send("Input.dispatchKeyEvent",{type:"keyUp",key,code,windowsVirtualKeyCode}); await delay(80);
}
async function screenshot(name,full=false) {
  const params={format:"png",captureBeyondViewport:full};
  if (full) {const {cssContentSize}=await send("Page.getLayoutMetrics");params.clip={x:0,y:0,width:cssContentSize.width,height:cssContentSize.height,scale:1};}
  const shot=await send("Page.captureScreenshot",params);
  await writeFile(`artifacts/home-video/${stage}-${name}.png`,Buffer.from(shot.data,"base64"));
}

try {
  await mkdir('artifacts/home-video',{recursive:true});
  await send('Page.enable');await send('Runtime.enable');await send('Page.bringToFront');await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  const baseline=stage==='before'?null:JSON.parse(await readFile('artifacts/home-video/before-results.json','utf8'));
  const hasVideo=await stat('public/videos/home/batam-cinematic-h264.mp4').then(s=>s.isFile()).catch(()=>false);
  const hasPoster=await stat('public/images/home/batam-cinematic-poster.webp').then(s=>s.isFile()).catch(()=>false);
  for(const width of [320,390,768,1024,1440,1920]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    for(const locale of ['id','en']) {
      await navigate(`/${locale}`);
      const info=await evaluate(`(() => {
        const feature=document.querySelector('section[aria-labelledby="destinations-title"]'),r=feature.getBoundingClientRect();
        const cards=[...feature.querySelectorAll('[data-destination-card]')].map(e=>{const b=e.getBoundingClientRect();return {width:b.width,height:b.height,left:b.left,top:b.top+scrollY,text:e.innerText,links:[...e.querySelectorAll('a')].map(a=>a.getAttribute('href'))}});
        return {locale:document.documentElement.lang,width:innerWidth,scrollWidth:document.documentElement.scrollWidth,clientWidth:document.documentElement.clientWidth,h1:document.querySelectorAll('main h1').length,sections:[...document.querySelectorAll('main > section')].map(e=>e.getAttribute('aria-labelledby')),feature:{html:feature.outerHTML,top:r.top+scrollY,height:r.height,width:r.width,left:r.left,cards}};
      })()`);
      assert.equal(info.locale,locale);assert.equal(info.feature.cards.length,3);assert.equal(info.h1,1);assert.ok(info.scrollWidth<=info.clientWidth+1);
      if(stage!=='before') {
        const original=baseline.results.find(r=>r.locale===locale&&r.width===width);
        assert.equal(info.feature.html,original.feature.html,'Featured Destinations DOM/content/styles unchanged');
        for(const key of ['height','width','left'])assert.ok(Math.abs(info.feature[key]-original.feature[key])<1,`Featured ${key} unchanged`);
        // Absolute Y changes when cinema moves above the introduction; card layout remains identical.
        const relativeCards=feature=>feature.cards.map(card=>({...card,top:Math.round((card.top-feature.top)*100)/100}));
        assert.deepEqual(relativeCards(info.feature),relativeCards(original.feature),'All three card dimensions, relative layout, content and links unchanged');
        assert.equal(info.sections.length,8);assert.equal(info.sections[1],'cinematic-title');assert.equal(info.sections[2],'intro-title');assert.equal(info.sections[3],'destinations-title');assert.equal(info.sections[4],'packages-title');
        const boundary=await evaluate(`(() => {const hero=document.querySelector('main > section'),cinema=document.querySelector('section[aria-labelledby=cinematic-title]'),intro=document.querySelector('section[aria-labelledby=intro-title]');return {adjacent:hero.nextElementSibling===cinema&&cinema.nextElementSibling===intro,bottom:hero.getBoundingClientRect().bottom+scrollY,top:cinema.getBoundingClientRect().top+scrollY,cinemaBottom:cinema.getBoundingClientRect().bottom+scrollY,introTop:intro.getBoundingClientRect().top+scrollY,headerBottom:document.querySelector('body > header').getBoundingClientRect().bottom,count:document.querySelectorAll('section[aria-labelledby=cinematic-title]').length}})()`);
        assert.equal(boundary.adjacent,true,'DOM order: Hero → Cinema → Introduction');
        assert.equal(boundary.count,1,'No duplicate cinematic section');
        assert.ok(Math.abs(boundary.bottom-boundary.top)<1,'Both sections meet visually without intervening content');
        assert.ok(Math.abs(boundary.cinemaBottom-boundary.introTop)<1,'Introduction immediately follows cinema visually');
        assert.ok(boundary.top>=boundary.headerBottom,'Cinema starts below sticky navbar');
        if([390,1440].includes(width)) {
          await evaluate(`scrollTo({top:${boundary.bottom-420},behavior:'instant'})`);await delay(100);
          await screenshot(`${locale}-${width}-boundary`);
        }
        const video=await evaluate(`(() => {const f=document.querySelector('[data-cinematic-frame]'),r=f.getBoundingClientRect();return {width:r.width,height:r.height,videos:f.querySelectorAll('video').length,images:f.querySelectorAll('img').length,text:f.innerText}})()`);
        assert.ok(video.height>=Math.min(video.width*9/16,320),'Stable responsive media frame');assert.equal(video.videos,hasVideo?1:0,'Video matches local asset availability');assert.equal(video.images,hasPoster?1:0,'Poster matches local asset availability');
        await evaluate("document.querySelector('section[aria-labelledby=cinematic-title]').scrollIntoView({block:'start',behavior:'instant'})");
        const before=await evaluate("document.querySelector('[data-cinematic-frame]').getBoundingClientRect().height");await delay(300);
        assert.equal(await evaluate("document.querySelector('[data-cinematic-frame]').getBoundingClientRect().height"),before,'Fallback height remains stable');
        if([390,1440].includes(width))await screenshot(`${locale}-${width}-cinematic`);
        await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});assert.equal(await evaluate("document.querySelectorAll('[data-cinematic-frame] video').length"),hasVideo?1:0);await send('Emulation.setEmulatedMedia',{features:[]});
        await click('header a[hreflang="'+(locale==='id'?'en':'id')+'"]');await expectEventually('document.documentElement.lang',locale==='id'?'en':'id');
        await navigate(`/${locale}`);await evaluate("document.querySelector('section[aria-labelledby=destinations-title] a[href*=barelang]').focus()");await key('Enter','Enter',13);await expectEventually('location.pathname',`/${locale}/destinations/barelang-bridge`);
      } else assert.equal(info.sections.length,7);
      results.push(info);console.log(`PASS ${stage} ${locale} ${width}px: three destination cards ${stage==='before'?'baseline saved':'identical, new section position/ratio/fallback/keyboard verified'}`);
    }
  }
  assert.deepEqual(errors,[]);await writeFile(`artifacts/home-video/${stage}-results.json`,JSON.stringify({results,errors},null,2));
} finally {await fetch(`${debug}/json/close/${tab.id}`).catch(()=>{});socket.close();}
