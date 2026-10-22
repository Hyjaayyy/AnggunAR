import assert from "node:assert/strict";
import { mkdir, writeFile, unlink, rmdir } from "node:fs/promises";

const debug = process.env.BROWSER_DEBUG_URL ?? "http://127.0.0.1:9333";
const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3100";
const tab = await fetch(`${debug}/json/new?about:blank`, { method: "PUT" }).then((r) => r.json());
const socket = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, {once:true}); socket.addEventListener("error", reject, {once:true}); });
let requestId = 0;
let loaded;
const pending = new Map();
const errors = [];
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
  void load.catch(() => {});
  try { await send("Page.navigate",{url:new URL(path,base).href}); await load; }
  finally { clearTimeout(timeout); loaded=undefined; }
  await evaluate("document.fonts.ready"); await delay(250);
}
const directory = "public/images/packages/batam-city-escape";
const file = `${directory}/cover.webp`;
let createdFile = false;
let createdDirectory = false;
try {
  await send("Page.enable"); await send("Runtime.enable");
  await navigate("/id/packages?preview=draft");
  assert.ok(await evaluate("document.querySelector('main').innerText.includes('DEMO / DRAFT')"), "Image test requires the development preview server");
  const encoded = await evaluate(`(() => {const c=document.createElement('canvas');c.width=64;c.height=48;const ctx=c.getContext('2d');ctx.fillStyle='#087f8c';ctx.fillRect(0,0,64,48);return c.toDataURL('image/webp').split(',')[1]})()`);
  createdDirectory = !!(await mkdir(directory,{recursive:true}));
  try { await writeFile(file,Buffer.from(encoded,"base64"),{flag:"wx"}); createdFile=true; }
  catch (error) { if (error.code !== "EEXIST") throw error; }
  await navigate("/id/packages/batam-city-escape?preview=draft");
  const photo = await evaluate(`(async () => {
    const image=document.querySelector('main [data-package-photo] img');
    if(!image) throw new Error('Next Image missing');
    await Promise.race([image.decode(),new Promise((_,reject)=>setTimeout(()=>reject(new Error('Image decode timeout')),10000))]);
    return {src:image.currentSrc,width:image.naturalWidth,position:getComputedStyle(image).objectPosition,alt:image.alt,slots:document.querySelectorAll('main [data-package-photo]').length};
  })()`);
  assert.ok(photo.src.includes('/_next/image?'));assert.ok(photo.width>0);assert.equal(photo.position,'50% 50%');assert.equal(photo.slots,3);assert.ok(photo.alt.includes('Batam City Escape'));
  assert.deepEqual(errors,[]);
  await writeFile('artifacts/phase3/image-test.json',JSON.stringify({photo,synthetic:createdFile,errors},null,2));
  console.log('PASS available local WebP: Next Image optimization, decoded pixels, focal point, alt text, 3 slots; temporary test file cleaned');
} finally {
  if(createdFile) await unlink(file);
  if(createdDirectory) await rmdir(directory).catch(()=>{});
  await fetch(`${debug}/json/close/${tab.id}`).catch(()=>{});socket.close();
}
