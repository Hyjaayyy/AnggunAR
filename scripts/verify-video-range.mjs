import assert from "node:assert/strict";
import { stat, open, mkdir, writeFile, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";

const origins = (process.env.TEST_ORIGINS ?? process.env.TEST_BASE_URL ?? "http://localhost:3100").split(",");
const source = "/videos/home/batam-cinematic-h264.mp4";
const file = "public" + source;
const size = (await stat(file)).size;
const results = [];
const failures = [];
const digest = bytes => createHash("sha256").update(bytes).digest("hex");
const fullDigest = digest(await readFile(file));
async function expectedBytes(start, length) {
  const handle = await open(file, "r");
  try { const bytes = Buffer.alloc(length); await handle.read(bytes, 0, length, start); return bytes; }
  finally { await handle.close(); }
}
const cases = [
  { label: "normal", status: 200, start: 0, length: size },
  { label: "head", method: "HEAD", status: 200, length: 0 },
  { label: "first byte", range: "bytes=0-0", status: 206, start: 0, length: 1 },
  { label: "first KB", range: "bytes=0-1023", status: 206, start: 0, length: 1024 },
  { label: "suffix", range: "bytes=-1024", status: 206, start: size - 1024, length: 1024 },
  { label: "one byte suffix", range: "bytes=-1", status: 206, start: size - 1, length: 1 },
  { label: "suffix exactly file size", range: `bytes=-${size}`, status: 206, start: 0, length: size },
  { label: "very large suffix", range: "bytes=-999999999999999999999999", status: 206, start: 0, length: size },
  { label: "suffix larger than file", range: `bytes=-${size + 100}`, status: 206, start: 0, length: size },
  { label: "open ended", range: `bytes=${size - 1024}-`, status: 206, start: size - 1024, length: 1024 },
  { label: "last byte", range: `bytes=${size - 1}-${size - 1}`, status: 206, start: size - 1, length: 1 },
  { label: "end clamped", range: `bytes=${size - 2}-${size + 100}`, status: 206, start: size - 2, length: 2 },
  { label: "whole file open ended", range: "bytes=0-", status: 206, start: 0, length: size },
  { label: "start at EOF", range: `bytes=${size}-`, status: 416 },
  { label: "start past EOF", range: `bytes=${size + 100}-`, status: 416 },
  { label: "very large offset", range: "bytes=999999999999999999999999-", status: 416 },
  { label: "reversed endpoints", range: "bytes=5-1", status: 416 },
  { label: "zero suffix", range: "bytes=-0", status: 416 },
  { label: "empty byte range", range: "bytes=", status: 416 },
  { label: "non numeric byte range", range: "bytes=abc", status: 416 },
  { label: "all ranges unsatisfiable", range: `bytes=${size}-,${size + 5}-`, status: 416 },
  { label: "mixed satisfiable", range: `bytes=${size}-,0-1`, status: 206, start: 0, length: 2 },
  { label: "adjacent ranges coalesced", range: "bytes=0-1,2-3", status: 206, start: 0, length: 4 },
  // Next's static handler ignores unsupported multipart/units/syntax, as HTTP permits.
  { label: "disjoint ranges ignored", range: "bytes=0-1,4-5", status: 200, start: 0, length: size },
  { label: "unknown unit ignored", range: "items=0-1", status: 200, start: 0, length: size },
  { label: "unrecognized header ignored", range: "not-a-range", status: 200, start: 0, length: size },
];
await mkdir("artifacts/phase5-1", { recursive: true });
try {
  for (const origin of origins) {
    const metadata = await fetch(origin + source, { method: "HEAD", signal: AbortSignal.timeout(15000) });
    assert.equal(metadata.status, 200);
    const etag = metadata.headers.get("etag");
    const lastModified = metadata.headers.get("last-modified");
    const conditional = [
      { label: "fresh cache precedes invalid range", range: `bytes=${size}-`, headers: { "If-None-Match": etag }, status: 304, length: 0 },
      { label: "If-Range mismatch ignores invalid range", range: `bytes=${size}-`, headers: { "If-Range": '"different-resource"' }, status: 200, start: 0, length: size },
      { label: "If-Range date matches invalid range", range: `bytes=${size}-`, headers: { "If-Range": lastModified }, status: 416 },
      { label: "If-Range date matches valid range", range: "bytes=0-1", headers: { "If-Range": lastModified }, status: 206, start: 0, length: 2 },
      { label: "fresh cache with oversized suffix", range: `bytes=-${size + 100}`, headers: { "If-None-Match": etag }, status: 304, length: 0 },
      { label: "If-Range mismatch with oversized suffix", range: `bytes=-${size + 100}`, headers: { "If-Range": '"different-resource"' }, status: 200, start: 0, length: size },
      { label: "precondition failure", range: `bytes=${size}-`, headers: { "If-Match": '"different-resource"' }, status: 412 },
    ];
    assert.ok(etag && lastModified, "Static validators must remain available");
    for (const test of [...cases, ...conditional]) {
      // Prevent Undici's implicit no-cache on conditional headers from changing
      // the freshness semantics this test intends to exercise.
      const response = await fetch(origin + source, { method: test.method ?? "GET", headers: { "Cache-Control": "max-age=0", ...test.headers, ...(test.range ? { Range: test.range } : {}) }, signal: AbortSignal.timeout(15000) });
      const body = Buffer.from(await response.arrayBuffer());
      const result = { origin, label: test.label, range: test.range ?? null, status: response.status, contentRange: response.headers.get("content-range"), contentType: response.headers.get("content-type"), bytes: body.length };
      results.push(result);
      try {
      assert.equal(response.status, test.status, JSON.stringify(result));
      if (test.status === 416) assert.equal(result.contentRange, `bytes */${size}`, test.label);
      if (test.status === 206) assert.equal(result.contentRange, `bytes ${test.start}-${test.start + test.length - 1}/${size}`, test.label);
      if (test.length !== undefined) assert.equal(body.length, test.length, test.label);
      if ([200, 206].includes(test.status)) {
        assert.equal(result.contentType, "video/mp4");
        assert.equal(response.headers.get("accept-ranges"), "bytes");
        if (test.method !== "HEAD") {
          if (test.length === size) assert.equal(digest(body), fullDigest, test.label);
          else assert.deepEqual(body, await expectedBytes(test.start, test.length), test.label);
        }
      }
      console.log(`PASS Range ${new URL(origin).hostname}: ${test.label} -> ${response.status}`);
      } catch (error) {
        failures.push({ ...result, expected: test.status, error: error.message });
        console.log(`FAIL Range ${new URL(origin).hostname}: ${test.label} -> ${response.status}, expected ${test.status}`);
      }
    }
    for (const path of ["/_error", "/416", "/videos/home/not-allowed.mp4", source + "/extra"]) {
      const response = await fetch(origin + path, { signal: AbortSignal.timeout(15000) });
      assert.equal(response.status, 404, `Reserved fallback must not expose new routes: ${path}`); await response.body.cancel();
    }
  }
} finally {
  await writeFile("artifacts/phase5-1/video-range-results.json", JSON.stringify({ origins, size, fullDigest, results, failures }, null, 2));
}
assert.deepEqual(failures, [], "Range matrix must preserve HTTP semantics and exact response bytes");
console.log(`PASS ${results.length} HTTP Range cases with byte-level verification; static handler and bilingual routing preserved`);
