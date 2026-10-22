import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const debug = process.env.BROWSER_DEBUG_URL ?? "http://127.0.0.1:9333";
const origins = (process.env.TEST_ORIGINS ?? "http://localhost:3000,http://192.168.1.29:3000").split(",");
const production = process.env.TEST_EXPECT_PRODUCTION === "1";
const tab = await fetch(`${debug}/json/new?about:blank`, { method: "PUT" }).then(r => r.json());
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let id = 0;
const pending = new Map(), errors = [], responses = [], results = [];
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails);
  if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") errors.push(message.params.args);
  if (message.method === "Network.responseReceived" && message.params.response.url.includes("batam-cinematic-h264.mp4")) responses.push(message.params.response);
  const item = pending.get(message.id);
  if (item) { pending.delete(message.id); clearTimeout(item.timer); if (message.error) item.reject(new Error(JSON.stringify(message.error))); else item.resolve(message.result); }
});
function send(method, params = {}) {
  const request = ++id;
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => { pending.delete(request); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
    pending.set(request, { resolve, reject, timer }); socket.send(JSON.stringify({ id: request, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
  return result.result.value;
}
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function until(expression, label) {
  for (let n = 0; n < 200; n++) { if (await evaluate(expression)) return; await delay(100); }
  throw new Error(`Timed out: ${label}`);
}
async function navigate(url) {
  await send("Page.navigate", { url });
  await until(`location.href===${JSON.stringify(url)} && document.readyState==='complete' && !!document.querySelector('[data-cinematic-video]')`, "navigate " + url);
}
const report = () => evaluate("JSON.parse(document.querySelector('[data-video-debug] textarea').value)");
try {
  await mkdir("artifacts/video-debug", { recursive: true });
  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
  await send("Page.bringToFront"); await send("Emulation.setFocusEmulationEnabled", { enabled: true });
  for (const origin of origins) for (const mobile of [false, true]) for (const locale of ["id", "en"]) {
    await send("Emulation.setDeviceMetricsOverride", { width: mobile ? 390 : 1440, height: 1000, deviceScaleFactor: 1, mobile });
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "no-preference" }] });
    await navigate(`${origin}/${locale}`); await delay(900);
    assert.equal(await evaluate("!!document.querySelector('[data-video-debug]')"), false, "No panel without opt-in");
    await navigate(`${origin}/${locale}?videoDebug=1`);
    await evaluate("document.querySelector('[data-cinematic-frame]').scrollIntoView({block:'center',behavior:'instant'})");
    await until("document.querySelector('[data-cinematic-video]').videoWidth>0 && document.querySelector('[data-cinematic-video]').currentTime>0", "moving video");
    if (production) {
      await delay(1000); assert.equal(await evaluate("!!document.querySelector('[data-video-debug]')"), false, "No production debug panel even with opt-in");
      assert.equal(await evaluate("document.querySelector('[data-cinematic-video]').hasAttribute('data-cinematic-diagnostic')"), false);
    } else {
      await until("!!document.querySelector('[data-video-debug] textarea') && JSON.parse(document.querySelector('[data-video-debug] textarea').value).rangeProbe.status===206", "debug report and range probe");
      const start = await report(); await delay(1600); const advanced = await report();
      assert.equal(advanced.videoWidth, 1920); assert.equal(advanced.videoHeight, 1080);
      assert.ok(advanced.decodedFrames > start.decodedFrames); assert.ok(advanced.currentTime > start.currentTime);
      assert.equal(advanced.rangeProbe.contentType, "video/mp4"); assert.match(advanced.rangeProbe.contentRange, /^bytes 0-1023\/10907407$/);
      assert.equal(advanced.presentation.opacity, "1"); assert.equal(advanced.mediaError, null);
      assert.ok(advanced.currentSrc.endsWith("/videos/home/batam-cinematic-h264.mp4"));
      assert.equal(advanced.intersection.isIntersecting, true); assert.equal(advanced.reducedMotion, false);
      // Clipboard is unavailable on insecure LAN HTTP: manual selection must remain usable.
      await evaluate("document.querySelector('[data-video-debug] button').click()"); await delay(200);
      const selected = await evaluate("(()=>{const t=document.querySelector('[data-video-debug] textarea');return {start:t.selectionStart,end:t.selectionEnd,focused:document.activeElement===t}})()");
      if (!advanced.secureContext) { assert.equal(selected.focused, true); assert.ok(selected.end > selected.start); }
      await evaluate("document.querySelector('[data-video-debug] textarea').blur()");
      const shot = await send("Page.captureScreenshot", { format: "png" });
      await writeFile(`artifacts/video-debug/${new URL(origin).hostname}-${locale}-${mobile ? "mobile" : "desktop"}.png`, Buffer.from(shot.data, "base64"));
      results.push({ origin, locale, mobile, start, advanced, selected });
    }
    console.log(`PASS ${production ? "production hidden" : "diagnostics"} ${origin}/${locale} mobile=${mobile}`);
  }
  if (!production) {
    await evaluate("window.__diagnosticVideo=document.querySelector('[data-cinematic-video]');history.pushState(null,'',location.pathname)");
    await until("!document.querySelector('[data-video-debug]')", "panel disappears when query removed");
    await evaluate("history.pushState(null,'',location.pathname+'?videoDebug=1')");
    await until("!!document.querySelector('[data-video-debug]')", "panel returns when query enabled");
    assert.equal(await evaluate("window.__diagnosticVideo===document.querySelector('[data-cinematic-video]')"), true, "Query toggle does not remount video");
    const policy = await send("Page.addScriptToEvaluateOnNewDocument", { source: `const original=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(...args){if(this.hasAttribute('data-cinematic-video'))return Promise.reject(new DOMException('Test policy','NotAllowedError'));return original.apply(this,args)}` });
    await navigate(origins[0] + "/id?videoDebug=1");
    await evaluate("document.querySelector('[data-cinematic-frame]').scrollIntoView({block:'center',behavior:'instant'})");
    await until("!!document.querySelector('[data-video-debug] textarea') && JSON.parse(document.querySelector('[data-video-debug] textarea').value).controller?.lastError==='NotAllowedError'", "report play rejection");
    const rejected = await report(); assert.equal(rejected.paused, true); assert.equal(rejected.presentation.opacity, "0");
    assert.ok(rejected.controllerEvents.some(event => event.event === "play-rejected"));
    results.push({ simulatedPolicyRejection: rejected });
    await send("Page.removeScriptToEvaluateOnNewDocument", { identifier: policy.identifier });
    await send("Emulation.setEmulatedMedia", { features: [{ name: "prefers-reduced-motion", value: "reduce" }] });
    await navigate(origins[0] + "/en?videoDebug=1");
    await until("!!document.querySelector('[data-video-debug] textarea') && JSON.parse(document.querySelector('[data-video-debug] textarea').value).reducedMotion", "report reduced motion");
    const reduced = await report(); assert.equal(reduced.paused, true); assert.equal(reduced.currentSrc, null);
    results.push({ reducedMotion: reduced });
  }
  assert.deepEqual(errors, []);
  assert.ok(responses.every(response => [200, 206].includes(response.status)));
  await writeFile(`artifacts/video-debug/${production ? "production" : "development"}-results.json`, JSON.stringify({ origins, results, responses, errors }, null, 2));
} finally { await fetch(`${debug}/json/close/${tab.id}`).catch(() => {}); socket.close(); }
