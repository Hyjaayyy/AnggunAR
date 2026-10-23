import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";
import { randomBytes } from "node:crypto";
import { spawn, spawnSync } from "node:child_process";

// Local TLS ingress fixture, not a Vercel deployment or a trusted system certificate.
const directory = path.resolve("artifacts/phase6-2/tls");
fs.mkdirSync(directory, { recursive: true });
const keyFile = path.join(directory, "qa.key"), certFile = path.join(directory, "qa.pem");
const openssl = process.env.OPENSSL_PATH ?? (process.platform === "win32" ? "C:/Program Files/Git/usr/bin/openssl.exe" : "openssl");
const certificate = spawnSync(openssl, ["req", "-x509", "-newkey", "rsa:2048", "-nodes", "-keyout", keyFile, "-out", certFile, "-days", "1", "-subj", "/CN=localhost", "-addext", "subjectAltName=DNS:localhost,IP:127.0.0.1"], { stdio: "ignore", timeout: 15000 });
assert.equal(certificate.status, 0, "Local OpenSSL is required; no certificate is installed in the OS");
const ca = fs.readFileSync(certFile);
const password = randomBytes(36).toString("base64url"), username = "qa-reviewer";
const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
let child;
const results = [];
const gateway = https.createServer({ key: fs.readFileSync(keyFile), cert: ca }, (request, response) => {
  const upstream = http.request({ hostname: "127.0.0.1", port: 3201, path: request.url, method: request.method, headers: { ...request.headers, "x-forwarded-proto": "https", "x-forwarded-host": "localhost:3443", host: "localhost:3443" } }, incoming => {
    response.writeHead(incoming.statusCode, incoming.headers); incoming.pipe(response);
  });
  upstream.on("error", () => { response.writeHead(502); response.end("QA upstream unavailable"); });
  request.pipe(upstream);
});
function request(urlPath, headers = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(`https://localhost:3443${urlPath}`, { ca, headers, timeout: 20000 }, response => {
      let body = ""; response.setEncoding("utf8"); response.on("data", chunk => { body += chunk; });
      response.on("end", () => resolve({ status: response.statusCode, headers: response.headers, body }));
    });
    req.on("error", reject); req.on("timeout", () => req.destroy(new Error("QA HTTPS timeout")));
  });
}
async function start(environment, enabled = "true") {
  child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3201"], {
    env: { ...process.env, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1", VERCEL: "1", VERCEL_ENV: environment, OWNER_REVIEW_ENABLED: enabled, OWNER_REVIEW_USERNAME: username, OWNER_REVIEW_PASSWORD: password }, stdio: "ignore",
  });
  for (let attempt = 0; attempt < 100; attempt++) {
    if (child.exitCode !== null) throw new Error("QA Next server exited before readiness");
    try { const response = await fetch("http://127.0.0.1:3201/id", { signal: AbortSignal.timeout(1000) }); await response.body.cancel(); if (response.status === 200) return; } catch { /* bounded startup polling */ }
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  throw new Error("QA Next server readiness timeout");
}
async function stop() {
  if (!child || child.exitCode !== null) return;
  const stopped = new Promise(resolve => child.once("exit", resolve)); child.kill("SIGTERM"); await stopped; child = undefined;
}
try {
  await new Promise(resolve => gateway.listen(3443, "localhost", resolve));
  await start("preview");
  for (const locale of ["id", "en"]) {
    for (const headers of [{}, { "x-owner-review-authorized": "true" }, { authorization: "Basic forged" }]) {
      const denied = await request(`/${locale}/packages?preview=draft`, headers);
      assert.equal(denied.status, 401); assert.ok(!denied.body.includes("Batam City Highlights"));
      assert.ok(denied.headers["www-authenticate"].startsWith("Basic"));
    }
    const allowed = await request(`/${locale}/packages?preview=draft`, { authorization });
    assert.equal(allowed.status, 200); assert.ok(allowed.body.includes("Batam City Highlights"));
    const internal = await request(`/${locale}/packages/batam-city-escape?preview=draft`, { authorization });
    assert.equal(internal.status, 200); assert.ok(internal.body.includes("DEMO / DRAFT"));
    assert.equal((await request(`/${locale}/packages/batam-city-escape?preview=draft`)).status, 401);
    assert.equal((await request(`/${locale}/packages/batam-city-escape`)).status, 404);
    // Next replaces Vary with its RSC variants; the authoritative barrier is private/no-store.
    assert.ok(allowed.headers["cache-control"].includes("no-store")); assert.ok(allowed.headers["cache-control"].includes("private"));
    assert.ok(allowed.body.includes('content="noindex, nofollow"')); assert.ok(!allowed.body.includes(password));
    for (const slug of ["batam-city-highlights", "barelang-culinary-experience", "batam-weekend-escape", "batam-complete-discovery", "bintan-island-escape", "batam-bintan-discovery"]) {
      const detail = await request(`/${locale}/packages/${slug}?preview=draft`, { authorization });
      assert.equal(detail.status, 200); assert.ok(detail.body.includes(locale === "id" ? "Minta Penawaran" : "Request a Quote"));
      assert.ok(!detail.body.includes("/booking?package=")); assert.ok(!detail.body.includes(password));
      const anonymous = await request(`/${locale}/packages/${slug}?preview=draft`); assert.equal(anonymous.status, 401);
      const booking = await request(`/${locale}/booking?package=${slug}&preview=draft`, { authorization });
      assert.equal(booking.status, 200); assert.ok(!booking.body.includes("Batam City Highlights"));
      assert.ok(!/<main[\s\S]*?href="https:\/\/wa\.me\/[^"]*"[\s\S]*?<\/main>/.test(booking.body));
    }
    assert.equal((await request(`/${locale}/packages?preview=draft`)).status, 401, "No cross-user cache leak after authorized response");
    results.push({ environment: "preview", locale, anonymous: 401, authorized: 200, sixDrafts: true, noStore: true, vary: allowed.headers.vary, bookingBlocked: true });
  }
  await stop();
  for (const [environment, enabled] of [["production", "true"], ["preview", "false"]]) {
    await start(environment, enabled);
    for (const locale of ["id", "en"]) {
      const listing = await request(`/${locale}/packages?preview=draft`, { authorization });
      assert.equal(listing.status, 200); assert.ok(!listing.body.includes("Batam City Escape"));
      assert.equal((await request(`/${locale}/packages/batam-city-escape?preview=draft`, { authorization })).status, 404);
      results.push({ environment, enabled, locale, draftHidden: true });
    }
    await stop();
  }
  console.log("PASS local verified-TLS owner review: real production build, anonymous/forged 401, ID/EN six authorized drafts, no-store/cache isolation, booking guard, production and default-OFF deny; Vercel deployment NOT TESTED");
} finally {
  await stop(); await new Promise(resolve => gateway.close(resolve));
  fs.writeFileSync("artifacts/phase6-2/https-results.json", JSON.stringify({ results, credentialsPersisted: false, certificateScope: "local fixture only", vercelTested: false }, null, 2));
}
