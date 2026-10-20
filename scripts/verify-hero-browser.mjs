import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const debug = process.env.BROWSER_DEBUG_URL ?? "http://127.0.0.1:9222";
const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const tab = await fetch(`${debug}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once:true }); socket.addEventListener("error", reject, { once:true }); });
let id = 0;
let onLoad;
const pending = new Map();
const errors = [];
const results = [];
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === "Page.loadEventFired") onLoad?.();
  if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails);
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") errors.push(message.params.args.map((a) => a.value ?? a.description));
  const request = pending.get(message.id);
  if (request) {
    clearTimeout(request.timeout); pending.delete(message.id);
    if (message.error) request.reject(new Error(JSON.stringify(message.error)));
    else request.resolve(message.result);
  }
});
function send(method, params = {}) {
  const requestId = ++id;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { pending.delete(requestId); reject(new Error(`CDP timeout ${method}`)); }, 20000);
    pending.set(requestId, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id:requestId, method, params }));
  });
}
async function evaluate(expression) {
  const response = await send("Runtime.evaluate", { expression, returnByValue:true, awaitPromise:true });
  if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails));
  return response.result.value;
}
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function navigate(path) {
  let timeout;
  const loaded = new Promise((resolve, reject) => { onLoad = resolve; timeout = setTimeout(() => reject(new Error("Page load timeout")), 12000); });
  try { await send("Page.navigate", { url:new URL(path, base).href }); await loaded; }
  finally { clearTimeout(timeout); onLoad = undefined; }
  await evaluate("document.fonts.ready");
  await delay(300);
}
async function click(selector) {
  const point = await evaluate(`(() => { const el=document.querySelector(${JSON.stringify(selector)}); if(!el) throw new Error('Missing click target'); el.scrollIntoView({block:'center',behavior:'instant'}); const r=el.getBoundingClientRect(); return {x:r.x+r.width/2,y:r.y+r.height/2}; })()`);
  await send("Input.dispatchMouseEvent", { type:"mouseMoved", ...point });
  await send("Input.dispatchMouseEvent", { type:"mousePressed", ...point, button:"left", clickCount:1 });
  await send("Input.dispatchMouseEvent", { type:"mouseReleased", ...point, button:"left", clickCount:1 });
  await delay(80);
}
async function release() {
  await evaluate("document.activeElement?.blur(); scrollTo({top:0,behavior:'instant'})");
  await send("Input.dispatchMouseEvent", { type:"mouseMoved", x:3, y:3 });
  await delay(80);
}
async function state() { return evaluate("({index:Number(document.querySelector('[data-active-slide]')?.dataset.activeSlide),running:document.querySelector('[data-autoplay]')?.dataset.autoplay,timers:window.__heroTimers.size, listeners:window.__heroVisibility.size})"); }
function pass(message) { results.push(message); console.log(`PASS ${message}`); }
async function snapshot(name) {
  const shot = await send("Page.captureScreenshot", { format:"png" });
  await writeFile(`artifacts/hero/${name}.png`, Buffer.from(shot.data, "base64"));
}

try {
  await mkdir("artifacts/hero", { recursive:true });
  await send("Page.enable"); await send("Runtime.enable"); await send("Page.bringToFront");
  await send("Emulation.setFocusEmulationEnabled", { enabled:true });
  // Instrumentasi sebelum hydration untuk membuktikan satu timer dan cleanup saat unmount.
  await send("Page.addScriptToEvaluateOnNewDocument", { source:`(() => {
    window.__heroTimers=new Set(); window.__heroVisibility=new Set();
    const originalSet=window.setTimeout.bind(window), originalClear=window.clearTimeout.bind(window);
    window.setTimeout=(callback,ms,...args)=>{
      if(ms!==7000 || typeof callback!=='function') return originalSet(callback,ms,...args);
      let handle; handle=originalSet(()=>{window.__heroTimers.delete(handle);callback(...args)},ms);
      window.__heroTimers.add(handle);return handle;
    };
    window.clearTimeout=(handle)=>{window.__heroTimers.delete(handle);return originalClear(handle)};
    const add=document.addEventListener.bind(document),remove=document.removeEventListener.bind(document);
    document.addEventListener=(name,callback,...args)=>{if(name==='visibilitychange')window.__heroVisibility.add(callback);return add(name,callback,...args)};
    document.removeEventListener=(name,callback,...args)=>{if(name==='visibilitychange')window.__heroVisibility.delete(callback);return remove(name,callback,...args)};
  })()` });
  for (const width of [320, 390, 430, 768, 1024, 1440, 1920]) {
    await send("Emulation.setDeviceMetricsOverride", { width,height:900,deviceScaleFactor:1,mobile:false });
    for (const locale of ["id", "en"]) {
      await navigate(`/${locale}`);
      const box = await evaluate(`(() => {
        const hero=document.querySelector('[data-active-slide]');
        const slide=hero.querySelector('.hero-slide-active');
        const rect=hero.getBoundingClientRect();
        const content=slide.querySelector('.hero-slide-content').getBoundingClientRect();
        const controls=hero.querySelector('.hero-controls').getBoundingClientRect();
        const cta=slide.querySelector('a').getBoundingClientRect();
        return {width:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth,height:rect.height,fullWidth:Math.abs(rect.width-document.documentElement.clientWidth)<1,
          ctaVisible:cta.bottom<=controls.top+1,contentWithin:content.top>=rect.top && content.bottom<=rect.bottom,
          hiddenInert:[...hero.querySelectorAll('.hero-slide:not(.hero-slide-active)')].every(s=>s.inert && s.getAttribute('aria-hidden')==='true'),h1:document.querySelectorAll('h1').length,
          ctaPath:slide.querySelector('a').getAttribute('href'),sections:document.querySelectorAll('main > section').length};
      })()`);
      assert.ok(box.scroll <= box.width + 1 && box.fullWidth && box.ctaVisible && box.contentWithin, `${locale} ${width}: ${JSON.stringify(box)}`);
      assert.ok(box.hiddenInert); assert.equal(box.h1,1); assert.equal(box.sections,7); assert.equal(box.ctaPath,`/${locale}/destinations`);
      if ([320,390,1440].includes(width)) await snapshot(`${locale}-${width}`);
      for (const slideId of ["experience", "escape"]) {
        await evaluate(`document.querySelector('.hero-controls button[aria-controls="hero-slide-${slideId}"]').click()`);
        await delay(80);
        const slideLayout = await evaluate(`(() => {
          const hero=document.querySelector('[data-active-slide]');
          const content=hero.querySelector('.hero-slide-active a').getBoundingClientRect();
          return {height:hero.getBoundingClientRect().height,ctaBottom:content.bottom,controlsTop:hero.querySelector('.hero-controls').getBoundingClientRect().top};
        })()`);
        assert.equal(slideLayout.height,box.height,`${locale} ${width} ${slideId}: stable height`);
        assert.ok(slideLayout.ctaBottom<=slideLayout.controlsTop+1,`${locale} ${width} ${slideId}: CTA overlaps controls`);
      }
      pass(`${locale} ${width}px: full width, no overflow/overlap, inert slides, single h1, 7 sections`);
    }
  }

  if (!process.argv.includes("--layout-only")) {
  await send("Emulation.setDeviceMetricsOverride", { width:1440,height:900,deviceScaleFactor:1,mobile:false });
  await navigate("/id"); await release();
  const originalHeight = await evaluate("document.querySelector('[data-active-slide]').getBoundingClientRect().height");
  assert.equal((await state()).running,"running"); assert.equal((await state()).timers,1);
  await delay(7250);
  assert.equal((await state()).index,1); assert.equal((await state()).timers,1);
  pass("real 7-second autoplay advances once, maintains one timer");

  await send("Input.dispatchMouseEvent", { type:"mouseMoved",x:100,y:300 }); await delay(80);
  let before = (await state()).index;
  assert.equal((await state()).timers,0); await delay(7200); assert.equal((await state()).index,before);
  pass("hover pauses and clears timer for longer than autoplay interval");
  await release();
  await evaluate("document.querySelector('.hero-controls button').focus()"); await delay(80);
  before=(await state()).index; assert.equal((await state()).timers,0); await delay(7200); assert.equal((await state()).index,before);
  pass("focus pauses autoplay");

  await click('.hero-controls button[aria-label="Slide berikutnya"]');
  assert.equal((await state()).index,2);
  assert.equal(await evaluate("document.querySelector('.hero-slide-active a').getAttribute('href')"),"/id/contact");
  await click('.hero-controls button[aria-label="Slide berikutnya"]'); assert.equal((await state()).index,0);
  await click('.hero-controls button[aria-label="Slide sebelumnya"]'); assert.equal((await state()).index,2);
  await click('.hero-controls button[aria-controls="hero-slide-experience"]'); assert.equal((await state()).index,1);
  assert.equal(await evaluate("document.querySelector('.hero-slide-active a').getAttribute('href')"),"/id/packages");
  assert.equal(await evaluate("document.querySelector('[data-active-slide]').getBoundingClientRect().height"),originalHeight);
  pass("Next/Previous wrap, indicators and CTA routes work without hero height shift");

  await evaluate("document.querySelector('.hero-controls button').focus()");
  await send("Input.dispatchKeyEvent", {type:"rawKeyDown",key:"ArrowLeft",code:"ArrowLeft",windowsVirtualKeyCode:37});
  await send("Input.dispatchKeyEvent", {type:"keyUp",key:"ArrowLeft",code:"ArrowLeft",windowsVirtualKeyCode:37}); await delay(80);
  assert.equal((await state()).index,0);
  assert.ok(await evaluate("(() => {const a=document.querySelector('.hero-slide[aria-hidden=\"true\"] a');a.focus();return document.activeElement!==a})()"));
  pass("keyboard arrow navigation works; hidden CTA cannot receive focus");

  await click('.hero-controls button[aria-label="Jeda pergantian otomatis"]'); await release();
  before=(await state()).index; assert.equal((await state()).running,"paused"); await delay(7200); assert.equal((await state()).index,before);
  await click('.hero-controls button[aria-label="Aktifkan pergantian otomatis"]'); await release();
  assert.equal((await state()).running,"running"); await delay(7250); assert.equal((await state()).index,(before+1)%3);
  pass("Pause persists after leaving controls; Play resumes autoplay");

  await evaluate("Object.defineProperty(document,'visibilityState',{configurable:true,get:()=> 'hidden'});document.dispatchEvent(new Event('visibilitychange'))");
  await delay(80); assert.equal((await state()).timers,0);
  before=(await state()).index; await delay(7200); assert.equal((await state()).index,before);
  await evaluate("delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'))"); await delay(80);
  assert.equal((await state()).running,"running");
  pass("visibilitychange hidden event clears timer; visible resumes (simulated visibility state)");

  await send("Emulation.setEmulatedMedia", {features:[{name:"prefers-reduced-motion",value:"reduce"}]}); await delay(80);
  assert.equal((await state()).timers,0);
  assert.equal(await evaluate("getComputedStyle(document.querySelector('.hero-slide')).transitionDuration"),"0s");
  assert.ok(await evaluate("document.querySelector('.hero-controls button[disabled]')!==null"));
  before=(await state()).index; await delay(7200); assert.equal((await state()).index,before);
  await click('.hero-controls button[aria-label="Slide berikutnya"]'); assert.equal((await state()).index,(before+1)%3);
  pass("reduced motion disables autoplay/fade while keeping manual navigation");

  await send("Emulation.setEmulatedMedia", {features:[{name:"prefers-reduced-motion",value:"no-preference"}]});
  await release();
  const listenersBefore=(await state()).listeners;
  await evaluate("document.querySelector('.hero-slide-active a').click()"); await delay(500);
  assert.equal(await evaluate("document.querySelector('[data-active-slide]')"),null);
  const cleaned=await evaluate("({timers:window.__heroTimers.size,listeners:window.__heroVisibility.size})");
  assert.equal(cleaned.timers,0); assert.ok(cleaned.listeners<listenersBefore);
  pass("client navigation unmount cleans carousel timeout and visibility listener");
  }
  assert.deepEqual(errors,[]);
  pass("no runtime/console hydration errors during tested scenarios");
  await writeFile(`artifacts/hero/${process.argv.includes("--layout-only") ? "layout-results" : "results"}.json`,JSON.stringify({results,errors},null,2));
} finally {
  await fetch(`${debug}/json/close/${tab.id}`).catch(()=>{});
  socket.close();
}
