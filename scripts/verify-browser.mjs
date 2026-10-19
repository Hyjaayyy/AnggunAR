import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

// Menggunakan Chrome/Edge terpasang dengan remote debugging lokal; tanpa dependency npm.
const debugBase = process.env.BROWSER_DEBUG_URL ?? "http://127.0.0.1:9222";
const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const tab = await fetch(`${debugBase}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let nextId = 0;
const pending = new Map();
const runtimeErrors = [];
const consoleErrors = [];
let onPageLoad;
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === "Page.loadEventFired") onPageLoad?.();
  if (message.id) {
    const item = pending.get(message.id);
    if (item) {
      clearTimeout(item.timeout);
      pending.delete(message.id);
      if (message.error) item.reject(new Error(JSON.stringify(message.error)));
      else item.resolve(message.result);
    }
  }
  if (message.method === "Runtime.exceptionThrown") runtimeErrors.push(message.params.exceptionDetails);
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") consoleErrors.push(message.params.args.map((arg) => arg.value ?? arg.description).join(" "));
});
function send(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout: ${method}`)); }, 15000);
    pending.set(id, { resolve, reject, timeout });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
async function ready() {
  await evaluate(`new Promise((resolve, reject) => {
    const start = Date.now();
    const check = async () => {
      if (document.readyState === 'complete' && document.querySelector('main h1')) {
        await document.fonts.ready; requestAnimationFrame(() => requestAnimationFrame(resolve));
      } else if (Date.now() - start > 10000) reject(new Error('Page readiness timeout'));
      else setTimeout(check, 75);
    }; check();
  })`);
  // Beri kesempatan handler React selesai hydration setelah navigasi.
  await evaluate("new Promise(resolve => setTimeout(resolve, 250))");
}
async function navigate(path) {
  let timeout;
  const loaded = new Promise((resolve, reject) => {
    timeout = setTimeout(() => reject(new Error(`Load timeout: ${path}`)), 12000);
    onPageLoad = resolve;
  });
  try { await send("Page.navigate", { url: new URL(path, base).href }); await loaded; await ready(); }
  finally { clearTimeout(timeout); onPageLoad = undefined; }
}
async function loadLazyImages() {
  await evaluate(`(async () => {
    for (let y=0; y<document.documentElement.scrollHeight; y+=innerHeight) { scrollTo({top:y,behavior:'instant'}); await new Promise(r=>setTimeout(r,70)); }
    await Promise.all([...document.images].map(i => i.complete ? Promise.resolve() : new Promise(r=>{i.addEventListener('load',r,{once:true});i.addEventListener('error',r,{once:true});})));
    scrollTo({top:0,behavior:'instant'}); await new Promise(r=>setTimeout(r,100));
  })()`);
}
async function click(selector) {
  const rect = await evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) throw new Error('Missing click target'); const r = el.getBoundingClientRect(); return { x:r.x+r.width/2, y:r.y+r.height/2 }; })()`);
  await send("Input.dispatchMouseEvent", { type: "mousePressed", ...rect, button: "left", clickCount: 1 });
  await send("Input.dispatchMouseEvent", { type: "mouseReleased", ...rect, button: "left", clickCount: 1 });
}
async function key(key, code, windowsVirtualKeyCode) {
  await send("Input.dispatchKeyEvent", { type: key === "Enter" ? "keyDown" : "rawKeyDown", key, code, windowsVirtualKeyCode, ...(key === "Enter" ? { text: "\r" } : {}) });
  await send("Input.dispatchKeyEvent", { type: "keyUp", key, code, windowsVirtualKeyCode });
  await evaluate("new Promise(resolve => requestAnimationFrame(resolve))");
}
async function screenshot(name, fullPage = false) {
  const params = { format: "png", captureBeyondViewport: fullPage };
  if (fullPage) { const metrics = await send("Page.getLayoutMetrics"); params.clip = { x:0, y:0, width:metrics.cssContentSize.width, height:metrics.cssContentSize.height, scale:1 }; }
  const result = await send("Page.captureScreenshot", params);
  await writeFile(`artifacts/phase2/${name}.png`, Buffer.from(result.data, "base64"));
}

const results = [];
try {
  await mkdir("artifacts/phase2", { recursive: true });
  await send("Page.enable"); await send("Runtime.enable");
  await send("Page.bringToFront");
  await send("Emulation.setFocusEmulationEnabled", { enabled: true });
  for (const width of process.argv.includes("--interactions-only") ? [] : [320, 390, 430, 768, 1024, 1440, 1920]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
    for (const locale of ["id", "en"]) {
      await navigate(`/${locale}`);
      await loadLazyImages();
      const result = await evaluate(`({
        width: innerWidth, clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
        lang: document.documentElement.lang,
        h1: document.querySelectorAll('h1').length,
        sections: document.querySelectorAll('main > section').length,
        images: [...document.images].every(i => i.complete && i.naturalWidth > 0),
        fonts: document.fonts.size >= 2 && document.fonts.status === 'loaded',
        bodyFont: getComputedStyle(document.body).fontFamily,
        headingFont: getComputedStyle(document.querySelector('h1')).fontFamily,
        clippedLinks: [...document.querySelectorAll('a')].filter(a => a.getClientRects().length && !a.closest('details:not([open])') && !a.classList.contains('sr-only')).filter(a => { const r=a.getBoundingClientRect(); return r.left < -1 || r.right > innerWidth + 1; }).map(a => ({text:a.textContent, x:a.getBoundingClientRect().x, width:a.getBoundingClientRect().width}))
      })`);
      assert.ok(result.scrollWidth <= result.clientWidth + 1, `${locale} ${width}: horizontal overflow (${result.scrollWidth}/${result.clientWidth})`);
      assert.equal(result.lang, locale); assert.equal(result.h1, 1); assert.equal(result.sections, 7);
      assert.ok(result.images, `${locale} ${width}: images loaded`);
      assert.ok(result.fonts, `${locale} ${width}: fonts loaded`);
      assert.deepEqual(result.clippedLinks, [], `${locale} ${width}: links within viewport`);
      results.push({ locale, width, ...result });
      console.log(`PASS ${locale} ${width}px: no horizontal overflow, 7 sections, images and links`);
      if (width === 1440 || width === 390 || (width === 320 && locale === "en")) {
        await screenshot(`${locale}-${width}-viewport`);
        await screenshot(`${locale}-${width}-full`, true);
      }
      await navigate(`/${locale}/packages`);
      assert.ok(await evaluate("document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1"), `placeholder ${locale} ${width}: overflow`);
      assert.ok(await evaluate(`!!document.querySelector('a[aria-current="page"][href="/${locale}/packages"]')`), "active navigation");
    }
  }

  await send("Emulation.setDeviceMetricsOverride", { width:390, height:844, deviceScaleFactor:1, mobile:false });
  await navigate("/id");
  await evaluate("document.querySelector('summary').focus()");
  await key("Enter", "Enter", 13);
  console.log("Keyboard menu state:", await evaluate("({focused:document.activeElement.tagName,open:document.querySelector('details').open,hasFocus:document.hasFocus()})"));
  assert.ok(await evaluate("document.querySelector('details').open"), "keyboard opens menu");
  await screenshot("id-390-menu");
  await key("Escape", "Escape", 27);
  assert.ok(await evaluate("!document.querySelector('details').open && document.activeElement.tagName === 'SUMMARY'"), "Escape closes menu and restores focus");
  await click("summary");
  assert.ok(await evaluate("document.querySelector('details').open"), "pointer opens menu");
  await click('#mobile-navigation a[href="/id/packages"]');
  await ready();
  assert.equal(await evaluate("location.pathname"), "/id/packages");
  assert.ok(await evaluate("!document.querySelector('details').open"), "menu closes after navigation");
  await click('header a[hreflang="en"]'); await ready();
  assert.equal(await evaluate("location.pathname"), "/en/packages");
  assert.equal(await evaluate("document.documentElement.lang"), "en");
  await click('header a[hreflang="id"]'); await ready();
  assert.equal(await evaluate("location.pathname"), "/id/packages");
  await click("summary");
  await click('#mobile-navigation button');
  assert.ok(await evaluate("!document.querySelector('details').open"), "close button");
  await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
  assert.equal(await evaluate("getComputedStyle(document.documentElement).scrollBehavior"), "auto");
  assert.deepEqual(runtimeErrors, [], "runtime errors");
  assert.deepEqual(consoleErrors, [], "console/hydration errors");
  const report = { results, interactions: ["keyboard open", "Escape and focus", "pointer open", "route click and menu close", "ID→EN→ID on packages", "close button", "reduced motion"], runtimeErrors, consoleErrors };
  await writeFile("artifacts/phase2/browser-results.json", JSON.stringify(report, null, 2));
  console.log("PASS mobile menu, active state, language switcher, reduced motion; no runtime/console hydration errors.");
} finally {
  await fetch(`${debugBase}/json/close/${tab.id}`).catch(() => {});
  socket.close();
}
