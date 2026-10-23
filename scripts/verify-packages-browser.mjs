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
async function until(expression) {
  for (let attempt=0;attempt<600;attempt++) { if (await evaluate(expression)) return; await delay(100); }
  throw new Error(`Condition timeout: ${expression}`);
}
async function navigate(path) {
  let timeout;
  const load = new Promise((resolve,reject) => { loaded=resolve; timeout=setTimeout(()=>reject(new Error(`Page timeout ${path}`)),process.env.TEST_PREVIEW === "1" ? 60000 : 12000); });
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
  await writeFile(`artifacts/phase3/${name}.png`,Buffer.from(shot.data,"base64"));
}

try {
  await mkdir("artifacts/phase3", { recursive: true });
  await send("Page.enable"); await send("Runtime.enable");
  const preview = process.env.TEST_PREVIEW === "1";
  for (const width of [320,390,768,1024,1440,1920]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
    for (const locale of ["id", "en"]) {
      for (const suffix of preview ? ["/packages?preview=draft", "/packages/batam-city-escape?preview=draft"] : ["/packages", "/packages/batam-city-highlights"]) {
        await navigate(`/${locale}${suffix}`);
        const info = await evaluate(`(() => ({
          width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,
          h1:document.querySelectorAll('main h1').length,lang:document.documentElement.lang,
          photos:document.querySelectorAll('main [data-package-photo]').length,
          cards:document.querySelectorAll('main article').length,
          columns:getComputedStyle(document.querySelector('main article')?.parentElement ?? document.querySelector('main')).gridTemplateColumns,
          broken:[...document.images].filter(i=>i.complete && i.naturalWidth===0).length,
          clipped:[...document.querySelectorAll('main h1,main h2,main h3,main p,main input,main select')].filter(e=>{const r=e.getBoundingClientRect();return !e.closest('[data-package-carousel]') && (r.left < -1 || r.right > innerWidth+1)}).map(e=>e.textContent)
        }))()`);
        assert.equal(info.lang, locale); assert.equal(info.h1,1);
        assert.ok(info.scroll <= info.width + 1, `Overflow ${locale} ${width} ${suffix}`);
        assert.deepEqual(info.clipped, []); assert.equal(info.broken, 0);
        if (!preview) {
          assert.equal(info.photos, suffix.includes("batam-city-highlights") ? 3 : 6);
          assert.equal(info.cards, suffix.includes("batam-city-highlights") ? 0 : 6);
        }
        if (preview) {
          assert.equal(info.photos, suffix.includes("batam-city") ? 3 : 9);
          if (!suffix.includes("batam-city")) assert.equal(info.columns.split(" ").length, width >= 1280 ? 3 : width >= 768 ? 2 : 1);
        }
        if ([390,1440].includes(width)) await screenshot(`${preview ? "preview" : "public"}-${locale}-${width}-${suffix.includes("batam-city") ? "detail" : "listing"}`,true);
        results.push({locale,width,suffix,...info});
      }
    }
  }
  if (preview) {
    await navigate("/id/packages?preview=draft&q=COASTAL&category=coast");
    assert.equal(await evaluate("document.querySelectorAll('main article').length"),1);
    await until("new URL(document.querySelector('header a[hreflang=\"en\"]').href).searchParams.get('q')===new URLSearchParams(location.search).get('q')");
    await click('header a[hreflang="en"]');
    await until("location.pathname==='/en/packages' && document.documentElement.lang==='en'");
    assert.equal(await evaluate("location.pathname"),"/en/packages");
    assert.equal(await evaluate("new URLSearchParams(location.search).get('q')"),"COASTAL");
    assert.equal(await evaluate("new URLSearchParams(location.search).get('category')"),"coast");
    assert.equal(await evaluate("document.querySelectorAll('main article').length"),1);
    await click('main article a');
    await until("location.pathname==='/en/packages/coastal-slow-days' && document.querySelectorAll('main [data-package-photo]').length===3");
    assert.equal(await evaluate("location.pathname"),"/en/packages/coastal-slow-days");
    assert.equal(await evaluate("document.querySelectorAll('main [data-package-photo]').length"),3);
    await click('header a[hreflang="id"]');
    await until("location.pathname==='/id/packages/coastal-slow-days' && document.documentElement.lang==='id'");
    assert.equal(await evaluate("location.pathname"),"/id/packages/coastal-slow-days");
    assert.equal(await evaluate("new URLSearchParams(location.search).get('preview')"),"draft");
    await navigate("/id/packages?preview=draft");
    await evaluate("document.querySelector('input[name=q]').value='batam';document.querySelector('input[name=q]').focus()");
    await key("Enter","Enter",13); await delay(700);
    await until("new URLSearchParams(location.search).get('q')==='batam' && document.querySelectorAll('main article').length===5");
    assert.equal(await evaluate("document.querySelectorAll('main article').length"),5);
    await evaluate("document.querySelector('select[name=category]').value='coast';document.querySelector('button[type=submit]').click()"); await delay(700);
    await until("new URLSearchParams(location.search).get('category')==='coast' && document.querySelectorAll('main article').length===0");
    assert.equal(await evaluate("document.querySelectorAll('main article').length"),0);
    await click('main form a');
    await until("document.querySelectorAll('main article').length===9");
    assert.equal(await evaluate("document.querySelectorAll('main article').length"),9);
    await send("Emulation.setEmulatedMedia",{features:[{name:"prefers-reduced-motion",value:"reduce"}]});
    assert.equal(await evaluate("getComputedStyle(document.documentElement).scrollBehavior"),"auto");
  }
  if (!preview) {
    await navigate("/id/packages?q=batam&destination=batam&duration=1");
    assert.equal(await evaluate("document.querySelectorAll('main article').length"), 1);
    await until("new URL(document.querySelector('header a[hreflang=\"en\"]').href).searchParams.get('q')===new URLSearchParams(location.search).get('q')");
    await click('header a[hreflang="en"]');
    await until("location.pathname==='/en/packages' && document.documentElement.lang==='en'");
    assert.equal(await evaluate("new URLSearchParams(location.search).get('q')"), "batam");
    assert.equal(await evaluate("document.querySelectorAll('main article').length"), 1);
    await click('main article a[href^="/en/packages/"]');
    await until("location.pathname==='/en/packages/batam-city-highlights'");
    await click('header a[hreflang="id"]');
    await until("location.pathname==='/id/packages/batam-city-highlights' && document.documentElement.lang==='id'");
    assert.equal(await evaluate("document.querySelectorAll('main [data-package-photo]').length"), 3);
  }
  assert.deepEqual(errors, []);
  await writeFile(`artifacts/phase3/${preview ? "preview" : "public"}-browser-results.json`, JSON.stringify({results,errors},null,2));
  console.log(`PASS ${results.length} locale/viewport/page combinations; ${preview ? "filter form, reset, language/query, detail navigation, 3 photos, keyboard, reduced motion" : "six public offers and detail"}; no captured console/hydration errors`);
} finally {
  await fetch(`${debug}/json/close/${tab.id}`).catch(()=>{}); socket.close();
}
