import assert from "node:assert/strict";

// Jalankan setelah `npm run build` dan `npm run start` di terminal terpisah.
const base = process.env.TEST_BASE_URL ?? "http://127.0.0.1:3000";
const slugs = ["", "destinations", "packages", "gallery", "booking", "about", "contact", "faq", "privacy", "terms"];
let checks = 0;

for (const locale of ["id", "en"]) {
  const other = locale === "id" ? "en" : "id";
  for (const slug of slugs) {
    const path = `/${locale}${slug ? `/${slug}` : ""}`;
    const response = await fetch(new URL(path, base), { redirect: "manual" });
    assert.equal(response.status, 200, path);
    const html = await response.text();
    assert.ok(new RegExp(`<html[^>]*lang="${locale}"`).test(html), `${path}: HTML language`);
    assert.ok(html.includes("Anggun AR Sukses Abadi"), `${path}: company name`);
    assert.ok(html.includes(`href="/${other}${slug ? `/${slug}` : ""}"`), `${path}: language switch destination`);
    assert.ok(/<h1[ >]/.test(html), `${path}: main heading`);
    assert.ok(/name="robots" content="noindex, nofollow"/.test(html), `${path}: placeholder robots`);
    assert.ok(/<title>[^<]+Anggun AR Sukses Abadi<\/title>/.test(html), `${path}: metadata title`);
    if (slug !== "packages") assert.ok(!html.includes("<form"), `${path}: no inactive booking form`);
    checks++;
    console.log(`PASS ${path}: 200, lang, metadata, heading, language link`);
  }
}

for (const path of ["/", "/?source=local-test"]) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 307, path);
  const target = new URL(response.headers.get("location"), base);
  assert.equal(target.pathname, "/id");
  assert.equal(target.search, new URL(path, base).search);
  checks++;
  console.log(`PASS ${path}: 307 → ${target.pathname}${target.search}`);
}

for (const path of ["/fr", "/fr/packages", "/ID", "/destinations", "/id/missing", "/en/missing", "/id/packages/not-yet-available", "/en/gallery/missing"]) {
  const response = await fetch(new URL(path, base), { redirect: "manual" });
  assert.equal(response.status, 404, path);
  const html = await response.text();
  if (!html.includes('href="/id"') || !html.includes('href="/en"')) {
    console.log(`404 diagnostics ${path}: ${html.match(/<h1[^>]*>.*?<\/h1>|href="[^"]*"/g)?.join(" ")}`);
  }
  assert.ok(html.includes('href="/id"') && html.includes('href="/en"'), `${path}: recovery links`);
  checks++;
  console.log(`PASS ${path}: 404 and recovery links`);
}

console.log(`PASS ${checks} HTTP routing checks. Browser interaction/visual checks are separate.`);
