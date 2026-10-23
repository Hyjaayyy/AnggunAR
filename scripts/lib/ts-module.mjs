import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
export function tsModuleLoader({ env = { NODE_ENV: "production" }, requestHeaders = new Headers(), modules = {} } = {}) {
  const cache = new Map();
  function load(file) {
    const absolute = path.resolve(file); if (cache.has(absolute)) return cache.get(absolute);
    const exports = {}; cache.set(absolute, exports);
    const source = ts.transpileModule(readFileSync(absolute, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
    vm.runInNewContext(source, { exports, Headers, URLSearchParams, process: { env, cwd: () => process.cwd() }, require: name => {
      if (name === "server-only") return {};
      // CSS is validated by the production build and browser, not the isolated TS loader.
      if (name.endsWith(".module.css")) return {};
      if (name === "next/headers") return { headers: async () => requestHeaders };
      if (Object.hasOwn(modules, name)) return modules[name];
      if (name.startsWith("@/") || name.startsWith(".")) {
        const base = name.startsWith("@/") ? path.resolve("src", name.slice(2)) : path.resolve(path.dirname(absolute), name);
        const resolved = [base, `${base}.ts`, `${base}.tsx`].find(p => existsSync(p));
        if (resolved) return load(resolved);
      }
      return require(name);
    } }, { filename: absolute });
    return exports;
  }
  return load;
}
