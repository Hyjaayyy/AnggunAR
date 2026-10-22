import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
const cache = new Map();
function load(file) {
  const absolute = path.resolve(file);
  if (cache.has(absolute)) return cache.get(absolute);
  const exports = {}; cache.set(absolute, exports);
  const source = ts.transpileModule(readFileSync(absolute, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  vm.runInNewContext(source, { exports, URLSearchParams, process: { env: { NODE_ENV: "production" }, cwd: () => process.cwd() }, require: (name) => {
    if (name === "server-only") return {};
    if (name.startsWith("@/") || name.startsWith(".")) {
      const base = name.startsWith("@/") ? path.resolve("src", name.slice(2)) : path.resolve(path.dirname(absolute), name);
      const resolved = [base, `${base}.ts`, `${base}.tsx`].find(candidate => existsSync(candidate));
      if (resolved) return load(resolved);
    }
    return require(name);
  } }, { filename: absolute });
  return exports;
}
const { business } = load("src/lib/business.ts");
const { whatsappHref, emailHref, telephoneHref, phoneDisplay } = load("src/lib/contact.ts");
assert.equal(business.name, "CV Anggun AR Sukses Abadi");
assert.equal(business.address, "Perum Royal Grande Tahap 3, Blok A No. 17");
for (const key of ["addressCity", "addressProvince", "addressPostalCode", "addressCoordinates", "websiteUrl"]) assert.equal(business[key], null);
for (const locale of ["id", "en"]) {
  const main = new URL(whatsappHref(locale));
  assert.equal(main.origin, "https://wa.me"); assert.equal(main.pathname, "/6282379595106");
  assert.ok(main.searchParams.get("text").startsWith(locale === "id" ? "Halo," : "Hello,"));
  assert.equal(new URL(whatsappHref(locale, { alternative: true })).pathname, "/6282114483976");
  const packageName = 'Trip & Islands? #1 + "海" / Batam';
  const message = new URL(whatsappHref(locale, { packageName }));
  assert.equal([...message.searchParams.keys()].join(), "text");
  assert.ok(message.searchParams.get("text").includes(packageName), "Package names survive URL encoding without query injection");
  assert.ok(new URL(whatsappHref(locale, { booking: true })).searchParams.get("text").includes(locale === "id" ? "proses pemesanan" : "booking process"));
  const email = new URL(emailHref(locale));
  assert.equal(email.protocol, "mailto:"); assert.equal(email.pathname, "ARtravel655@gmail.com");
  assert.ok(email.searchParams.get("subject").startsWith(locale === "id" ? "Pertanyaan perjalanan" : "Travel inquiry"));
}
assert.equal(telephoneHref(business.whatsapp), "tel:+6282379595106");
assert.equal(telephoneHref(business.whatsappAlternative), "tel:+6282114483976");
assert.equal(phoneDisplay(business.whatsapp), "+62 823-7959-5106");
assert.equal(phoneDisplay(business.whatsappAlternative), "+62 821-1448-3976");

// Isolated fixture: exercise the actual package detail CTA without publishing data.
const data = load("src/data/tour-packages.ts");
const draft = data.tourPackages[0];
const official = { ...draft, slug: "qa-only-published", status: "published", demo: false, content: { id: { name: "Uji & Pulau", description: "QA only" }, en: { name: "Test & Islands", description: "QA only" } } };
data.tourPackages.push(official);
const page = load("src/app/[locale]/packages/[slug]/page.tsx").default;
function links(node) {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap(links);
  return [...(typeof node.props?.href === "string" ? [node.props.href] : []), ...links(node.props?.children)];
}
try {
  for (const locale of ["id", "en"]) {
    const tree = await page({ params: Promise.resolve({ locale, slug: official.slug }), searchParams: Promise.resolve({}) });
    const inquiry = links(tree).filter(href => href.startsWith("https://wa.me/"));
    assert.equal(inquiry.length, 1);
    assert.ok(new URL(inquiry[0]).searchParams.get("text").includes(official.content[locale].name));
    await assert.rejects(() => page({ params: Promise.resolve({ locale, slug: draft.slug }), searchParams: Promise.resolve({ preview: "draft" }) }), /NEXT_HTTP_ERROR_FALLBACK;404/);
  }
} finally { data.tourPackages.pop(); }
console.log("PASS contact configuration, ID/EN WhatsApp/email/tel, encoding, real package CTA with isolated published fixture, production draft rejection; no messages sent");

if (process.env.TEST_BASE_URL) {
  for (const locale of ["id", "en"]) {
    const response = await fetch(`${process.env.TEST_BASE_URL}/${locale}/contact`);
    assert.equal(response.status, 200); const html = await response.text();
    for (const number of [business.whatsapp, business.whatsappAlternative]) {
      assert.ok(html.includes(`https://wa.me/${number}?text=`)); assert.ok(html.includes(telephoneHref(number)));
    }
    assert.ok(html.includes(business.email)); assert.ok(html.includes(business.address)); assert.ok(html.includes(business.name));
    assert.ok(!html.includes("<iframe")); assert.ok(!html.includes("<form"));
    assert.ok(html.includes('content="noindex, nofollow"'));
    const generalBooking = await fetch(`${process.env.TEST_BASE_URL}/${locale}/booking`).then(r => r.text());
    assert.ok(generalBooking.includes(whatsappHref(locale, { booking: true }).replaceAll("&", "&amp;")), "General booking consults through official WhatsApp");
    for (const value of [draft.slug, "unknown", "bad%26text%3Dinject"]) {
      const booking = await fetch(`${process.env.TEST_BASE_URL}/${locale}/booking?package=${value}`).then(r => r.text());
      assert.ok(!/<main[\s\S]*?href="https:\/\/wa\.me\/[^"]*"[\s\S]*?<\/main>/.test(booking), "Unavailable package has no main inquiry CTA");
    }
  }
  console.log("PASS production Contact ID/EN HTTP, official links, no map/form, noindex and unavailable package inquiry guard");
} else console.log("NOT TESTED HTTP contact links (set TEST_BASE_URL to production-like origin)");
