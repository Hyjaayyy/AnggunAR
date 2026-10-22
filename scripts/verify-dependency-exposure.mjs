import { spawnSync } from "node:child_process";
import { createRequire } from "node:module";
import path from "node:path";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { ESLint } from "eslint";

const require = createRequire(import.meta.url);
const versions = {};
for (const name of ["braces", "micromatch", "fast-glob", "@next/eslint-plugin-next", "eslint-config-next"]) {
  versions[name] = JSON.parse(await readFile(path.join("node_modules", name, "package.json"), "utf8")).version;
}
const eslint = new ESLint();
const config = await eslint.calculateConfigForFile("src/app/[locale]/page.tsx");
const glob = require("fast-glob");
const originalGlob = glob.globSync;
let calls = 0;
glob.globSync = (...args) => { calls++; return originalGlob(...args); };
let rootDirs;
try {
  rootDirs = require(path.resolve("node_modules/@next/eslint-plugin-next/dist/utils/get-root-dirs.js")).getRootDirs({ cwd: process.cwd(), settings: config.settings ?? {} });
} finally { glob.globSync = originalGlob; }

// Reproduce only in a bounded child process, never in the web server or linter.
const probe = spawnSync(process.execPath, ["--max-old-space-size=128", "-e", `
try { require('braces').compile('{'.repeat(4000)+'x,y'+'}'.repeat(4000));console.log(JSON.stringify({reproduced:false})); }
catch(error) { console.log(JSON.stringify({reproduced:error.name==='RangeError',name:error.name,message:error.message.slice(0,180)})); }
`], { encoding: "utf8", timeout: 5000, maxBuffer: 16384 });
const report = { versions, configuredNextRootDir: config.settings?.next?.rootDir ?? null, rootDirs, globCallsForCurrentConfig: calls, isolatedAdvisoryProbe: { exit: probe.status, stdout: probe.stdout.trim(), error: probe.error?.message }, scope: "development ESLint configuration; this does not prove all future repository configurations safe" };
await mkdir("artifacts/phase5-1", { recursive: true });
await writeFile("artifacts/phase5-1/dependency-exposure.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
