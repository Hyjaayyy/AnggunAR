import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3100";
const origins = process.env.TEST_ORIGINS ?? base;
const cases = [
  "verify-routes.mjs", "verify-owner-review.mjs", "verify-packages.mjs", "verify-market-catalog.mjs", "verify-contact.mjs", "verify-destinations.mjs", "verify-home-video.mjs", "verify-video-range.mjs", "verify-production.mjs",
  "verify-browser.mjs", "verify-contact-browser.mjs", "verify-hero-browser.mjs", "verify-about-browser.mjs", "verify-packages-browser.mjs", "verify-destinations-browser.mjs",
  "verify-home-video-playback-browser.mjs", "verify-home-video-lifecycle-browser.mjs", "verify-home-video-rendering-browser.mjs", "verify-video-debug-browser.mjs", "verify-production-browser.mjs", "verify-recovery-browser.mjs",
];
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: "1", TEST_BASE_URL: base, TEST_ORIGINS: origins, BROWSER_DEBUG_URL: process.env.BROWSER_DEBUG_URL ?? "http://127.0.0.1:9333", TEST_EXPECT_PRODUCTION: "1", TEST_PREVIEW: "0", VIDEO_STAGE: "production-readiness", RENDER_MODE: "production-readiness", EXPECT_VISIBLE: "1" };
const results = [];
await mkdir("artifacts/production-readiness", { recursive: true });
for (const name of cases) {
  console.log(`RUN ${name}`);
  const result = spawnSync(process.execPath, [`scripts/${name}`], { env, encoding: "utf8", timeout: 600000, maxBuffer: 8 * 1024 * 1024 });
  const output = (result.stdout ?? "") + (result.stderr ?? "");
  await writeFile(`artifacts/production-readiness/${name}.log`, output);
  const status = result.status === 0 && !result.error ? "PASS" : "FAIL";
  results.push({ name, status, exit: result.status, error: result.error?.message });
  await writeFile("artifacts/production-readiness/suite.json", JSON.stringify({ base, origins, results }, null, 2));
  console.log(`${status} ${name}`);
  if (status === "FAIL") console.log(output.slice(-3500));
}
if (results.some(result => result.status !== "PASS")) process.exitCode = 1;
