import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { inflateSync } from "node:zlib";




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
function png(data){
 const bytes=Buffer.from(data,'base64');let offset=8,width,height,channels;const parts=[];
 while(offset<bytes.length){const n=bytes.readUInt32BE(offset),type=bytes.toString('ascii',offset+4,offset+8),chunk=bytes.subarray(offset+8,offset+8+n);if(type==='IHDR'){width=chunk.readUInt32BE(0);height=chunk.readUInt32BE(4);assert.equal(chunk[8],8);channels=chunk[9]===2?3:chunk[9]===6?4:0;assert.ok(channels,'RGB/RGBA PNG required')}if(type==='IDAT')parts.push(chunk);offset+=n+12}
 const raw=inflateSync(Buffer.concat(parts)),pixels=Buffer.alloc(width*height*channels),stride=width*channels;
 for(let y=0;y<height;y++){const filter=raw[y*(stride+1)];for(let x=0;x<stride;x++){const left=x>=channels?pixels[y*stride+x-channels]:0,up=y?pixels[(y-1)*stride+x]:0,corner=y&&x>=channels?pixels[(y-1)*stride+x-channels]:0;let prediction=0;if(filter===1)prediction=left;if(filter===2)prediction=up;if(filter===3)prediction=Math.floor((left+up)/2);if(filter===4){const p=left+up-corner,a=Math.abs(p-left),b=Math.abs(p-up),c=Math.abs(p-corner);prediction=a<=b&&a<=c?left:b<=c?up:corner}pixels[y*stride+x]=(raw[y*(stride+1)+1+x]+prediction)&255}}
 return {width,height,channels,pixels};
}
function compare(actual,expected,exclude){
 let error=0,count=0,navyError=0,min=255,max=0;
 for(let y=3;y<Math.min(actual.height,expected.height)-3;y+=4)for(let x=3;x<Math.min(actual.width,expected.width)-3;x+=4){if(x>=exclude.left-4&&x<=exclude.right+4&&y>=exclude.top-4&&y<=exclude.bottom+4)continue;for(let c=0;c<3;c++){const a=actual.pixels[(y*actual.width+x)*actual.channels+c],e=expected.pixels[(y*expected.width+x)*expected.channels+c];error+=Math.abs(a-e);navyError+=Math.abs(a-[16,42,67][c]);min=Math.min(min,a);max=Math.max(max,a);count++}}
 return {meanAbsoluteError:error/count,meanDifferenceFromSolidNavy:navyError/count,min,max,samples:count};
}
try{
 await mkdir('artifacts/home-video-rendering',{recursive:true});const gpu=await browserInfo();await send('Page.enable');await send('Runtime.enable');await send('Media.enable');await send('Page.bringToFront');await send('Emulation.setFocusEmulationEnabled',{enabled:true});
 const decoders=[];socket.addEventListener('message',({data})=>{const m=JSON.parse(data);if(m.method==='Media.playerPropertiesChanged')decoders.push(m.params)});
 const origins=process.env.TEST_ORIGINS?.split(',')??['http://localhost:3000','http://192.168.88.189:3000'];
 for(const origin of origins)for(const width of [390,1440])for(const locale of ['id','en']){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:false});await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});await navigate(origin+'/'+locale);await evaluate("document.querySelector('[data-cinematic-frame]').scrollIntoView({block:'center',behavior:'instant'})");await until("(()=>{const v=document.querySelector('[data-cinematic-video]');return v.readyState>=3&&!v.paused&&getComputedStyle(v).opacity==='1'})()",'Actual video visible');
  const audit=await evaluate(`(()=>{const v=document.querySelector('[data-cinematic-video]'),items=[];for(let e=v;e;e=e.parentElement){const s=getComputedStyle(e),r=e.getBoundingClientRect();items.push({tag:e.tagName,className:e.className,display:s.display,visibility:s.visibility,opacity:s.opacity,position:s.position,zIndex:s.zIndex,transform:s.transform,filter:s.filter,clipPath:s.clipPath,maskImage:s.maskImage,overflow:s.overflow,isolation:s.isolation,background:s.backgroundColor,rect:{left:r.left,top:r.top,width:r.width,height:r.height}})}const o=document.querySelector('[data-cinematic-overlay]'),s=getComputedStyle(o);return {ancestors:items,overlay:{background:s.backgroundColor,zIndex:s.zIndex},videoWidth:v.videoWidth,videoHeight:v.videoHeight,fit:getComputedStyle(v).objectFit,position:getComputedStyle(v).objectPosition,secure:isSecureContext}})()`);
  const frames=[];
  for(const time of [2,5]){
   const capture=await evaluate(`(async()=>{const v=document.querySelector('[data-cinematic-video]');v.playbackRate=0;await new Promise(resolve=>{v.addEventListener('seeked',resolve,{once:true});v.currentTime=${time}});await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));const rect=v.getBoundingClientRect(),h=document.getElementById('cinematic-title').parentElement.getBoundingClientRect(),canvas=document.createElement('canvas');canvas.width=Math.floor(rect.width);canvas.height=Math.floor(rect.height);const ctx=canvas.getContext('2d'),scale=Math.max(rect.width/v.videoWidth,rect.height/v.videoHeight),w=v.videoWidth*scale,height=v.videoHeight*scale;ctx.drawImage(v,(rect.width-w)/2,(rect.height-height)/2,w,height);const decoded=canvas.toDataURL('image/png').split(',')[1],pixel=ctx.getImageData(0,0,canvas.width,canvas.height).data;let sum=0,square=0,n=0;for(let i=0;i<pixel.length;i+=64){const value=(pixel[i]+pixel[i+1]+pixel[i+2])/3;sum+=value;square+=value*value;n++}ctx.fillStyle='rgba(16,42,67,0.7)';ctx.fillRect(0,0,canvas.width,canvas.height);return {decoded,expected:canvas.toDataURL('image/png').split(',')[1],decodedStats:{mean:sum/n,variance:square/n-(sum/n)**2},clip:{x:rect.left+scrollX,y:rect.top+scrollY,width:canvas.width,height:canvas.height,scale:1},exclude:{left:h.left-rect.left,right:h.right-rect.left,top:h.top-rect.top,bottom:h.bottom-rect.top},time:v.currentTime}})()`);
   const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:capture.clip}),name=`${stage}-${new URL(origin).hostname}-${locale}-${width}-t${time}`;
   await writeFile(`artifacts/home-video-rendering/${name}.png`,Buffer.from(shot.data,'base64'));await writeFile(`artifacts/home-video-rendering/${name}-decoded.png`,Buffer.from(capture.decoded,'base64'));await writeFile(`artifacts/home-video-rendering/${name}-expected.png`,Buffer.from(capture.expected,'base64'));
   const metrics=compare(png(shot.data),png(capture.expected),capture.exclude);frames.push({time:capture.time,decodedStats:capture.decodedStats,metrics,name});
   console.log(`FRAME ${stage} ${origin} ${locale} ${width} t${time}: compositing MAE=${metrics.meanAbsoluteError.toFixed(3)}, navy difference=${metrics.meanDifferenceFromSolidNavy.toFixed(2)}, decoded variance=${capture.decodedStats.variance.toFixed(1)}`);
  }
  const state=await evaluate(`(()=>{const v=document.querySelector('[data-cinematic-video]');return {ready:v.readyState,network:v.networkState,paused:v.paused,muted:v.muted,error:v.error?.message??null,videoWidth:v.videoWidth,videoHeight:v.videoHeight,frames:v.getVideoPlaybackQuality().totalVideoFrames,diagnostic:v.dataset.cinematicDiagnostic??null}})()`);
  const classification=state.videoWidth&&state.videoHeight?'decoded-video':'no-video-track';
  if(classification==='decoded-video')for(const frame of frames){assert.ok(frame.decodedStats.variance>10,'Decoded frame contains an image');assert.ok(frame.metrics.meanAbsoluteError<3,'Compositor pixels match decoded video plus 70% overlay');assert.ok(frame.metrics.meanDifferenceFromSolidNavy>3,'Screenshot contains video, not solid navy')}
  if(process.env.EXPECT_VISIBLE==='1')assert.equal(classification,'decoded-video','This mode must render an actual video track');
  results.push({origin,locale,width,audit,frames,state,classification});await evaluate("document.querySelector('[data-cinematic-video]').playbackRate=1");
 }
 await writeFile(`artifacts/home-video-rendering/${stage}-results.json`,JSON.stringify({gpu,decoders,results,errors},null,2));assert.deepEqual(errors,[]);
}finally{await fetch(`${debug}/json/close/${tab.id}`).catch(()=>{});socket.close()}
