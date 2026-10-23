import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

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
async function until(expression) {
  for (let attempt=0;attempt<600;attempt++) { if (await evaluate(expression)) return; await delay(100); }
  throw new Error(`Condition timeout: ${expression}`);
}
async function navigate(path) {
  let timeout;
  const load = new Promise((resolve,reject) => { loaded=resolve; timeout=setTimeout(()=>reject(new Error(`Page timeout ${path}`)),process.env.TEST_PREVIEW === "1" ? 60000 : 12000); });
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
  await writeFile(`artifacts/phase3/${name}.png`,Buffer.from(shot.data,"base64"));
}

try {
  await mkdir("artifacts/phase3", { recursive: true });
  await send("Page.enable"); await send("Runtime.enable");
  for (const width of [320,375,390,430,768,1024,1440]) {
    await send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
    for (const locale of ["id", "en"]) for (const page of ["packages", ""]) {
      await navigate(`/${locale}/${page}`);
      const info = await evaluate(`(() => {
        const track=document.querySelector('[data-package-carousel]');
        const cards=[...track.children]; const r=track.getBoundingClientRect();
        return {width:innerWidth,scroll:document.documentElement.scrollWidth,count:cards.length,
          names:cards.map(c=>c.querySelector('h3').textContent),
          columns:getComputedStyle(track).gridTemplateColumns.split(' ').length,
          overflow:getComputedStyle(track).overflowX,snap:getComputedStyle(track).scrollSnapType,
          first:cards[0].getBoundingClientRect().width,track:r.width,
          peek:r.right-cards[1].getBoundingClientRect().left,
          heights:cards.map(c=>({height:c.clientHeight,scroll:c.scrollHeight,width:c.clientWidth,scrollWidth:c.scrollWidth})),
          ctas:cards.map(c=>({detail:c.querySelector('a[href^="/'+document.documentElement.lang+'/packages/"]').getAttribute('href'),wa:c.querySelector('a[href^="https://wa.me/"]').href})),
          indicator:track.nextElementSibling.textContent};
      })()`);
      assert.ok(info.scroll<=width+1,`page overflow ${width} ${locale} ${page}`);
      assert.equal(info.count,page ? 6 : 3); assert.equal(new Set(info.names).size,info.count);
      assert.ok(info.heights.every(c=>c.scroll<=c.height+1 && c.scrollWidth<=c.width+1),'No card content clipping');
      assert.ok(info.ctas.every(c=>c.wa.startsWith('https://wa.me/6282379595106?') && c.detail.startsWith(`/${locale}/packages/`)));
      if(width<768) {
        assert.equal(info.overflow,'auto'); assert.equal(info.snap,'x mandatory');
        assert.ok(info.first<info.track && info.peek>8,'Next card is visible');
        await evaluate("document.querySelector('[data-package-carousel]').focus({preventScroll:true})");
        await key('End','End',35); await delay(700);
        assert.ok(await evaluate(`document.querySelector('[data-package-carousel]').nextElementSibling.textContent.includes('${info.count} / ${info.count}')`),'End indicator sync');
        await key('Home','Home',36); await delay(700);
        assert.ok(await evaluate("document.querySelector('[data-package-carousel]').nextElementSibling.textContent.includes('1 /')"));
        await key('ArrowRight','ArrowRight',39); await delay(700);
        assert.ok(await evaluate("document.querySelector('[data-package-carousel]').scrollLeft>0"));
        await key('ArrowLeft','ArrowLeft',37); await delay(700);
        assert.ok(await evaluate("document.querySelector('[data-package-carousel]').scrollLeft<2"));
      } else {
        assert.equal(info.columns,width>=1280 ? 3 : 2);
        assert.equal(info.overflow,'visible');
        assert.equal(await evaluate("document.querySelector('[data-package-carousel]').scrollWidth<=document.querySelector('[data-package-carousel]').clientWidth+1"),true);
      }
      if(page && [375,1440].includes(width)) await screenshot(`carousel-${locale}-${width}`,true);
      results.push({width,locale,page,...info});
    }
  }
  await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await send('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:1});
  for(const platform of ['Android','iPhone']) {
    await send('Emulation.setUserAgentOverride',{userAgent:platform==='Android' ? 'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/130.0.0.0 Mobile Safari/537.36' : 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',platform});
    await navigate('/id/packages');
    await evaluate("document.querySelector('[data-package-carousel]').scrollIntoView({block:'center',behavior:'instant'})");
    const p=await evaluate("(() => {const r=document.querySelector('[data-package-carousel]').getBoundingClientRect();return {x:r.left+r.width*.8,y:Math.max(150,r.top+120)}})()");
    async function swipe(dx,dy) {
      await send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[p]});
      for(let step=1;step<=10;step++) {await send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:p.x+dx*step/10,y:p.y+dy*step/10}]});await delay(25);}
      await send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await delay(700);
    }
    await swipe(-200,0);
    assert.ok(await evaluate("document.querySelector('[data-package-carousel]').scrollLeft>100"),`${platform} swipe forward`);
    p.x=70;await swipe(200,0);
    assert.ok(await evaluate("document.querySelector('[data-package-carousel]').scrollLeft<2"),`${platform} swipe back`);
    const before=await evaluate('scrollY'); p.x=180;await swipe(0,-140);
    assert.ok(await evaluate(`scrollY>${before}+30`),`${platform} page vertical touch scroll`);
  }
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
  await evaluate("document.querySelector('[data-package-carousel]').focus({preventScroll:true})");
  await key('End','End',35);
  assert.ok(await evaluate("document.querySelector('[data-package-carousel]').nextElementSibling.textContent.includes('6 / 6')"));
  await key('Home','Home',36);
  await evaluate("document.querySelector('main article a[href^=\"https://wa.me/\"]').addEventListener('click',e=>{e.preventDefault();window.__quoteClicked=true},{once:true})");
  await click('main article a[href^="https://wa.me/"]');
  assert.equal(await evaluate('window.__quoteClicked'),true,'WhatsApp CTA is clickable; prevent navigation to avoid external messages');
  await click('main article a[href^="/id/packages/"]');
  await until("location.pathname==='/id/packages/batam-city-highlights'");
  assert.equal(await evaluate("document.querySelector('main h1').textContent"),'Batam City Highlights');
  assert.deepEqual(errors,[]);
  await writeFile('artifacts/phase3/carousel-results.json',JSON.stringify({results,errors,touch:'Chromium Android/iPhone emulation; physical devices/WebKit not tested'},null,2));
  console.log(`PASS ${results.length} ID/EN catalogue/home viewport combinations; desktop columns, native touch both directions/vertical scroll, keyboard, synced indicator, official CTA, detail navigation, reduced motion, no page overflow/duplicates/hydration errors`);
} finally {
  await fetch(`${debug}/json/close/${tab.id}`).catch(()=>{});socket.close();
}
