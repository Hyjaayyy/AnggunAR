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
  await writeFile(`artifacts/home-video-real/${stage}-${name}.png`,Buffer.from(shot.data,"base64"));
}

async function until(expression,message) {
  for(let i=0;i<100;i++){if(await evaluate(expression))return;await delay(100)}
  throw new Error(message+': '+JSON.stringify(await media()));
}
async function media() {
  return evaluate(`(()=>{const v=document.querySelector('[data-cinematic-video]');if(!v)return null;const f=document.querySelector('[data-cinematic-frame]').getBoundingClientRect();return {videoWidth:v.videoWidth,videoHeight:v.videoHeight,decodedFrames:v.getVideoPlaybackQuality().totalVideoFrames,src:v.currentSrc,ready:v.readyState,error:v.error?{code:v.error.code,message:v.error.message}:null,muted:v.muted,loop:v.loop,inline:v.playsInline,paused:v.paused,time:v.currentTime,duration:v.duration,opacity:getComputedStyle(v).opacity,height:f.height,width:f.width,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1}})()`);
}
try {
  await mkdir('artifacts/home-video-real',{recursive:true});
  await send('Page.enable');await send('Runtime.enable');await send('Network.enable');await send('Page.bringToFront');await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  const sockets=[];
  socket.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.method==='Network.webSocketHandshakeResponseReceived')sockets.push(m.params.response.status);if(m.method==='Network.webSocketFrameError')errors.push(m.params.errorMessage)});
  const http=[];
  for(const range of [false,true]) {
    const response=await fetch(new URL('/videos/home/batam-cinematic-h264.mp4',base),range?{headers:{Range:'bytes=0-1023'}}:{});
    assert.equal(response.status,range?206:200);assert.ok(response.headers.get('content-type').includes('video/mp4'));
    http.push({status:response.status,type:response.headers.get('content-type'),length:response.headers.get('content-length'),acceptRanges:response.headers.get('accept-ranges'),etag:response.headers.get('etag'),range:response.headers.get('content-range'),bytes:(await response.arrayBuffer()).byteLength});
  }
  // Only the exact approved public path bypasses the locale proxy.
  for(const path of ['/videos/home/not-allowed.mp4','/videos/home/batam-cinematic-h264.mp4/extra','/fr','/id/missing'])assert.equal((await fetch(new URL(path,base))).status,404);
  for(const width of [390,768,1440])for(const locale of ['id','en']) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
    await navigate('/'+locale);
    assert.equal(await evaluate("document.querySelectorAll('[data-cinematic-video]').length"),1);
    assert.equal(await evaluate("document.querySelector('main > section').nextElementSibling.getAttribute('aria-labelledby')"),'cinematic-title');
    const decoration=await evaluate(`(()=>{const s=document.querySelector('section[aria-labelledby=cinematic-title]'),v=s.querySelector('video'),o=s.querySelector('[data-cinematic-overlay]'),h=s.querySelector('h2'),r=s.getBoundingClientRect(),b=h.parentElement.getBoundingClientRect();return {controls:v.controls,buttons:s.querySelectorAll('button,input,progress,a,[role=button]').length,hidden:v.getAttribute('aria-hidden'),tabIndex:v.tabIndex,fit:getComputedStyle(v).objectFit,overlay:getComputedStyle(o).backgroundColor,above:+getComputedStyle(h.parentElement).zIndex>+getComputedStyle(o).zIndex,inside:b.top>=r.top&&b.bottom<=r.bottom,focusable:s.querySelectorAll('[tabindex="0"]').length}})()`);
    assert.equal(decoration.controls,false);assert.equal(decoration.buttons,0);assert.equal(decoration.hidden,'true');assert.equal(decoration.tabIndex,-1);assert.equal(decoration.fit,'cover');assert.equal(decoration.overlay,'rgba(16, 42, 67, 0.7)');assert.equal(decoration.above,true);assert.equal(decoration.inside,true,'Overlay text fits within frame');assert.equal(decoration.focusable,0);
    if(process.env.TEST_EXPECT_PRODUCTION==='1')assert.equal(await evaluate("document.querySelector('[data-cinematic-video]').hasAttribute('data-cinematic-diagnostic')"),false,'Development diagnostics absent from production');
    const bleed=await evaluate(`(()=>{const s=document.querySelector('[data-cinematic-frame]'),v=s.querySelector('video'),o=s.querySelector('[data-cinematic-overlay]'),h=s.querySelector('h2'),header=document.querySelector('body > header .container'),r=s.getBoundingClientRect(),vr=v.getBoundingClientRect(),or=o.getBoundingClientRect(),style=getComputedStyle(s);return {left:r.left,right:r.right,viewport:document.documentElement.clientWidth,video:[vr.left,vr.top,vr.width,vr.height],overlay:[or.left,or.top,or.width,or.height],borderLeft:style.borderLeftWidth,borderRight:style.borderRightWidth,radius:style.borderRadius,shadow:style.boxShadow,headingLeft:h.getBoundingClientRect().left,containerLeft:header.getBoundingClientRect().left}})()`);
    assert.equal(bleed.left,0);assert.equal(bleed.right,bleed.viewport,'Background spans viewport without 100vw overflow');assert.deepEqual(bleed.video,bleed.overlay,'Video and overlay cover precisely the same area');assert.equal(bleed.video[0],0);assert.equal(bleed.video[2],bleed.viewport);assert.equal(bleed.borderLeft,'0px');assert.equal(bleed.borderRight,'0px');assert.equal(bleed.radius,'0px');assert.equal(bleed.shadow,'none');assert.ok(Math.abs(bleed.headingLeft-bleed.containerLeft)<1,'Text aligns with navbar content container');
    const initialHeight=(await media()).height;
    await evaluate("document.querySelector('[data-cinematic-frame]').scrollIntoView({block:'center',behavior:'instant'})");
    await until("(()=>{const v=document.querySelector('[data-cinematic-video]');return v.readyState>=3&&!v.paused&&v.currentTime>0})()",'Actual MP4 must autoplay/decode');
    const start=await media();await delay(1500);const advanced=await media();
    assert.equal(advanced.videoWidth,1920);assert.equal(advanced.videoHeight,1080);assert.ok(advanced.decodedFrames>start.decodedFrames,'Decoded frames increase during actual playback');assert.ok(advanced.time>start.time+.5,'Real currentTime advances');assert.equal(advanced.error,null);assert.equal(advanced.muted,true);assert.equal(advanced.loop,true);assert.equal(advanced.inline,true);assert.equal(advanced.opacity,'1');assert.ok(advanced.src.endsWith('/videos/home/batam-cinematic-h264.mp4'));assert.equal(advanced.overflow,false);assert.equal(advanced.height,initialHeight,'No frame height shift after decoding');
    await screenshot(`${locale}-${width}-playing`);
    await evaluate("document.querySelector('footer').scrollIntoView({block:'start',behavior:'instant'})");await until("document.querySelector('[data-cinematic-video]').paused",'Pause offscreen');
    await evaluate("document.querySelector('[data-cinematic-frame]').scrollIntoView({block:'center',behavior:'instant'})");await until("!document.querySelector('[data-cinematic-video]').paused",'Resume onscreen');
    // Real decoding/playback; visibility state alone is simulated to avoid OS focus dependence.
    await evaluate("Object.defineProperty(document,'visibilityState',{configurable:true,value:'hidden'});document.dispatchEvent(new Event('visibilitychange'))");assert.equal((await media()).paused,true);
    await evaluate("delete document.visibilityState;document.dispatchEvent(new Event('visibilitychange'))");await until("!document.querySelector('[data-cinematic-video]').paused",'Visible tab resumes');
    await evaluate("const v=document.querySelector('[data-cinematic-video]');v.currentTime=v.duration-.3");
    await until("document.querySelector('[data-cinematic-video]').currentTime<1.5",'Real decoder loops at file end');assert.equal((await media()).paused,false);
    await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await until("document.querySelector('[data-cinematic-video]').paused",'Reduced motion pauses');
    await until("getComputedStyle(document.querySelector('[data-cinematic-video]')).opacity==='0'",'Reduced motion shows static fallback');
    results.push({locale,width,start,advanced,decoration,bleed,loop:true,viewportPauseResume:true,noControls:true,visibilitySimulated:true,reducedMotion:true});
    console.log(`PASS decorative MP4 ${locale} ${width}px: ready=${advanced.ready}, time ${start.time.toFixed(3)} → ${advanced.time.toFixed(3)}, autoplay/loop/viewport/tab/reduced-motion; no controls, 70% overlay, stable frame`);
  }
  await navigate('/id');await evaluate("document.querySelector('[data-cinematic-frame]').scrollIntoView({block:'center',behavior:'instant'})");await delay(250);
  assert.equal((await media()).paused,true,'Fresh reduced-motion visit does not autoplay');
  assert.equal(await evaluate("document.querySelector('[data-cinematic-video]').getAttribute('src')"),null,'Reduced motion defers source loading');
  assert.equal((await media()).opacity,'0');
  assert.equal(await evaluate("document.querySelector('section[aria-labelledby=cinematic-title]').querySelectorAll('button').length"),0);
  await screenshot('reduced-motion-static');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await until("!document.querySelector('[data-cinematic-video]').paused&&document.querySelector('[data-cinematic-video]').readyState>=3",'Autoplay when reduced motion is disabled');
  // Actual browser tab visibility in addition to the per-case visibility event tests.
  await send('Emulation.setFocusEmulationEnabled',{enabled:false});
  const other=await fetch(`${debug}/json/new?about:blank`,{method:'PUT'}).then(r=>r.json());
  try {
    await send('Target.activateTarget',{targetId:other.id});
    await until("document.visibilityState==='hidden'&&document.querySelector('[data-cinematic-video]').paused",'Actual inactive tab pauses');
    await send('Page.bringToFront');
    await until("document.visibilityState==='visible'&&!document.querySelector('[data-cinematic-video]').paused",'Actual active tab resumes');
  } finally {await fetch(`${debug}/json/close/${other.id}`).catch(()=>{});await send('Page.bringToFront')}
  // Deliberately block the real URL to check recovery without altering the owner's file.
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await send('Network.setBlockedURLs',{urls:['*/videos/home/batam-cinematic-h264.mp4']});
  const failureWatch=await send('Page.addScriptToEvaluateOnNewDocument',{source:"document.addEventListener('error',event=>{if(event.target?.matches?.('[data-cinematic-video]'))window.__backgroundFailed=true},true)"});
  await navigate('/id');await evaluate("document.querySelector('[data-cinematic-frame]').scrollIntoView({block:'center',behavior:'instant'})");
  await until("window.__backgroundFailed===true&&getComputedStyle(document.querySelector('[data-cinematic-video]')).opacity==='0'",'Failed real source restores fallback');
  assert.equal((await media()).opacity,'0');assert.ok(await evaluate("!!document.querySelector('[data-cinematic-fallback]')"));
  await send('Network.setBlockedURLs',{urls:[]});
  await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:failureWatch.identifier});
  await screenshot('failed-source-static');
  const policy=await send('Page.addScriptToEvaluateOnNewDocument',{source:`const nativePlay=HTMLMediaElement.prototype.play;HTMLMediaElement.prototype.play=function(...args){if(this.hasAttribute('data-cinematic-video')){window.__blockedCalls=(window.__blockedCalls||0)+1;return Promise.reject(new DOMException('Autoplay denied for test','NotAllowedError'))}return nativePlay.apply(this,args)}`});
  await navigate('/en');await evaluate("document.querySelector('[data-cinematic-frame]').scrollIntoView({block:'center',behavior:'instant'})");
  await until("window.__blockedCalls===1&&document.querySelector('[data-cinematic-video]').paused&&getComputedStyle(document.querySelector('[data-cinematic-video]')).opacity==='0'",'Rejected autoplay uses static fallback');
  await evaluate("document.querySelector('footer').scrollIntoView({block:'start',behavior:'instant'})");await delay(100);await evaluate("document.querySelector('[data-cinematic-frame]').scrollIntoView({block:'center',behavior:'instant'})");await delay(300);
  assert.equal(await evaluate('window.__blockedCalls'),1,'Do not force repeated autoplay attempts');
  assert.equal(await evaluate("document.querySelector('section[aria-labelledby=cinematic-title]').querySelectorAll('button,input,progress,a').length"),0);
  await screenshot('autoplay-blocked-static');await send('Page.removeScriptToEvaluateOnNewDocument',{identifier:policy.identifier});
  assert.deepEqual(errors,[],'No runtime, hydration, console or WebSocket errors');
  if(base.includes(':3000'))assert.ok(sockets.includes(101),'Development HMR handshake succeeds');
  await writeFile(`artifacts/home-video-real/${stage}-results.json`,JSON.stringify({base,http,sockets,results,actualTabSwitch:true,networkFailureFallback:true,autoplayDeniedSimulation:true,errors},null,2));
  console.log('PASS HTTP 200/206, reduced-motion/static fallback, actual tab switch, failed-source fallback, simulated autoplay denial without controls/retry, no console/hydration/HMR errors');
} finally {await fetch(`${debug}/json/close/${tab.id}`).catch(()=>{});socket.close();}
