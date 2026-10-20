import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const debug = process.env.BROWSER_DEBUG_URL ?? "http://127.0.0.1:9222";
const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
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
  await writeFile(`artifacts/about/${name}.png`,Buffer.from(shot.data,"base64"));
}

try {
  await mkdir("artifacts/about",{recursive:true});
  await send("Page.enable"); await send("Runtime.enable"); await send("Page.bringToFront");
  await send("Emulation.setFocusEmulationEnabled",{enabled:true});
  const order=["about-title","company-introduction","company-vision","company-mission","company-philosophy","company-values","company-commitment","about-cta"];
  for (const width of [320,390,430,768,1024,1440,1920]) {
    await send("Emulation.setDeviceMetricsOverride",{width,height:900,deviceScaleFactor:1,mobile:false});
    for (const locale of ["id","en"]) {
      await navigate(`/${locale}/about`);
      const info=await evaluate(`(() => {
        const main=document.querySelector('main');
        return {
          lang:document.documentElement.lang,title:document.title,description:document.querySelector('meta[name="description"]').content,
          clientWidth:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,
          sections:[...main.querySelectorAll(':scope > section')].map(s=>s.getAttribute('aria-labelledby')),
          h1:main.querySelectorAll('h1').length,missions:main.querySelectorAll('[data-about-missions] > li').length,values:main.querySelectorAll('[data-about-values] > article').length,
          text:main.innerText,links:[...main.querySelectorAll('a')].map(a=>a.getAttribute('href')),
          progress:main.querySelectorAll('progress,[role="progressbar"]').length,
          active:!!document.querySelector('header a[aria-current="page"][href="/${locale}/about"]'),
          clipped:[...main.querySelectorAll('h1,h2,h3,p,a')].filter(el=>{const r=el.getBoundingClientRect();return r.left < -1 || r.right > innerWidth+1}).map(el=>el.textContent),
          fonts:document.fonts.status==='loaded'
        };
      })()`);
      assert.equal(info.lang,locale);
      if (info.scrollWidth>info.clientWidth+1) {console.log({locale,width,clientWidth:info.clientWidth,scrollWidth:info.scrollWidth,clipped:info.clipped});await screenshot("overflow-diagnostic");}
      assert.ok(info.scrollWidth<=info.clientWidth+1,`${locale} ${width}: overflow`);
      assert.deepEqual(info.sections,order); assert.equal(info.h1,1); assert.equal(info.missions,5); assert.equal(info.values,4); assert.equal(info.progress,0);
      assert.ok(info.active && info.fonts); assert.deepEqual(info.clipped,[]);
      assert.ok(info.title.includes("Anggun AR Sukses Abadi") && info.title.includes(locale==="id"?"Tentang Kami":"About Us"));
      assert.ok(info.description.length>60);
      assert.ok(info.text.includes("Beyond Destinations, Creating Memories"));
      assert.ok(info.text.includes(locale==="id"?"Lebih dari Sekadar Destinasi, Menciptakan Kenangan":"To become a trusted, professional, and customer-focused travel company"));
      assert.ok(!/\d+\s*%/.test(info.text),"No fabricated percentage claims");
      assert.ok(info.links.includes(`/${locale}/packages`) && info.links.includes(`/${locale}/contact`));
      if ([320,390,1440].includes(width)) {await screenshot(`${locale}-${width}-viewport`);await screenshot(`${locale}-${width}-full`,true);}
      results.push({locale,width,sections:info.sections.length,missions:info.missions,values:info.values,overflow:false});
      console.log(`PASS ${locale}/about ${width}px: 8 sections, 5 missions, 4 values, metadata, no overflow`);
    }
  }
  await send("Emulation.setDeviceMetricsOverride",{width:390,height:844,deviceScaleFactor:1,mobile:false});
  await navigate("/id/about");
  await click('header a[hreflang="en"]');
  assert.equal(await evaluate("location.pathname"),"/en/about"); assert.equal(await evaluate("document.documentElement.lang"),"en");
  await click('header a[hreflang="id"]'); assert.equal(await evaluate("location.pathname"),"/id/about");
  await evaluate("document.querySelector('summary').focus()"); await key("Enter","Enter",13);
  assert.ok(await evaluate("document.querySelector('details').open")); await key("Escape","Escape",27);
  assert.ok(await evaluate("!document.querySelector('details').open && document.activeElement.tagName==='SUMMARY'"));
  // Fokuskan CTA di dalam section, lalu aktifkan memakai Enter.
  await evaluate("document.querySelector('section[aria-labelledby=\"about-cta\"] a').scrollIntoView({block:'center',behavior:'instant'});document.querySelector('section[aria-labelledby=\"about-cta\"] a').focus()");
  await key("Enter","Enter",13); await delay(350);
  assert.equal(await evaluate("location.pathname"),"/id/packages");
  await navigate("/en/about"); await click('section[aria-labelledby="about-cta"] a[href="/en/contact"]');
  assert.equal(await evaluate("location.pathname"),"/en/contact");
  await navigate("/id/about");
  await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
  assert.equal(await evaluate("getComputedStyle(document.documentElement).scrollBehavior"),"auto");
  assert.deepEqual(errors,[]);
  await writeFile("artifacts/about/browser-results.json",JSON.stringify({results,interactions:["ID→EN→ID about","menu Enter/Escape","keyboard CTA to packages","contact CTA","reduced motion"],errors},null,2));
  console.log("PASS About language switch, keyboard/mobile navigation, CTA routes, reduced motion, no runtime/hydration errors");
} finally {
  await fetch(`${debug}/json/close/${tab.id}`).catch(()=>{}); socket.close();
}
