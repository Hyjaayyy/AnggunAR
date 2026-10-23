import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { tsModuleLoader } from "./lib/ts-module.mjs";
function loader(env) {
  const password = randomBytes(36).toString("base64url");
  return tsModuleLoader({ env: { NODE_ENV: env, OWNER_REVIEW_ENABLED: "true", OWNER_REVIEW_USERNAME: "qa-reviewer", OWNER_REVIEW_PASSWORD: password }, requestHeaders: new Headers({ authorization: `Basic ${Buffer.from(`qa-reviewer:${password}`).toString("base64")}` }) });
}
function nodes(tree) { return !tree || typeof tree !== "object" ? [] : Array.isArray(tree) ? tree.flatMap(nodes) : [tree, ...nodes(tree.props?.children)]; }
function text(tree) { return typeof tree === "string" || typeof tree === "number" ? String(tree) : Array.isArray(tree) ? tree.map(text).join(" ") : tree && typeof tree === "object" ? text(tree.props?.children) : ""; }
const expected = [
  ["batam-city-highlights", 450000, 1, 0], ["barelang-culinary-experience", 725000, 1, 0],
  ["batam-weekend-escape", 950000, 2, 1], ["batam-complete-discovery", 1500000, 3, 2],
  ["bintan-island-escape", 850000, 1, 0], ["batam-bintan-discovery", 2500000, 3, 2],
];
const prod = loader("production"), dev = loader("development");
const { tourPackages } = prod("src/data/tour-packages.ts");
assert.equal(tourPackages.length, 9); assert.equal(new Set(tourPackages.map(p => p.slug)).size, 9);
assert.equal(tourPackages.filter(p => p.demo).length, 3);
const prodLib = prod("src/lib/tour-packages.ts"), devLib = dev("src/lib/tour-packages.ts");
const devAccess = await dev("src/lib/owner-review.ts").packageReviewAccess({ preview: "draft" });
assert.equal(prodLib.getPackages(true).length, 6); assert.equal(devLib.getPackages().length, 6); assert.equal(devLib.getPackages(true).length, 6); assert.equal(devLib.getPackages(devAccess).length, 9);
const detail = dev("src/app/[locale]/packages/[slug]/page.tsx").default;
const card = dev("src/components/packages/tour-package-card.tsx").TourPackageCard;
for (const [slug, amount, days, nights] of expected) {
  const item = tourPackages.find(p => p.slug === slug);
  assert.ok(item); assert.equal(item.status, "offered"); assert.equal(item.demo, false);
  assert.equal(item.price, null); assert.equal(item.included, null); assert.equal(item.excluded, null);
  assert.equal(item.planning.verification, "unverified"); assert.equal(item.planning.indicativePricePerPerson, amount);
  assert.equal(item.planning.participantBasis, null); assert.equal(item.durationDays, days); assert.equal(item.planning.durationNights, nights);
  assert.equal(item.itinerary.length, days); assert.ok(item.images.every(image => image.src === null));
  assert.ok(item.planning.sourceUrls.length >= 2 && item.planning.sourceUrls.every(url => url.startsWith("https://")));
  assert.equal(prodLib.getPackage(slug, true)?.slug, slug); assert.equal(devLib.getPackage(slug)?.slug, slug);
  assert.equal(prodLib.getBookingPackage(slug), undefined);
  for (const locale of ["id", "en"]) {
    assert.ok(item.content[locale].description.length > 70);
    assert.ok(item.itinerary.every(day => day.title[locale] && day.activities[locale].length));
    const tree = await detail({ params: Promise.resolve({ locale, slug }), searchParams: Promise.resolve({ preview: "draft" }) });
    const all = nodes(tree); const urls = all.map(node => node.props?.href).filter(Boolean);
    assert.ok(!urls.some(url => url.includes("/booking")), "Draft quote never enters booking");
    const quote = urls.filter(url => url.startsWith("https://wa.me/")); assert.equal(quote.length, 1);
    const url = new URL(quote[0]); assert.equal(url.pathname, "/6282379595106");
    const message = url.searchParams.get("text"); assert.ok(message.includes(item.content[locale].name));
    for (const word of locale === "id" ? ["tanggal", "jumlah peserta", "penawaran aktual"] : ["dates", "participant", "quotation"]) assert.ok(message.includes(word));
    const renderedCard = card({ item, locale, preview: true });
    const priceText = text(renderedCard);
    assert.ok(priceText.includes(locale === "id" ? "Estimasi mulai dari" : "Estimated from"));
    assert.ok(await detail({ params: Promise.resolve({ locale, slug }), searchParams: Promise.resolve({}) }));
  }
}
console.log("PASS 6 unverified market concepts, 3 preserved demos, ID/EN itinerary/estimate labels, 12 actual detail quote CTAs, no official price/inclusions, production/draft booking isolation");
if (process.env.TEST_BASE_URL) {
  const preview = process.env.TEST_PREVIEW === "1";
  for (const locale of ["id", "en"]) for (const [slug] of expected) {
    for (const query of ["", "?preview=draft"]) {
      const response = await fetch(`${process.env.TEST_BASE_URL}/${locale}/packages/${slug}${query}`);
      assert.equal(response.status, 200);
      if (response.status === 200) {
        const html = await response.text();
        assert.ok(html.includes(locale === "id" ? "Estimasi mulai dari - belum final" : "Estimated from - not final"));
        assert.ok(html.includes(locale === "id" ? "Minta Penawaran" : "Request a Quote"));
        assert.ok(!html.includes('application/ld+json')); assert.ok(!html.includes('/booking?package='));
        if (preview && query) assert.ok(html.includes('content="noindex, nofollow"'));
      }
    }
    const booking = await fetch(`${process.env.TEST_BASE_URL}/${locale}/booking?package=${slug}`).then(r => r.text());
    assert.ok(!/<main[\s\S]*?href="https:\/\/wa\.me\/[^"]*"[\s\S]*?<\/main>/.test(booking));
  }
  console.log(`PASS ID/EN market draft HTTP, booking guard and ${preview ? "development preview estimates/quote/no Offer" : "production isolation including preview query"}`);
} else console.log("NOT TESTED HTTP market catalogue (set TEST_BASE_URL and TEST_PREVIEW)");
