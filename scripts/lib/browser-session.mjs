/** Local CDP adapter; uses installed Chromium without downloading browsers. */
export async function browserSession() {
  const debug = process.env.BROWSER_DEBUG_URL ?? "http://127.0.0.1:9333";
  const tab = await fetch(`${debug}/json/new?about:blank`, { method: "PUT", signal: AbortSignal.timeout(10000) }).then(r => r.json());
  const socket = new WebSocket(tab.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
  const pending = new Map(), errors = [], networkFailures = [], responses = [];
  let id = 0;
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === "Runtime.exceptionThrown") errors.push(message.params.exceptionDetails);
    if (message.method === "Runtime.consoleAPICalled" && message.params.type === "error") errors.push(message.params.args.map(arg => arg.value ?? arg.description));
    if (message.method === "Network.loadingFailed" && !message.params.canceled) networkFailures.push(message.params);
    if (message.method === "Network.responseReceived") responses.push(message.params.response);
    const item = pending.get(message.id);
    if (item) { pending.delete(message.id); clearTimeout(item.timer); if (message.error) item.reject(new Error(JSON.stringify(message.error))); else item.resolve(message.result); }
  });
  function send(method, params = {}) {
    const request = ++id;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => { pending.delete(request); reject(new Error(`CDP timeout: ${method}`)); }, 20000);
      pending.set(request, { resolve, reject, timer }); socket.send(JSON.stringify({ id: request, method, params }));
    });
  }
  async function evaluate(expression) {
    const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  }
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
  async function until(expression, label) {
    for (let n = 0; n < 200; n++) { if (await evaluate(expression)) return; await delay(100); }
    throw new Error(`Timed out: ${label}`);
  }
  async function navigate(url) {
    await send("Page.navigate", { url });
    await until(`location.href===${JSON.stringify(url)} && document.readyState==='complete' && !!document.querySelector('main')`, `navigate ${url}`);
    await evaluate("document.fonts.ready");
  }
  async function close() {
    await fetch(`${debug}/json/close/${tab.id}`).catch(() => {}); socket.close();
    for (const item of pending.values()) { clearTimeout(item.timer); item.reject(new Error("Browser session closed")); }
    pending.clear();
  }
  await send("Page.enable"); await send("Runtime.enable"); await send("Network.enable");
  await send("Page.bringToFront"); await send("Emulation.setFocusEmulationEnabled", { enabled: true });
  return { send, evaluate, delay, until, navigate, close, errors, networkFailures, responses };
}
