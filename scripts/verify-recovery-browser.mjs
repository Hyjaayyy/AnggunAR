import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { browserSession } from "./lib/browser-session.mjs";

// Compile the actual error UIs into an isolated React harness. No app route/data
// is modified. Router hooks/Link are adapters; this does not inject a live Next
// server failure or prove hosting-level recovery.
const require = createRequire(import.meta.url);
const webpackPackage = require("next/dist/compiled/webpack/webpack");
webpackPackage.init?.();
const webpack = webpackPackage.webpack;
const directory = path.resolve("artifacts/production-readiness/recovery");
await mkdir(directory, { recursive: true });
await writeFile(path.join(directory, "loader.cjs"), `module.exports=function(source){if(this.resourcePath.endsWith('.css'))return '';return require('typescript').transpileModule(source,{compilerOptions:{esModuleInterop:true,jsx:require('typescript').JsxEmit.ReactJSX,module:require('typescript').ModuleKind.CommonJS,target:require('typescript').ScriptTarget.ES2020}}).outputText}`);
await writeFile(path.join(directory, "navigation.js"), `exports.useParams=()=>({locale:window.__qaLocale});`);
await writeFile(path.join(directory, "link.js"), `module.exports=function Link({children,...props}){return require('react').createElement('a',props,children)};`);
await writeFile(path.join(directory, "entry.jsx"), `
const React=require('react'),{createRoot}=require('react-dom/client');
const PageError=require(${JSON.stringify(path.resolve("src/app/[locale]/error.tsx"))}).default;
const GlobalError=require(${JSON.stringify(path.resolve("src/app/global-error.tsx"))}).default;
const globalMode=window.__qaGlobal;
window.__expectedFailures=0;
class Boundary extends React.Component{
 constructor(props){super(props);this.state={failed:false};this.shouldFail=true}
 static getDerivedStateFromError(){return {failed:true}}
 componentDidCatch(){window.__expectedFailures++}
 render(){if(this.state.failed)return React.createElement(globalMode?GlobalError:PageError,{error:new Error('QA_PRIVATE_DETAIL_MUST_NOT_RENDER'),reset:()=>{this.shouldFail=false;this.setState({failed:false})}});return React.createElement(Healthy,{fail:this.shouldFail})}
}
function Healthy({fail}){if(fail)throw new Error('QA_EXPECTED_RENDER_FAILURE');const content=React.createElement('main',{'data-recovered':true},'Recovered');return globalMode?React.createElement('html',{lang:'id'},React.createElement('head'),React.createElement('body',null,content)):content}
createRoot(globalMode?document:document.getElementById('root')).render(React.createElement(Boundary));
`);
const compiler = webpack({ mode: "production", entry: path.join(directory, "entry.jsx"), output: { path: directory, filename: "bundle.js" }, resolve: { extensions: [".tsx", ".ts", ".jsx", ".js"], alias: { "@": path.resolve("src"), "next/navigation$": path.join(directory, "navigation.js"), "next/link$": path.join(directory, "link.js") } }, module: { rules: [{ test: /\.(?:tsx?|jsx|css)$/, exclude: /node_modules/, use: [path.join(directory, "loader.cjs")] }] }, optimization: { minimize: false }, devtool: false });
await new Promise((resolve, reject) => compiler.run((error, stats) => {
  compiler.close(() => {});
  if (error) reject(error); else if (stats.hasErrors()) reject(new Error(stats.toString({ all: false, errors: true }))); else resolve();
}));
const bundle = await readFile(path.join(directory, "bundle.js"), "utf8");
const browser = await browserSession();
const { send, evaluate, until } = browser;
const results = [];
try {
  // Serve harness through a data URL: no route, server, credentials or telemetry.
  for (const globalMode of [false, true]) for (const locale of ["id", "en"]) {
    console.log(`RUN recovery locale=${locale} global=${globalMode}`);
    const source = `<!doctype html><html><head><link rel="icon" href="data:,"></head><body><div id="root"></div><script>window.__qaLocale=${JSON.stringify(locale)};window.__qaGlobal=${globalMode};${bundle.replaceAll("</script", "<\\/script")}</script></body></html>`;
    await send("Page.navigate", { url: "about:blank" });
    const { frameTree } = await send("Page.getFrameTree");
    await send("Page.setDocumentContent", { frameId: frameTree.frame.id, html: source });
    await until(`!!document.querySelector('[data-${globalMode ? "global" : "page"}-error]')`, "actual error fallback");
    console.log("Fallback rendered");
    const text = await evaluate("document.body.innerText");
    assert.ok(!text.includes("QA_PRIVATE_DETAIL"));
    assert.ok(text.includes(globalMode || locale === "id" ? "Halaman belum dapat ditampilkan" : "This page could not be displayed"));
    assert.equal(await evaluate("window.__expectedFailures"), 1);
    await evaluate("document.querySelector('button').focus()");
    await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13, text: "\r" });
    await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    await until("!!document.querySelector('[data-recovered]')", "keyboard retry recovers");
    results.push({ locale, globalMode, recovered: true, privateErrorHidden: true });
  }
  await writeFile(path.join(directory, "results.json"), JSON.stringify({ scope: "isolated React harness; Next hook/Link adapters; not live server fault injection", results, expectedConsoleErrors: browser.errors }, null, 2));
  console.log("PASS isolated recovery harness: actual route/global error components, ID/EN, keyboard retry recovery, private error text hidden. Live Next server fault injection NOT TESTED.");
} finally { await browser.close(); }
