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
  const loaded = new Promise((resolve, reject) => { onLoad = resolve; timeout = setTimeout(() => reject(new Error("Page load timeout")), 30000); });
  try { await Promise.all([send("Page.navigate", { url:new URL(path, base).href }), loaded]); }
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
function pass(message) { results.push(message); console.log(`PASS ${message}`); }
async function snapshot(name) {
  const shot = await send("Page.captureScreenshot", { format:"png" });
  await writeFile(`artifacts/hero-gestures/${name}.png`, Buffer.from(shot.data, "base64"));
}

async function key(name,code=name) {
 await send('Input.dispatchKeyEvent',{type:'keyDown',key:name,code});
 await send('Input.dispatchKeyEvent',{type:'keyUp',key:name,code});await delay(100);
}
async function index(){return evaluate("Number(document.querySelector('[data-active-slide]').dataset.activeSlide)")}
async function until(expression,value){for(let i=0;i<100;i++){if(await evaluate(expression)===value)return;await delay(100)}assert.equal(await evaluate(expression),value)}
async function point(){return evaluate("(()=>{const r=document.querySelector('[data-active-slide]').getBoundingClientRect();return {left:r.left,width:r.width,y:r.top+80}})()")}
async function drag(direction,touch=false,amount=.5){
 const r=await point(),x=r.left+r.width*(direction<0?.78:.22),end=x+direction*r.width*amount,y=r.y;
 if(touch){await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y,id:1}]});for(let i=1;i<=5;i++){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x+(end-x)*i/5,y,id:1}]});await delay(20)}await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]})}
 else{await send('Input.dispatchMouseEvent',{type:'mouseMoved',x,y});await send('Input.dispatchMouseEvent',{type:'mousePressed',x,y,button:'left',buttons:1,clickCount:1});for(let i=1;i<=5;i++)await send('Input.dispatchMouseEvent',{type:'mouseMoved',x:x+(end-x)*i/5,y,button:'left',buttons:1});await send('Input.dispatchMouseEvent',{type:'mouseReleased',x:end,y,button:'left',buttons:0,clickCount:1})}
 await delay(150);
}
try {
 await mkdir('artifacts/hero-gestures',{recursive:true});await send('Page.enable');await send('Runtime.enable');await send('Page.bringToFront');await send('Emulation.setFocusEmulationEnabled',{enabled:true});
 for(const width of [390,768,1440])for(const locale of ['id','en']){
  await send('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<1000});
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:5});
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  await navigate('/'+locale);await until("document.querySelector('[data-active-slide]').dataset.autoplay",'running');
  const layout=await evaluate(`(()=>{const h=document.querySelector('[data-active-slide]'),c=h.querySelector('.hero-slide-active .hero-slide-content'),s=getComputedStyle(c);return {controls:h.querySelectorAll('button,.hero-controls,[aria-controls^="hero-slide"]').length,slides:h.querySelectorAll('.hero-slide').length,sections:document.querySelectorAll('main > section').length,next:h.nextElementSibling.getAttribute('aria-labelledby'),overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,padding:[s.paddingTop,s.paddingBottom],touch:getComputedStyle(h).touchAction,copy:[...h.querySelectorAll('.hero-slide')].map(s=>({title:s.querySelector('h1,h2').textContent,cta:s.querySelector('a').getAttribute('href')}))}})()`);
  assert.equal(layout.controls,0);assert.equal(layout.slides,3);assert.equal(layout.sections,8);assert.equal(layout.next,'cinematic-title');assert.equal(layout.overflow,false);assert.equal(layout.padding[0],layout.padding[1]);assert.ok(layout.touch.includes('pan-y'));
  await evaluate("document.querySelector('[data-active-slide]').focus()");await delay(100);assert.equal((await evaluate("document.querySelector('[data-active-slide]').dataset.autoplay")),'paused');
  await key('ArrowLeft');assert.equal(await index(),2);await key('ArrowRight');assert.equal(await index(),0);await key('End');assert.equal(await index(),2);await key('Home');assert.equal(await index(),0);
  assert.ok(await evaluate("(()=>{const a=document.querySelector('.hero-slide[aria-hidden=true] a');a.focus();return document.activeElement!==a})()"));
  await evaluate(`(()=>{window.__gestureTrace=[];const h=document.querySelector('[data-active-slide]');for(const type of ['pointerdown','pointermove','pointerup','pointercancel','gotpointercapture','lostpointercapture'])h.addEventListener(type,e=>window.__gestureTrace.push({type,primary:e.isPrimary,button:e.button,id:e.pointerId,x:e.clientX,y:e.clientY,target:e.target.tagName,drag:h.dataset.dragging,touch:getComputedStyle(h).touchAction}),true)})()`);
  await drag(-1,true);assert.equal(await index(),1,'Native touch swipe left');await drag(1,true);assert.equal(await index(),0,'Native touch swipe right');
  await drag(-1);assert.equal(await index(),1,'Native mouse drag left');await drag(1);assert.equal(await index(),0,'Native mouse drag right');
  await drag(-1,false,12/width);assert.equal(await index(),0,'Short drag does not change slide');
  const r=await point(),x=r.left+r.width*.8,y=r.y;
  for(let i=0;i<3;i++)await send('Input.dispatchMouseEvent',{type:'mouseWheel',x,y,deltaX:30,deltaY:0});await delay(150);assert.equal(await index(),1,'Horizontal wheel changes once per burst');
  await delay(300);await send('Input.dispatchMouseEvent',{type:'mouseWheel',x,y,deltaX:-80,deltaY:0});await delay(150);assert.equal(await index(),0);
  const scrollBefore=await evaluate('scrollY');await send('Input.dispatchMouseEvent',{type:'mouseWheel',x,y,deltaX:0,deltaY:180});await delay(400);assert.ok(await evaluate('scrollY')>scrollBefore,'Vertical wheel stays native');assert.equal(await index(),0);
  await evaluate("scrollTo({top:0,behavior:'instant'})");await delay(200);
  // Native touch scrolling must not trigger slide navigation.
  const t=await point();await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:width*.8,y:t.y+220,id:2}]});for(let i=1;i<=5;i++){await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:width*.8,y:t.y+220-i*35,id:2}]});await delay(30)}await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await delay(400);assert.ok(await evaluate('scrollY')>0);assert.equal(await index(),0,'Vertical touch scroll does not switch slide');
  await evaluate("scrollTo({top:0,behavior:'instant'});document.querySelector('[data-active-slide]').focus()");await delay(200);
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await delay(100);assert.equal(await evaluate("getComputedStyle(document.querySelector('.hero-slide')).transitionDuration"),'0s');assert.equal(await evaluate("document.querySelector('[data-active-slide]').dataset.autoplay"),'paused');await key('ArrowRight');assert.equal(await index(),1);await key('Home');
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'no-preference'}]});
  if(width===1440){
   await release();await until("document.querySelector('[data-active-slide]').dataset.autoplay",'running');await delay(7250);assert.equal(await index(),1,'Real 7-second autoplay');
   await evaluate("document.querySelector('[data-active-slide]').focus()");await key('End');await release();await delay(7250);assert.equal(await index(),0,'Autoplay loops last to first');
   await evaluate("document.querySelector('[data-active-slide]').focus()");await key(' ','Space');await release();await delay(7250);assert.equal(await index(),0,'Keyboard pause persists');assert.equal(await evaluate("document.querySelector('[data-active-slide]').dataset.autoplay"),'paused');
   await evaluate("document.querySelector('[data-active-slide]').focus()");await key(' ','Space');await release();await until("document.querySelector('[data-active-slide]').dataset.autoplay",'running');
   await evaluate("document.querySelector('[data-active-slide]').focus()");
  }
  await snapshot(`${locale}-${width}`);
  await evaluate("window.__heroCTAIndex=null;document.querySelector('.hero-slide-active a').addEventListener('click',()=>window.__heroCTAIndex=Number(document.querySelector('[data-active-slide]').dataset.activeSlide),{once:true})");
  await click('.hero-slide-active a');await until('location.pathname',`/${locale}/destinations`);assert.equal(await evaluate('window.__heroCTAIndex'),0,'CTA click does not change slide');
  pass(`${locale} ${width}px: no controls/extra padding, touch/mouse/wheel gestures, vertical scroll, keyboard/reduced motion, CTA, no overflow`);
 }
 assert.deepEqual(errors,[]);await writeFile('artifacts/hero-gestures/results.json',JSON.stringify({results,errors},null,2));
}finally{await writeFile('artifacts/hero-gestures/last-gesture-trace.json',JSON.stringify(await evaluate('window.__gestureTrace??[]').catch(()=>[]),null,2));await fetch(`${debug}/json/close/${tab.id}`).catch(()=>{});socket.close()}
