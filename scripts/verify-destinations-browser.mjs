import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const debug = process.env.BROWSER_DEBUG_URL ?? "http://127.0.0.1:9333";
const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3100";
const tab = await fetch(`${debug}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, {once:true}); socket.addEventListener("error", reject, {once:true}); });
let requestId = 0;
let loaded;
const pending = new Map();
const errors = [];
const results = [];
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
  await writeFile(`artifacts/phase4/${name}.png`,Buffer.from(shot.data,"base64"));
}

try {
  await mkdir("artifacts/phase4",{recursive:true});
  await send("Page.enable");await send("Runtime.enable");await send('Page.bringToFront');await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  for(const width of [320,390,768,1024,1440,1920]) {
    await send("Emulation.setDeviceMetricsOverride",{width,height:900,deviceScaleFactor:1,mobile:false});
    for(const locale of ["id","en"]) {
      for(const path of ["destinations","destinations/barelang-bridge","gallery"]) {
        await navigate(`/${locale}/${path}`);
        const info=await evaluate(`(() => ({
          width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,
          lang:document.documentElement.lang,h1:document.querySelectorAll('main h1').length,
          photos:document.querySelectorAll('main [data-local-photo]').length,
          cards:document.querySelectorAll('main article').length,
          columns:getComputedStyle(document.querySelector('main article')?.parentElement??document.querySelector('main')).gridTemplateColumns,
          clipped:[...document.querySelectorAll('main h1,main h2,main h3,main p,main input,main select')].filter(e=>{const r=e.getBoundingClientRect();return r.left < -1 || r.right > innerWidth+1}).map(e=>e.textContent),
          broken:[...document.images].filter(i=>i.complete&&i.naturalWidth===0).length,
          title:document.title,description:document.querySelector('meta[name=description]')?.content,
          labels:[...document.querySelectorAll('main input,main select')].every(e=>!!e.closest('label')),
          links:[...document.querySelectorAll('main a')].filter(e=>e.getAttribute('href').startsWith('/')).map(e=>e.getAttribute('href'))
        }))()`);
        assert.equal(info.lang,locale);assert.equal(info.h1,1);assert.ok(info.title.includes('Anggun AR Sukses Abadi'));assert.ok(info.description);
        assert.ok(info.scroll<=info.width+1,`${path} ${locale} ${width}: overflow`);assert.deepEqual(info.clipped,[]);assert.equal(info.broken,0);assert.ok(info.labels);
        assert.ok(info.links.every(href=>href.startsWith(`/${locale}`)));
        if(path.startsWith('destinations'))assert.equal(info.photos,3);
        if(path==='destinations')assert.equal(info.columns.split(' ').length,width>=1280?3:width>=768?2:1);
        if([390,1440].includes(width))await screenshot(`${locale}-${width}-${path.replaceAll('/','-')}`,true);
        results.push({locale,width,path,...info});
      }
    }
  }
  await navigate('/id/destinations');
  await evaluate("document.querySelector('input[name=q]').value='nongsa';document.querySelector('input[name=q]').focus()");
  await key('Enter','Enter',13);await delay(600);
  assert.equal(await evaluate("document.querySelectorAll('main article').length"),1);
  await click('header a[hreflang="en"]');assert.equal(await evaluate('location.pathname'),'/en/destinations');assert.equal(await evaluate("new URLSearchParams(location.search).get('q')"),'nongsa');
  await click('main article a');assert.equal(await evaluate('location.pathname'),'/en/destinations/nongsa-beach');
  await click('header a[hreflang="id"]');assert.equal(await evaluate('location.pathname'),'/id/destinations/nongsa-beach');
  await navigate('/en/destinations?category=beaches-islands');
  assert.equal(await evaluate("document.querySelectorAll('main article').length"),2);
  await click('header a[hreflang="id"]');assert.equal(await evaluate("new URLSearchParams(location.search).get('category')"),'beaches-islands');
  await evaluate("document.querySelector('select').value='nature';document.querySelector('button[type=submit]').click()");await delay(600);
  assert.equal(await evaluate("document.querySelectorAll('main article').length"),0);
  await click('main form a');assert.equal(await evaluate("document.querySelectorAll('main article').length"),3);
  await evaluate("document.querySelector('input').focus()");
  await key('Tab','Tab',9);
  assert.notEqual(await evaluate("getComputedStyle(document.activeElement).outlineStyle"),'none');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  assert.equal(await evaluate('getComputedStyle(document.documentElement).scrollBehavior'),'auto');
  assert.deepEqual(errors,[]);
  await writeFile('artifacts/phase4/destinations-browser-results.json',JSON.stringify({results,errors},null,2));
  console.log(`PASS ${results.length} ID/EN destination/gallery viewport combinations, metadata, 3 slots, grid, labels, focus indicator, search Enter, category/reset, language/query, detail navigation; no captured console/hydration errors`);
} finally { await fetch(`${debug}/json/close/${tab.id}`).catch(()=>{});socket.close(); }
