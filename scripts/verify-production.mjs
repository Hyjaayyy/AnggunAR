import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3100";
const results = [], links = new Set(), assets = new Set(), external = new Set();
async function request(path, options = {}) {
  return fetch(new URL(path, base), { signal: AbortSignal.timeout(15000), ...options });
}
await mkdir("artifacts/production-readiness", { recursive: true });
try {
  for (const locale of ["id", "en"]) for (const page of ["", "about", "destinations", "destinations/barelang-bridge", "destinations/nongsa-beach", "destinations/abang-island", "packages", "gallery", "contact", "booking", "privacy", "terms", "faq"]) {
    const path = `/${locale}${page ? "/" + page : ""}`;
    const response = await request(path); const html = await response.text();
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get("x-content-type-options"), "nosniff", path);
    assert.equal(response.headers.get("referrer-policy"), "strict-origin-when-cross-origin", path);
    assert.equal(response.headers.get("x-powered-by"), null);
    assert.ok(html.includes(`<html lang="${locale}"`)); assert.ok(html.includes("Anggun AR Sukses Abadi"));
    assert.ok(!html.includes("data-video-debug"), "No debug panel in production HTML");
    assert.ok(!html.includes("DEMO / DRAFT"), "Drafts not exposed");
    for (const match of html.matchAll(/(?:href|src)="([^"<>]+)"/g)) {
      const url = new URL(match[1].replaceAll("&amp;", "&"), base);
      if (url.origin !== new URL(base).origin) { if (url.protocol === "https:") external.add(url.href); continue; }
      if (url.pathname.startsWith("/_next/") || url.pathname.startsWith("/images/") || url.pathname.startsWith("/videos/")) assets.add(url.pathname + url.search);
      else if (!match[1].startsWith("#")) links.add(url.pathname + url.search);
    }
    results.push({ path, status: response.status });
  }
  for (const link of links) { const response = await request(link); assert.equal(response.status, 200, link); await response.body.cancel(); }
  const assetResults = [];
  for (const asset of assets) {
    const response = await request(asset); assert.equal(response.status, 200, asset);
    assetResults.push({ path: asset, status: response.status, type: response.headers.get("content-type"), cache: response.headers.get("cache-control"), bytes: response.headers.get("content-length") }); await response.body.cancel();
  }
  for (const path of ["/.env", "/.git/config", "/package.json", "/src/lib/business.ts", "/fr", "/id/missing", "/en/packages/batam-city-escape?preview=draft", "/id/packages/coastal-slow-days", "/id/destinations/missing", "/videos/home/unknown.mp4"]) {
    const response = await request(path, { redirect: "manual" }); assert.equal(response.status, 404, path); await response.body.cancel();
  }
  const media = [];
  for (const range of [false, true]) {
    const response = await request("/videos/home/batam-cinematic-h264.mp4", range ? { headers: { Range: "bytes=0-1023" } } : {});
    assert.equal(response.status, range ? 206 : 200); assert.equal(response.headers.get("content-type"), "video/mp4");
    if (range) assert.equal(response.headers.get("content-range"), "bytes 0-1023/10907407");
    media.push({ status: response.status, type: response.headers.get("content-type"), range: response.headers.get("content-range") }); await response.body.cancel();
  }
  const invalidRange = await request("/videos/home/batam-cinematic-h264.mp4", { headers: { Range: "bytes=999999999-" } });
  const invalidRangeResult = { status: invalidRange.status, range: invalidRange.headers.get("content-range") }; await invalidRange.body.cancel();
  const root = await request("/?qa=1", { redirect: "manual" }); assert.equal(root.status, 307); assert.ok(root.headers.get("location").endsWith("/id?qa=1")); await root.body.cancel();
  const externalResults = [];
  for (const url of external) {
    try { const response = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(6000) }); externalResults.push({ url, status: response.status }); await response.body?.cancel(); }
    catch (error) { externalResults.push({ url, status: "NOT TESTED", reason: error.name }); }
  }
  const report = { base, results, links: [...links], assets: assetResults, media, invalidRange: invalidRangeResult, external: externalResults };
  await writeFile(`artifacts/production-readiness/http-${new URL(base).hostname}.json`, JSON.stringify(report, null, 2));
  assert.equal(invalidRangeResult.status, 416, "Unsatisfiable byte range must return 416, not a server error");
  console.log(`PASS production HTTP: ${results.length} pages, ${links.size} internal links, ${assets.size} assets, headers, draft isolation, 404, redirect, MP4 200/206/416. External results recorded separately.`);
} catch (error) {
  await writeFile("artifacts/production-readiness/http-failure.json", JSON.stringify({ base, results, error: String(error) }, null, 2)); throw error;
}
