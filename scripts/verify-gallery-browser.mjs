import assert from "node:assert/strict";
import { mkdir, writeFile, readFile, unlink, rmdir } from "node:fs/promises";

const debug = process.env.BROWSER_DEBUG_URL ?? "http://127.0.0.1:9333";
const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3100";
const tab = await fetch(`${debug}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, {once:true}); socket.addEventListener("error", reject, {once:true}); });
let requestId = 0;
let loaded;
const pending = new Map();
const errors = [];
const results = [];
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
    const timeout = setTimeout(() => { pending.delete(id); reject(new Error(`CDP timeout ${method}`)); },60000);
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
  const load = new Promise((resolve,reject) => { loaded=resolve; timeout=setTimeout(()=>reject(new Error(`Page timeout ${path}`)),60000); });
  // Page.navigate may still be pending when the load deadline expires.
  // Attach a rejection handler immediately so finally can restore fixtures.
  void load.catch(() => {});
  try { await send("Page.navigate",{url:new URL(path,base).href}); await load; }
  finally { clearTimeout(timeout); loaded=undefined; }
  await evaluate("document.fonts.ready"); await delay(250);
}
async function click(selector) {
  const point=await evaluate(`(() => {const el=document.querySelector(${JSON.stringify(selector)});el.scrollIntoView({block:'center',behavior:'instant'});const r=el.getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})()`);
  await send("Input.dispatchMouseEvent",{type:"mousePressed",...point,button:"left",clickCount:1});
  await send("Input.dispatchMouseEvent",{type:"mouseReleased",...point,button:"left",clickCount:1});
  await delay(400);
}
async function key(key,code,windowsVirtualKeyCode) {
  await send("Input.dispatchKeyEvent",{type:key==="Enter"?"keyDown":"rawKeyDown",key,code,windowsVirtualKeyCode,...(key==="Enter"?{text:"\r"}:{})});
  await send("Input.dispatchKeyEvent",{type:"keyUp",key,code,windowsVirtualKeyCode}); await delay(80);
}
async function screenshot(name,full=false) {
  const params={format:"png",captureBeyondViewport:full};
  if (full) {const {cssContentSize}=await send("Page.getLayoutMetrics");params.clip={x:0,y:0,width:cssContentSize.width,height:cssContentSize.height,scale:1};}
  const shot=await send("Page.captureScreenshot",params);
  await writeFile(`artifacts/phase4/${name}.png`,Buffer.from(shot.data,"base64"));
}

// Local development only. Restore the exact source and remove only files created here.
const dataFile='src/data/gallery.ts';
const original=await readFile(dataFile,'utf8');
await mkdir('artifacts/phase4',{recursive:true});
await writeFile('artifacts/phase4/gallery-source-before.ts',original);
const created=[];
let fixtureSource;
let createdDestinationDirectory=false;
try {
  assert.ok(/^http:\/\/(?:127\.0\.0\.1|localhost):\d+$/.test(base),'Fixture testing requires localhost');
  assert.ok(/galleryPhotos:\s*readonly GalleryPhoto\[\]\s*=\s*\[\s*\]/.test(original),'Fixture test requires the untouched empty gallery dataset');
  await send('Page.enable');await send('Runtime.enable');await send('Page.bringToFront');await send('Emulation.setFocusEmulationEnabled',{enabled:true});
  await navigate('/id/packages');
  assert.ok(await evaluate("document.querySelector('main').innerText.includes('Pratinjau konsep')"),'Fixture test requires development, not production');
  const encoded=await evaluate(`(() => {const c=document.createElement('canvas');c.width=80;c.height=60;const x=c.getContext('2d');x.fillStyle='#087f8c';x.fillRect(0,0,80,60);x.fillStyle='#102a43';x.fillRect(0,30,80,30);return c.toDataURL('image/webp').split(',')[1]})()`);
  for(const n of [1,2,3]) {const file=`public/images/gallery/phase4-test-0${n}.webp`;await writeFile(file,Buffer.from(encoded,'base64'),{flag:'wx'});created.push(file);}
  createdDestinationDirectory=!!(await mkdir('public/images/destinations/barelang-bridge',{recursive:true}));
  const cover='public/images/destinations/barelang-bridge/cover.webp';await writeFile(cover,Buffer.from(encoded,'base64'),{flag:'wx'});created.push(cover);
  const photos=[1,2,3].map((n)=>({id:`test-${n}`,status:'published',category:['landmarks','beaches-islands','travel-moments'][n-1],permission:'Synthetic test fixture generated locally; not travel documentation',image:{src:`/images/gallery/phase4-test-0${n}.webp`,position:'50% 40%',alt:{id:`Pola sintetis pengujian ${n}`,en:`Synthetic test pattern ${n}`}},caption:{id:`PENGUJIAN ${n} - bukan foto destinasi atau perjalanan`,en:`TEST ${n} - not destination or travel photography`}}));
  const fixtures=[...photos,{...photos[0],id:'draft',status:'draft'},{...photos[0],id:'no-permission',permission:null},{...photos[0],id:'missing',image:{...photos[0].image,src:'/images/gallery/phase4-test-missing.webp'}}];
  fixtureSource=`import type { GalleryPhoto } from "@/types/gallery";\nexport const galleryPhotos: readonly GalleryPhoto[] = ${JSON.stringify(fixtures,null,2)};\n`;
  await writeFile(dataFile,fixtureSource);await delay(1000);
  await navigate('/id/destinations/barelang-bridge');
  assert.equal(await evaluate("document.querySelectorAll('[data-local-photo]').length"),3);
  const destinationImage=await evaluate(`(async()=>{const i=document.querySelector('main [data-local-photo] img');await i.decode();return {src:i.currentSrc,width:i.naturalWidth,alt:i.alt}})()`);
  assert.ok(destinationImage.width>0&&destinationImage.src.includes('/_next/image?'));
  for(const width of [320,390,768,1440]) {
    await send('Emulation.setDeviceMetricsOverride',{width,height:900,deviceScaleFactor:1,mobile:false});
    for(const locale of ['id','en']) {
      await navigate(`/${locale}/gallery`);
      assert.equal(await evaluate("document.querySelectorAll('[data-gallery-open]').length"),3,'Draft, unlicensed and missing photos excluded');
      await evaluate("document.querySelector('[data-gallery-open]').scrollIntoView({block:'center',behavior:'instant'});document.querySelector('[data-gallery-open]').focus()");
      await delay(1000);
      await key('Enter','Enter',13);await delay(150);
      assert.ok(await evaluate("document.querySelector('dialog').open"));
      assert.equal(await evaluate("document.body.style.overflow"),'hidden');
      assert.equal(await evaluate("document.activeElement===document.querySelector('dialog button')"),true);
      await send('Input.dispatchKeyEvent',{type:'rawKeyDown',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:8});
      await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Tab',code:'Tab',windowsVirtualKeyCode:9,modifiers:8});
      assert.ok(await evaluate("document.activeElement.matches('[data-gallery-next]')"),'Shift+Tab wraps to last control');
      assert.ok(await evaluate("document.querySelector('dialog').getAttribute('aria-labelledby')&&document.querySelector('#lightbox-caption').textContent"));
      for(let n=0;n<6;n++) {await key('Tab','Tab',9);assert.ok(await evaluate("document.querySelector('dialog').contains(document.activeElement)"),'Native modal focus containment');}
      await key('ArrowRight','ArrowRight',39);assert.ok((await evaluate("document.querySelector('#lightbox-counter').innerText")).includes('2'));
      await key('ArrowLeft','ArrowLeft',37);assert.ok((await evaluate("document.querySelector('#lightbox-counter').innerText")).includes('1'));
      await click('[data-gallery-next]');assert.ok((await evaluate("document.querySelector('#lightbox-counter').innerText")).includes('2'));
      await click('[data-gallery-next]');await click('[data-gallery-next]');assert.ok((await evaluate("document.querySelector('#lightbox-counter').innerText")).includes('1'),'Next wraps around');
      const layout=await evaluate(`(() => {const d=document.querySelector('dialog'),r=d.getBoundingClientRect();return {left:r.left,right:r.right,width:innerWidth,scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth}})()`);
      assert.ok(layout.left>=-1&&layout.right<=layout.width+1);assert.ok(layout.scroll<=layout.client+1);
      if([390,1440].includes(width))await screenshot(`lightbox-${locale}-${width}`);
      await key('Escape','Escape',27);assert.equal(await evaluate("document.querySelector('dialog').open"),false);assert.equal(await evaluate('document.body.style.overflow'),'');assert.ok(await evaluate("document.activeElement.matches('[data-gallery-open]')"));
      await click('[data-gallery-open]');await click('dialog button');assert.ok(await evaluate("!document.querySelector('dialog').open&&document.activeElement.matches('[data-gallery-open]')"));
      results.push({locale,width,keyboard:true,focus:true,scrollLock:true,...layout});
    }
  }
  await navigate('/id/gallery?category=landmarks');assert.equal(await evaluate("document.querySelectorAll('[data-gallery-open]').length"),1);
  await click('header a[hreflang="en"]');assert.equal(await evaluate('location.pathname'),'/en/gallery');assert.equal(await evaluate("new URLSearchParams(location.search).get('category')"),'landmarks');
  await click('[data-gallery-open]');assert.ok(await evaluate("[...document.querySelectorAll('dialog button')].slice(1).every(b=>b.disabled)"));await key('Escape','Escape',27);
  await navigate('/id/gallery');
  await evaluate("document.querySelector('select').value='beaches-islands';document.querySelector('button[type=submit]').click()");await delay(600);assert.equal(await evaluate("document.querySelectorAll('[data-gallery-open]').length"),1);
  await click('main form a');assert.equal(await evaluate("document.querySelectorAll('[data-gallery-open]').length"),3);
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-gallery-open] img')).transitionDuration"),'0s');
  await click('[data-gallery-open]');
  await evaluate("document.querySelector('header a').click()");
  // Wait for the actual route unmount, not an arbitrary 600ms compilation window.
  for(let attempt=0;attempt<300;attempt++){
    if(await evaluate("location.pathname==='/id'&&!document.querySelector('dialog')"))break;
    await delay(200);
  }
  assert.equal(await evaluate("location.pathname==='/id'&&!document.querySelector('dialog')"),true,'Gallery route actually unmounted');
  assert.equal(await evaluate('document.body.style.overflow'),'','Scroll restored after route unmount');
  assert.deepEqual(errors,[]);
  await writeFile('artifacts/phase4/gallery-browser-results.json',JSON.stringify({results,destinationImage,errors,fixture:true},null,2));
  console.log('PASS gallery fixture: 8 locale/viewport combinations; Next Image, category/reset/language, modal keyboard, arrows, close, Escape, focus containment/return, counter, single image, scroll cleanup, reduced motion; no captured errors');
} finally {
  if(fixtureSource) {
    const current=await readFile(dataFile,'utf8');
    if(current===fixtureSource)await writeFile(dataFile,original);
    else if(current!==original)throw new Error('Gallery dataset changed during test; refusing to overwrite it');
  }
  for(const file of created)await unlink(file);
  if(createdDestinationDirectory)await rmdir('public/images/destinations/barelang-bridge').catch(()=>{});
  await fetch(`${debug}/json/close/${tab.id}`).catch(()=>{});socket.close();
}
