import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { tsModuleLoader } from "./lib/ts-module.mjs";
import { NextRequest } from "next/server.js";

// Ephemeral test-only credentials never printed, written or used on a deployed site.
const password = randomBytes(36).toString("base64url");
const username = "qa-reviewer";
const validEnv = { NODE_ENV: "production", VERCEL: "1", VERCEL_ENV: "preview", OWNER_REVIEW_ENABLED: "true", OWNER_REVIEW_USERNAME: username, OWNER_REVIEW_PASSWORD: password };
const authorization = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
const requestHeaders = new Headers({ authorization, "x-forwarded-proto": "https" });
let checks = 0;
for (const override of [
  { OWNER_REVIEW_ENABLED: undefined }, { OWNER_REVIEW_ENABLED: "false" }, { OWNER_REVIEW_PASSWORD: undefined }, { OWNER_REVIEW_PASSWORD: "short" },
  { OWNER_REVIEW_USERNAME: undefined }, { VERCEL_ENV: "production" }, { VERCEL_ENV: "development" }, { VERCEL_ENV: undefined }, { VERCEL: undefined },
  { NODE_ENV: "development", VERCEL_ENV: "production" }, { NODE_ENV: "test" },
]) {
  const load = tsModuleLoader({ env: { ...validEnv, ...override }, requestHeaders });
  const review = load("src/lib/owner-review.ts");
  assert.equal(review.ownerReviewEnabled(), false); assert.equal(review.authorizeOwnerReview(requestHeaders, "https:"), null);
  assert.equal(await review.packageReviewAccess({ preview: "draft" }), null); checks++;
}
const env = { ...validEnv };
const load = tsModuleLoader({ env, requestHeaders });
const review = load("src/lib/owner-review.ts"), lib = load("src/lib/tour-packages.ts");
assert.equal(review.ownerReviewEnabled(), true);
for (const headers of [new Headers(), new Headers({ authorization: "Bearer forged" }), new Headers({ authorization: "Basic invalid!" }), new Headers({ authorization: `Basic ${Buffer.from(`${username}:wrong`).toString("base64")}` }), new Headers({ "x-owner-review-authorized": "true", "x-vercel-protection-bypass": "forged", "x-forwarded-proto": "https" })]) {
  assert.equal(review.authorizeOwnerReview(headers, "https:"), null); checks++;
}
assert.equal(review.authorizeOwnerReview(requestHeaders, "http:"), null);
assert.equal(await review.packageReviewAccess({ preview: ["draft", "draft"] }), null);
assert.equal(await review.packageReviewAccess({}), null);
const access = await review.packageReviewAccess({ preview: "draft" });
assert.ok(access); assert.equal(review.isOwnerReviewAccess(access), true);
assert.equal(lib.getPackages(access).length, 9);
assert.equal(lib.getPackages().length, 0);
assert.equal(lib.getPackages(true).length, 0);
assert.equal(lib.getPackages({}).length, 0);
assert.equal(lib.getPackage("batam-city-highlights"), undefined, "Booking resolver never receives review authorization");
assert.equal(lib.getPackage("batam-city-highlights", access)?.status, "draft");
const anonymousLoad = tsModuleLoader({ env, requestHeaders: new Headers({ "x-forwarded-proto": "https", "x-owner-review-authorized": "true" }) });
assert.equal(await anonymousLoad("src/lib/owner-review.ts").packageReviewAccess({ preview: "draft" }), null);
assert.equal(anonymousLoad("src/lib/tour-packages.ts").getPackages(access).length, 0, "Foreign capability cannot be forged or replayed into another module instance");
const detail = load("src/app/[locale]/packages/[slug]/page.tsx");
const anonymousDetail = anonymousLoad("src/app/[locale]/packages/[slug]/page.tsx");
const proxy = load("src/proxy.ts").proxy;
for (const locale of ["id", "en"]) {
  const props = { params: Promise.resolve({ locale, slug: "batam-city-highlights" }), searchParams: Promise.resolve({ preview: "draft" }) };
  assert.ok((await detail.generateMetadata(props)).title.includes("Batam City Highlights"));
  await assert.rejects(() => anonymousDetail.generateMetadata(props), /NEXT_HTTP_ERROR_FALLBACK;404/);
  await assert.rejects(() => anonymousDetail.default(props), /NEXT_HTTP_ERROR_FALLBACK;404/);
  const listing = await anonymousLoad("src/app/[locale]/packages/page.tsx").default({ params: Promise.resolve({ locale }), searchParams: Promise.resolve({ preview: "draft" }) });
  function text(n) { return typeof n === "string" ? n : Array.isArray(n) ? n.map(text).join(" ") : n && typeof n === "object" ? text(n.props?.children) : ""; }
  assert.ok(!text(listing).includes("Batam City Highlights")); checks++;
  const denied = await proxy(new NextRequest(`https://review.example/${locale}/packages?preview=draft`));
  assert.equal(denied.status, 401); assert.ok(denied.headers.get("www-authenticate").startsWith("Basic"));
  assert.ok(denied.headers.get("cache-control").includes("no-store"));
  const allowed = await proxy(new NextRequest(`https://review.example/${locale}/packages/batam-city-highlights?preview=draft`, { headers: requestHeaders }));
  assert.equal(allowed.status, 200); assert.ok(allowed.headers.get("cache-control").includes("no-store")); assert.ok(allowed.headers.get("vary").includes("Authorization"));
  assert.equal((await proxy(new NextRequest(`http://review.example/${locale}/packages?preview=draft`, { headers: requestHeaders }))).status, 403);
  const booking = await load("src/app/[locale]/[slug]/page.tsx").default({ params: Promise.resolve({ locale, slug: "booking" }), searchParams: Promise.resolve({ package: "batam-city-highlights", preview: "draft" }) });
  assert.ok(!text(booking).includes("Batam City Highlights"));
}
env.OWNER_REVIEW_PASSWORD = randomBytes(36).toString("base64url");
assert.equal(review.isOwnerReviewAccess(access), false, "Credential rotation invalidates an old capability");
env.VERCEL_ENV = "production";
assert.equal(lib.getPackages(access).length, 0, "Public production denies even previously authorized access");
console.log(`PASS owner-review ${checks} policy/anonymous cases plus credential verification, HTTPS, opaque resolver authorization, metadata, booking isolation and rotation; no real credentials used`);

if (process.env.TEST_BASE_URL) {
  for (const locale of ["id", "en"]) {
    const url = `${process.env.TEST_BASE_URL}/${locale}/packages?preview=draft`;
    for (const headers of [{}, { "x-owner-review-authorized": "true", "x-forwarded-proto": "https" }, { authorization }]) {
      const response = await fetch(url, { headers }); const html = await response.text();
      assert.equal(response.status, 200, "Default-off public listing stays public without drafts");
      assert.ok(!html.includes("Batam City Highlights"));
    }
    const detailResponse = await fetch(`${process.env.TEST_BASE_URL}/${locale}/packages/batam-city-highlights?preview=draft`);
    assert.equal(detailResponse.status, 404);
  }
  console.log("PASS live default-off anonymous/forged-header HTTP and draft detail 404 ID/EN");
}
