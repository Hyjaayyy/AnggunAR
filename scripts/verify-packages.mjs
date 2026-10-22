import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { tsModuleLoader } from "./lib/ts-module.mjs";

// Execute the actual TypeScript server module with isolated environment and test data.
async function load(file, env, data) {
  const password = randomBytes(36).toString("base64url");
  const read = tsModuleLoader({ env: { NODE_ENV: env, OWNER_REVIEW_ENABLED: "true", OWNER_REVIEW_USERNAME: "qa-reviewer", OWNER_REVIEW_PASSWORD: password }, requestHeaders: new Headers({ authorization: `Basic ${Buffer.from(`qa-reviewer:${password}`).toString("base64")}` }), modules: data ? { "@/data/tour-packages": { tourPackages: data } } : {} });
  return { ...read(file), reviewAccess: await read("src/lib/owner-review.ts").packageReviewAccess({ preview: "draft" }) };
}
const { tourPackages } = await load("src/data/tour-packages.ts", "development");
const draft = tourPackages[0];
const official = { ...draft, slug: "test-only-official", demo: false, status: "published", durationDays: 2, location: { id: "test-location", label: { id: "Lokasi uji", en: "Test location" } } };
const data = [...tourPackages, official, { ...official, slug: "test-published-demo", demo: true }];
for (const env of ["development", "production", "test"]) {
  const lib = await load("src/lib/tour-packages.ts", env, data);
  assert.equal(lib.getPackages().length, 1);
  assert.equal(lib.getPackage(draft.slug), undefined);
  assert.equal(!!lib.reviewAccess, env === "development");
  assert.equal(lib.getPackages(true).length, 1, "Boolean is not authorization");
  assert.equal(lib.getPackages(lib.reviewAccess).length, env === "development" ? data.length : 1);
  assert.equal(lib.getPackage(draft.slug, lib.reviewAccess)?.slug, env === "development" ? draft.slug : undefined);
  for (const locale of ["id", "en"]) {
    assert.deepEqual(Array.from(lib.filterPackages(data, { q: "  BATAM CITY  " }, locale), p => p.slug).sort(), [draft.slug, "batam-city-highlights", official.slug, "test-published-demo"].sort());
    assert.equal(lib.filterPackages(data, { category: "coast" }, locale).length, 1);
    assert.equal(lib.filterPackages(data, { destination: "test-location", duration: "2", category: "city" }, locale).length, 2);
    assert.equal(lib.filterPackages(data, { q: "no-match" }, locale).length, 0);
    assert.equal(lib.filterPackages(data, { destination: "unknown" }, locale).length, 0);
    assert.equal(lib.filterPackages(data, { duration: "99" }, locale).length, 0);
  }
  assert.equal(await lib.availableImage("/images/packages/../../secret.webp"), null);
  assert.equal(await lib.availableImage(draft.images[0].src), null);
}
assert.equal(tourPackages.filter(p => p.demo).length, 3);
assert.ok(tourPackages.filter(p => p.demo).every((p) => p.images.length === 3 && !p.price && !p.itinerary && !p.included && !p.excluded));
assert.ok(tourPackages.every(p => p.status === "draft" && !p.price && !p.included && !p.excluded));
console.log("PASS actual server logic: publication, production draft isolation, search, combined filters, image paths (isolated fixtures only)");

const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const dev = process.env.TEST_PREVIEW === "1";
for (const locale of ["id", "en"]) {
  const listing = await fetch(`${base}/${locale}/packages`);
  assert.equal(listing.status, 200); const html = await listing.text();
  assert.ok(!html.includes("Batam City Escape"), "Public listing excludes drafts");
  assert.ok(!html.includes('data-package-photo'), "Public empty state");
  for (const slug of [...tourPackages.map((p) => p.slug), "unknown-package"]) {
    for (const query of ["", "?preview=draft"]) {
      const res = await fetch(`${base}/${locale}/packages/${slug}${query}`);
      assert.equal(res.status, dev && tourPackages.some((p) => p.slug === slug) && query ? 200 : 404);
      if (res.status === 200) {
        const detail = await res.text();
        assert.equal((detail.match(/<div[^>]*data-package-photo/g) ?? []).length, 3);
        assert.ok(detail.includes("DEMO / DRAFT"));
        assert.ok(!detail.includes('/booking?package='), "Draft cannot enter inquiry");
      }
    }
  }
  const preview = await fetch(`${base}/${locale}/packages?preview=draft`); const previewHtml = await preview.text();
  assert.equal(previewHtml.includes("Batam City Escape"), dev);
  if (dev) {
    for (const query of ["q=batam", "category=coast", "q=COASTAL&category=coast"]) {
      const res = await fetch(`${base}/${locale}/packages?preview=draft&${query}`); const result = await res.text();
      assert.equal((result.match(/<article/g) ?? []).length, query === "q=batam" ? 5 : 1, query);
    }
    const empty = await fetch(`${base}/${locale}/packages?preview=draft&q=not-found`);
    assert.ok(!(await empty.text()).includes("<article"));
  }
  const booking = await fetch(`${base}/${locale}/booking?package=${draft.slug}`);
  assert.ok(!(await booking.text()).includes(draft.content[locale].name));
}
for (const path of ["/fr/packages/batam-city-escape?preview=draft", "/id/packages/batam-city-escape/extra?preview=draft", "/en/gallery/batam-city-escape?preview=draft"]) {
  assert.equal((await fetch(`${base}${path}`)).status,404,path);
}
console.log(`PASS HTTP ID/EN: catalogue, detail, invalid/draft access, preview ${dev ? "enabled only on dev" : "blocked in production"}, image slots, inquiry isolation`);
