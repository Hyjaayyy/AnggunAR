import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const compile = async (file) => ts.transpileModule(await readFile(file, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX } }).outputText;
const code = await compile(process.env.CINEMATIC_CONTROLLER_FILE ?? "src/lib/cinematic-playback.ts");
const tick = async () => { await Promise.resolve(); await Promise.resolve(); await Promise.resolve(); };
function setup({ reduce = false, observer = true, reject = false, deferred = false, abort = false } = {}) {
  const motion = Object.assign(new EventTarget(), { matches: reduce });
  const document = Object.assign(new EventTarget(), { visibilityState: "visible" });
  const window = Object.assign(new EventTarget(), { matchMedia: () => motion, innerHeight: 900, innerWidth: 1200 });
  let intersect, disconnected = false, finish;
  class Observer { constructor(callback) { intersect = callback; } observe() {} disconnect() { disconnected = true; } }
  class Video extends EventTarget {
    paused = true; src = ""; calls = 0; loads = 0; readyState = 0; reject = reject; abort = abort; rect = { top: 1000, bottom: 1500, left: 0, right: 1000 };
    play() { this.calls++; if (this.reject) return Promise.reject(Object.assign(new Error("NotAllowedError"),{name:"NotAllowedError"})); if(this.abort){this.abort=false;return Promise.reject(Object.assign(new Error('Media load interrupted'),{name:'AbortError'}))} if (deferred) return new Promise(resolve => { finish = () => { this.paused = false; this.dispatchEvent(new Event("playing")); resolve(); }; }); this.paused = false; this.dispatchEvent(new Event("playing")); return Promise.resolve(); }
    pause() { if (!this.paused) { this.paused = true; this.dispatchEvent(new Event("pause")); } }
    removeAttribute(name) { if (name === "src") this.src = ""; }
    load() { this.loads++; }
    getBoundingClientRect() { return this.rect; }
  }
  const exports = {};
  vm.runInNewContext(code, { exports, window, document, process:{env:{NODE_ENV:'test'}}, IntersectionObserver: observer ? Observer : undefined });
  const video = new Video(), states = [];
  const control = exports.attachCinematicPlayback(video, "/videos/home/batam-cinematic-h264.mp4", state => states.push(state));
  return { video, control, states, motion, document, window, attach:report=>exports.attachCinematicPlayback(video,'/videos/home/batam-cinematic-h264.mp4',report), intersection:()=>intersect, completion:()=>finish, visible(value) { if (observer) intersect([{ isIntersecting: value, intersectionRatio: value ? 1 : 0 }]); else { video.rect.top = value ? 100 : 1000; window.dispatchEvent(new Event("scroll")); } }, tab(value) { document.visibilityState = value ? "visible" : "hidden"; document.dispatchEvent(new Event("visibilitychange")); }, preference(value) { motion.matches = value; motion.dispatchEvent(new Event("change")); }, finish: () => finish(), disconnected: () => disconnected };
}
{
  const x=setup({deferred:true});x.visible(true);const oldCompletion=x.completion();oldCompletion();x.control.destroy();const next=x.attach(()=>{});x.visible(true);x.finish();await tick();assert.equal(x.video.paused,false,'Disposed controller must not pause a newer controller sharing the element');next.destroy();
}
{
  const x=setup();x.visible(true);await tick();const staleObserver=x.intersection();x.control.destroy();const next=x.attach(()=>{});x.visible(true);await tick();staleObserver([{isIntersecting:false,intersectionRatio:0}]);assert.equal(x.video.paused,false,'Disposed observer cannot affect a new controller');next.destroy();
}
{
  const x=setup({abort:true});x.visible(true);await tick();assert.notEqual(x.states.at(-1)?.blocked,true,'AbortError is an interruption, not an autoplay policy denial');assert.equal(x.video.calls,1,'Do not poll while loading');x.video.readyState=3;x.video.dispatchEvent(new Event('canplay'));await tick();assert.equal(x.video.paused,false,'Resume once after interrupted loading becomes playable');x.control.destroy();
}
{
  const x=setup({abort:true});x.visible(true);await tick();x.video.abort=true;x.video.readyState=3;x.video.dispatchEvent(new Event('canplay'));await tick();assert.equal(x.video.calls,2,'At most one recovery attempt');assert.equal(x.states.at(-1).failed,true);x.visible(false);x.visible(true);x.video.dispatchEvent(new Event('canplay'));assert.equal(x.video.calls,2,'Repeated interruptions cannot trigger infinite retries');x.control.destroy();
}
{
  const x=setup({abort:true});x.visible(true);await tick();x.visible(false);x.video.readyState=3;x.video.dispatchEvent(new Event('canplay'));assert.equal(x.video.calls,1,'Do not recover offscreen');x.preference(true);x.visible(true);assert.equal(x.video.calls,1,'Reduced motion prevents recovery');x.preference(false);await tick();assert.equal(x.video.paused,false);x.control.destroy();
}
{
  const x = setup(); assert.equal(x.video.src, ""); assert.equal(x.video.calls, 0);
  x.visible(true); await tick(); assert.equal(x.video.calls, 1); assert.equal(x.video.muted, true); assert.equal(x.video.loop, true); assert.equal(x.video.playsInline, true); assert.equal(x.video.preload, "none"); assert.equal(x.states.at(-1).playing, true);
  x.visible(false); assert.equal(x.video.paused, true); x.visible(true); await tick(); assert.equal(x.video.calls, 2);
  x.tab(false); assert.equal(x.video.paused, true); x.tab(true); await tick(); assert.equal(x.video.calls, 3);
  assert.equal(x.control.play,undefined);assert.equal(x.control.pause,undefined,'No manual playback API');
  x.control.destroy(); assert.equal(x.disconnected(), true); assert.equal(x.video.src, ""); assert.equal(x.video.paused, true); x.tab(false); x.tab(true); assert.equal(x.video.calls, 3);
}
{
  const x = setup({ reject: true }); x.visible(true); await tick(); assert.equal(x.states.at(-1).blocked, true); x.visible(false); x.visible(true); x.tab(false); x.tab(true); x.preference(true);x.preference(false);assert.equal(x.video.calls, 1, "Rejected autoplay is not forced again"); x.control.destroy();
}
{
  const x = setup({ reduce: true }); x.visible(true); assert.equal(x.video.src, ""); assert.equal(x.video.calls, 0); x.preference(false); await tick(); assert.equal(x.video.paused,false);x.preference(true);assert.equal(x.video.paused,true); x.control.destroy();
}
{
  const x = setup(); x.visible(true); await tick(); x.video.dispatchEvent(new Event("error")); assert.equal(x.states.at(-1).failed, true); assert.equal(x.video.src, ""); assert.equal(x.video.paused, true); const count = x.video.calls; x.visible(true); assert.equal(x.video.calls, count); x.control.destroy();
}
{
  const x = setup({ deferred: true }); x.visible(true); x.visible(false); x.finish(); await tick(); assert.equal(x.video.paused, true, "Late play promise cannot resume offscreen"); x.control.destroy();
}
{
  const x = setup({ observer: false }); assert.equal(x.video.calls, 0); x.visible(true); await tick(); assert.equal(x.video.paused, false); x.visible(false); assert.equal(x.video.paused, true); x.control.destroy();
}
console.log("PASS automatic-only controller: lazy source, viewport/tab pause, rejection without retry, reduced motion, fallback, race and cleanup");

const resolverCode = await compile("src/lib/home-video.ts");
for (const available of [[], [".mp4"], [".webp"], [".mp4", ".webp"]]) {
  const exports = {};
  vm.runInNewContext(resolverCode, { exports, process, require: id => id === "server-only" ? {} : id === "@/data/home-video" ? { homeVideo: { src: "/videos/home/batam-cinematic-h264.mp4", poster: "/images/home/batam-cinematic-poster.webp" } } : id === "node:fs/promises" ? { stat: async path => { if (!available.some(ext => path.endsWith(ext))) throw new Error("ENOENT"); return { isFile: () => true }; } } : require(id) });
  const media = await exports.getHomeVideoMedia(); assert.equal(Boolean(media.src), available.includes(".mp4")); assert.equal(Boolean(media.poster), available.includes(".webp"));
}
console.log("PASS actual server resolver with mocked filesystem: neither asset, video only, poster only, both assets");

const exports = {};
vm.runInNewContext(await compile("src/components/home/cinematic-video.tsx"), { exports, require: id => id.endsWith(".module.css") ? {} : id === "@/lib/cinematic-playback" ? { initialCinematicState: { playing: false, hasPlayed: false, blocked: false, failed: false } } : require(id) });
const { renderToStaticMarkup } = require("react-dom/server");
const { createElement } = require("react");
const html = renderToStaticMarkup(createElement(exports.CinematicVideo, { src: "/test.mp4", position: "50% 50%" }));
assert.ok(!/<button|<input|<progress/.test(html));assert.ok(/<video[^>]+aria-hidden="true"[^>]+tabindex="-1"/.test(html));
assert.ok(/<video[^>]+preload="none"/.test(html)); assert.ok(!/<video[^>]+src=/.test(html)); assert.ok(!/<video[^>]+controls=/.test(html));
console.log("PASS decorative React markup: aria-hidden, tabindex -1, no buttons, controls or initial source");
console.log("Unit media tests use mocks; run verify-home-video-playback-browser.mjs to verify the supplied MP4 in a real browser.");
