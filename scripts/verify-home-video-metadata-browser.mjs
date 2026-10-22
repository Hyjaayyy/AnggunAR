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
const stage=process.env.RENDER_MODE??"default";
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
  const load = new Promise((resolve,reject) => { loaded=resolve; timeout=setTimeout(()=>reject(new Error(`Page timeout ${path}`)),30000); });
  try { await send("Page.navigate",{url:new URL(path,base).href}); await load; }
  finally { clearTimeout(timeout); loaded=undefined; }
  await evaluate("document.fonts.ready"); await delay(250);
}

async function until(expression,message) {
  for(let i=0;i<100;i++){if(await evaluate(expression))return;await delay(100)}
  throw new Error(message+': '+JSON.stringify(await media()));
}
async function media() {
  return evaluate(`(()=>{const v=document.querySelector('[data-cinematic-video]');if(!v)return null;const f=document.querySelector('[data-cinematic-frame]').getBoundingClientRect();return {src:v.currentSrc,ready:v.readyState,error:v.error?{code:v.error.code,message:v.error.message}:null,muted:v.muted,loop:v.loop,inline:v.playsInline,paused:v.paused,time:v.currentTime,duration:v.duration,opacity:getComputedStyle(v).opacity,height:f.height,width:f.width,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1}})()`);
}

async function browserInfo(){
 const version=await fetch(`${debug}/json/version`).then(r=>r.json()),ws=new WebSocket(version.webSocketDebuggerUrl);
 await new Promise(resolve=>ws.addEventListener('open',resolve,{once:true}));
 const info=await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('GPU info timeout')),10000);ws.addEventListener('message',({data})=>{const r=JSON.parse(data);if(r.id===1){clearTimeout(timeout);if(r.error)reject(new Error(JSON.stringify(r.error)));else resolve(r.result)}});ws.send(JSON.stringify({id:1,method:'SystemInfo.getInfo'}))});ws.close();return {version:version.Browser,...info};
}
try {
 await mkdir('artifacts/home-video-zero-dimensions',{recursive:true});
 const gpu=await browserInfo(); await send('Page.enable');await send('Runtime.enable');await send('Page.bringToFront');
 for(const origin of ['http://localhost:3000','http://192.168.88.189:3000'])for(const preload of ['none','metadata','auto']){
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await navigate(origin+'/id');
  await until("!!document.querySelector('[data-cinematic-video]')?.dataset.cinematicEvents",'Controller attached');
  await evaluate(`(()=>{const v=document.querySelector('[data-cinematic-video]');v.preload=${JSON.stringify(preload)};v.scrollIntoView({block:'center',behavior:'instant'})})()`);
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await until("document.querySelector('[data-cinematic-video]').currentTime>1",'Playback advances');
  const result=await evaluate(`(()=>{const v=document.querySelector('[data-cinematic-video]');return {width:v.videoWidth,height:v.videoHeight,time:v.currentTime,frames:v.getVideoPlaybackQuality().totalVideoFrames,events:JSON.parse(v.dataset.cinematicEvents),source:v.currentSrc}})()`);
  assert.ok(result.events.some(e=>e.event==='loadedmetadata'),'Metadata event recorded');
  assert.equal(result.events.filter(e=>e.event==='source-attached').length,1,'One source attachment');
  assert.ok(!result.events.some(e=>e.event.startsWith('source-reset')),'No source reset');
  if(process.env.EXPECT_VISIBLE==='1'){assert.ok(result.width>0&&result.height>0);assert.ok(result.frames>0)}
  results.push({origin,preload,...result});console.log(origin,preload,result.width,result.height,result.frames);
 }
 await writeFile(`artifacts/home-video-zero-dimensions/${stage}-results.json`,JSON.stringify({gpu,results,errors},null,2));assert.deepEqual(errors,[]);
}finally{await fetch(`${debug}/json/close/${tab.id}`).catch(()=>{});socket.close()}
