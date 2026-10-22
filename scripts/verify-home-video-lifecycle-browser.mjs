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
const stage=process.env.VIDEO_STAGE??"real";
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
async function screenshot(name,full=false) {
  const params={format:"png",captureBeyondViewport:full};
  if (full) {const {cssContentSize}=await send("Page.getLayoutMetrics");params.clip={x:0,y:0,width:cssContentSize.width,height:cssContentSize.height,scale:1};}
  const shot=await send("Page.captureScreenshot",params);
  await writeFile(`artifacts/home-video-lifecycle/${stage}-${name}.png`,Buffer.from(shot.data,"base64"));
}

async function reload(){
  let timeout;
  const done=new Promise((resolve,reject)=>{loaded=resolve;timeout=setTimeout(()=>reject(new Error('Reload timeout')),20000)});
  try{await send('Page.reload');await done}finally{clearTimeout(timeout);loaded=undefined}
  await evaluate('document.fonts.ready');
}

async function waitFor(expression,label,limit=20000) {
  const deadline=Date.now()+limit;
  while(Date.now()<deadline){if(await evaluate(expression))return;await delay(100)}
  throw new Error(label+': '+JSON.stringify(await snapshot()));
}
async function snapshot(){
  return evaluate(`(()=>{const v=document.querySelector('[data-cinematic-video]');if(!v)return null;const r=v.getBoundingClientRect(),s=getComputedStyle(v);return {url:location.href,src:v.currentSrc,ready:v.readyState,network:v.networkState,paused:v.paused,muted:v.muted,loop:v.loop,time:v.currentTime,duration:v.duration,error:v.error?.message??null,opacity:s.opacity,display:s.display,visibility:s.visibility,documentVisibility:document.visibilityState,reduced:matchMedia('(prefers-reduced-motion: reduce)').matches,secure:isSecureContext,frames:v.getVideoPlaybackQuality().totalVideoFrames,rect:{left:r.left,top:r.top,width:r.width,height:r.height},diagnostic:v.dataset.cinematicDiagnostic?JSON.parse(v.dataset.cinematicDiagnostic):null,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1}})()`);
}
async function visiblePlayback(label){
  await waitFor("!!document.querySelector('[data-cinematic-video]')",label+' mounted');
  await evaluate("document.querySelector('[data-cinematic-frame]').scrollIntoView({block:'center',behavior:'instant'})");
  await waitFor("(()=>{const v=document.querySelector('[data-cinematic-video]');return v.readyState>=3&&!v.paused&&getComputedStyle(v).opacity==='1'})()",label+' visible playback',30000);
  const first=await snapshot();await delay(450);const last=await snapshot();
  assert.equal(last.error,null);assert.equal(last.muted,true);assert.equal(last.loop,true);assert.equal(last.visibility,'visible');assert.notEqual(last.display,'none');assert.equal(last.documentVisibility,'visible');assert.equal(last.overflow,false);
  const elapsed=(last.time-first.time+last.duration)%last.duration;assert.ok(elapsed>.1,label+' currentTime advances');assert.ok(last.frames>first.frames,label+' decoded video frames advance');
  results.push({label,first,last});console.log(`PASS ${label}: ${first.time.toFixed(3)} -> ${last.time.toFixed(3)}, rendered frames ${first.frames} -> ${last.frames}`);
}
async function clientRoute(path){
  await evaluate(`document.querySelector('header a[href=${JSON.stringify(path)}]').click()`);
  await waitFor(`location.pathname===${JSON.stringify(path)}`,'client route '+path);
}
try {
 await mkdir('artifacts/home-video-lifecycle',{recursive:true});
 await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Page.bringToFront');await send('Emulation.setFocusEmulationEnabled',{enabled:true});
 const network=[],failures=[],hmr=[];
 socket.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.method==='Network.responseReceived'&&m.params.response.url.includes('batam-cinematic-h264.mp4')){const r=m.params.response;network.push({url:r.url,status:r.status,cache:r.fromDiskCache,headers:r.headers})}if(m.method==='Network.loadingFailed'&&!m.params.canceled)failures.push(m.params);if(m.method==='Network.webSocketFrameError')errors.push(m.params.errorMessage);if(m.method==='Network.webSocketHandshakeResponseReceived')hmr.push(m.params.response.status)});
 const origins=process.env.TEST_ORIGINS?.split(',')??['http://localhost:3000','http://192.168.88.189:3000'];
 for(const origin of origins){
  for(const width of [390,1440])for(const locale of ['id','en']){
   await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
   await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
   await send('Network.setCacheDisabled',{cacheDisabled:false});
   await navigate(origin+'/'+locale);await visiblePlayback(`${origin} ${locale} ${width} direct/cache-on`);
   await screenshot(`${new URL(origin).hostname}-${locale}-${width}`);
   await reload();await visiblePlayback(`${origin} ${locale} ${width} reload/cache-on`);
   await evaluate("window.__cinematicNavigationMarker='preserved'");
   await clientRoute('/'+locale+'/about');await waitFor("!document.querySelector('[data-cinematic-video]')",'unmount video');
   await clientRoute('/'+locale);await visiblePlayback(`${origin} ${locale} ${width} client remount`);assert.equal(await evaluate('window.__cinematicNavigationMarker'),'preserved','Client routing does not reload document');
   await evaluate('history.back()');await waitFor(`location.pathname==='/${locale}/about'`,'history back');
   await evaluate('history.forward()');await waitFor(`location.pathname==='/${locale}'`,'history forward');await visiblePlayback(`${origin} ${locale} ${width} back/forward`);
   const other=locale==='id'?'en':'id';await evaluate(`document.querySelector('header a[hreflang=${other}]').click()`);await waitFor(`location.pathname==='/${other}'`,'language switch');await visiblePlayback(`${origin} ${locale} ${width} language switch`);
   await send('Network.setCacheDisabled',{cacheDisabled:true});await reload();await visiblePlayback(`${origin} ${locale} ${width} reload/cache-off`);
  }
  // A controlled real load() interruption, not a fabricated video or a policy bypass.
  const fixture=await send('Page.addScriptToEvaluateOnNewDocument',{source:`const play=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(...args){const p=play.apply(this,args);if(this.hasAttribute('data-cinematic-video')&&!window.__interrupted){window.__interrupted=true;this.load();p.catch(e=>window.__interruptionName=e.name)}return p}`});
  await navigate(origin+'/id');await visiblePlayback(origin+' interrupted native play/load recovery');assert.equal(await evaluate('window.__interruptionName'),'AbortError');
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:fixture.identifier});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await navigate(origin+'/en');
  await waitFor("!!document.querySelector('[data-cinematic-video]')",'slow network mounted');
  await send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:512000,uploadThroughput:128000});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await visiblePlayback(origin+' slow network 512KB/s 150ms');
  await evaluate("document.querySelector('footer').scrollIntoView({behavior:'instant'})");await waitFor("document.querySelector('[data-cinematic-video]').paused",'slow network offscreen pause');await visiblePlayback(origin+' slow network viewport resume');
  await send('Network.emulateNetworkConditions',{offline:false,latency:0,downloadThroughput:-1,uploadThroughput:-1});
 }
 await writeFile(`artifacts/home-video-lifecycle/${stage}-results.json`,JSON.stringify({origins,results,network,failures,hmr,errors},null,2));
 assert.deepEqual(errors,[]);
 // Chrome may abort an old byte-range cache operation when CDP toggles cache.
 // Preserve that diagnostic; every new document must still render moving frames.
 assert.deepEqual(failures.filter(f=>f.errorText!=='net::ERR_CACHE_OPERATION_NOT_SUPPORTED'),[]);
 assert.ok(network.every(r=>[200,206].includes(r.status)));if(origins.some(o=>o.includes(':3000')))assert.ok(hmr.includes(101));
 console.log(`PASS ${results.length} actual playback checks: navigation/cache/language/history/slow network/controlled interruption; ${failures.length} recovered cache-toggle network diagnostics; no console/hydration/HMR errors`);
}finally{await fetch(`${debug}/json/close/${tab.id}`).catch(()=>{});socket.close()}
