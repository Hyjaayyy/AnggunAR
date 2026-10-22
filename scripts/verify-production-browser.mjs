import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { browserSession } from "./lib/browser-session.mjs";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3100";
const label = process.env.BROWSER_LABEL ?? "chromium";
const browser = await browserSession();
const { send, evaluate, navigate, delay, until } = browser;
const results = [];
const instrumentation = `window.__qaVitals={lcp:null,cls:0,events:[],longTasks:[]};
for(const type of ['largest-contentful-paint','layout-shift','event','longtask'])try{new PerformanceObserver(list=>{for(const e of list.getEntries()){if(type==='largest-contentful-paint')window.__qaVitals.lcp=e.startTime;if(type==='layout-shift'&&!e.hadRecentInput)window.__qaVitals.cls+=e.value;if(type==='event'&&e.interactionId)window.__qaVitals.events.push({name:e.name,duration:e.duration,interactionId:e.interactionId});if(type==='longtask')window.__qaVitals.longTasks.push(e.duration)}}).observe({type,buffered:true,...(type==='event'?{durationThreshold:16}:{})})}catch{}`;
try {
  await mkdir("artifacts/production-readiness", { recursive: true });
  await send("Page.addScriptToEvaluateOnNewDocument", { source: instrumentation });
  for (const width of [390, 768, 1440]) for (const locale of ["id", "en"]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 1000, deviceScaleFactor: 1, mobile: width === 390 });
    await send("Network.setCacheDisabled", { cacheDisabled: true });
    await navigate(`${base}/${locale}`); await delay(1200);
    assert.equal(await evaluate("document.querySelectorAll('main > section').length"), 8);
    assert.equal(await evaluate("document.querySelectorAll('main h1').length"), 1);
    await evaluate("document.querySelector('a[href=\"#main-content\"]').focus()");
    const focus = await evaluate("getComputedStyle(document.activeElement).outlineStyle"); assert.notEqual(focus, "none");
    // Real keyboard activation of skip link.
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r" });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    await until("document.activeElement.id==='main-content'", "skip link focus");
    await evaluate("document.querySelector('[data-cinematic-frame]').scrollIntoView({block:'center',behavior:'instant'})");
    await until("document.querySelector('[data-cinematic-video]').videoWidth===1920 && document.querySelector('[data-cinematic-video]').currentTime>0", "cinematic decode");
    const t = await evaluate("document.querySelector('[data-cinematic-video]').currentTime"); await delay(500);
    assert.ok(await evaluate(`document.querySelector('[data-cinematic-video]').currentTime>${t}`));
    const metrics = await evaluate(`({vitals:window.__qaVitals,resources:performance.getEntriesByType('resource').map(e=>({name:new URL(e.name).pathname,type:e.initiatorType,transfer:e.transferSize,decoded:e.decodedBodySize,duration:e.duration})),navigation:performance.getEntriesByType('navigation').map(e=>({ttfb:e.responseStart,domContentLoaded:e.domContentLoadedEventEnd,load:e.loadEventEnd})),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,broken:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length})`);
    assert.equal(metrics.overflow, false); assert.equal(metrics.broken, 0);
    await evaluate("window.__qaClientMarker='preserved';document.querySelector('header a[href=\"/" + locale + "/contact\"]').click()");
    await until(`location.pathname==='/${locale}/contact' && !!document.querySelector('main h1')`, "contact CTA");
    assert.equal(await evaluate("document.querySelectorAll('main input,main textarea,main form').length"), 0, "No collection before privacy/storage approval");
    await evaluate(`document.querySelector('header a[hreflang="${locale === "id" ? "en" : "id"}"]').click()`);
    await until(`location.pathname==='/${locale === "id" ? "en" : "id"}/contact'`, "contact language switch");
    assert.equal(await evaluate("window.__qaClientMarker"), "preserved");
    // A malicious query must remain text, never create an executable element.
    await navigate(`${base}/${locale}/destinations?q=${encodeURIComponent('\"><img src=x onerror="window.__qaXss=1">')}`);
    assert.equal(await evaluate("window.__qaXss??null"), null);
    assert.equal(await evaluate("document.querySelectorAll('main img[src=x]').length"), 0);
    await navigate(`${base}/${locale}/destinations/nongsa-beach`);
    await send("Page.reload", { ignoreCache: true });
    await until("document.readyState==='complete' && !!document.querySelector('main h1')", "detail reload");
    assert.ok((await evaluate("document.querySelector('main h1').textContent")).includes(locale === "id" ? "Nongsa" : "Nongsa"));
    await navigate(`${base}/${locale}/gallery`);
    assert.equal(await evaluate("document.querySelectorAll('[data-gallery-open]').length"), 0, "Honest gallery empty state");
    const shot = await send("Page.captureScreenshot", { format: "png" });
    await writeFile(`artifacts/production-readiness/${label}-${locale}-${width}.png`, Buffer.from(shot.data, "base64"));
    results.push({ locale, width, metrics, clientNavigation: true, keyboardSkip: true, reloadDetail: true, xssQuery: "escaped" });
    console.log(`PASS ${label} production ${locale} ${width}: keyboard/CTA/language/reload/media/XSS; LCP=${metrics.vitals.lcp}ms CLS=${metrics.vitals.cls}`);
  }
  const failedResponses = browser.responses.filter(response => response.status >= 400).map(response => ({ url: response.url, status: response.status }));
  await writeFile(`artifacts/production-readiness/browser-${label}.json`, JSON.stringify({ base, label, results, errors: browser.errors, networkFailures: browser.networkFailures, failedResponses }, null, 2));
  assert.deepEqual(browser.errors, []);
  assert.deepEqual(browser.networkFailures, []);
  assert.deepEqual(failedResponses, []);
} finally { await browser.close(); }
