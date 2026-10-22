import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import { browserSession } from "./lib/browser-session.mjs";

const base = process.env.TEST_BASE_URL ?? "http://localhost:3100";
const browser = await browserSession();
const results = [];
try {
  for (const width of [320, 390, 768, 1440]) for (const locale of ["id", "en"]) {
    await browser.send("Emulation.setDeviceMetricsOverride", { width, height: 900, deviceScaleFactor: 1, mobile: false });
    await browser.navigate(`${base}/${locale}/contact`);
    const snapshot = await browser.evaluate(`({lang:document.documentElement.lang,heading:document.querySelector('main h1').innerText,overflow:document.documentElement.scrollWidth>document.documentElement.clientWidth+1,forms:document.querySelectorAll('main form,main iframe').length,links:[...document.querySelectorAll('main a')].map(a=>({href:a.href,name:a.getAttribute('aria-label')||a.innerText,height:a.getBoundingClientRect().height})),footer:[...document.querySelectorAll('footer a')].map(a=>a.href)})`);
    assert.equal(snapshot.lang, locale); assert.equal(snapshot.overflow, false); assert.equal(snapshot.forms, 0);
    for (const number of ["6282379595106", "6282114483976"]) {
      assert.ok(snapshot.links.some(a => a.href.startsWith(`https://wa.me/${number}?text=`)));
      assert.ok(snapshot.links.some(a => a.href === `tel:+${number}`));
    }
    assert.ok(snapshot.footer.some(href => href.startsWith("https://wa.me/6282379595106?text=")));
    assert.ok(snapshot.footer.some(href => href.startsWith("mailto:ARtravel655@gmail.com?subject=")));
    for (const link of snapshot.links) { assert.ok(link.name.trim()); assert.ok(link.height >= 44, "Contact target minimum 44px"); }
    // Observe browser click intent without launching third-party apps or sending messages.
    await browser.evaluate(`document.addEventListener('click',event=>{const a=event.target.closest('a');if(a&&(/^(mailto:|tel:)/.test(a.href)||a.hostname==='wa.me')){event.preventDefault();window.__contactIntent=a.href}},true)`);
    for (const selector of ['main a[href^="https://wa.me/6282379595106"]', 'main a[href^="https://wa.me/6282114483976"]', 'main a[href^="mailto:"]', 'main a[href="tel:+6282379595106"]', 'main a[href="tel:+6282114483976"]']) {
      await browser.evaluate(`(()=>{const a=document.querySelector(${JSON.stringify(selector)});a.scrollIntoView({block:'center',behavior:'instant'});a.focus();window.__contactIntent=null})()`);
      const target = await browser.evaluate(`(()=>{const a=document.querySelector(${JSON.stringify(selector)}),r=a.getBoundingClientRect();return {href:a.href,focused:document.activeElement===a,x:r.left+r.width/2,y:r.top+r.height/2}})()`);
      assert.equal(target.focused, true);
      await browser.send("Input.dispatchMouseEvent", { type: "mousePressed", x: target.x, y: target.y, button: "left", clickCount: 1 });
      await browser.send("Input.dispatchMouseEvent", { type: "mouseReleased", x: target.x, y: target.y, button: "left", clickCount: 1 });
      assert.equal(await browser.evaluate("window.__contactIntent"), target.href);
    }
    await browser.send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    await browser.send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 });
    assert.equal(await browser.evaluate("window.__contactIntent"), "tel:+6282114483976");
    const other = locale === "id" ? "en" : "id";
    await browser.evaluate(`document.querySelector('header a[hreflang="${other}"]').click()`);
    await browser.until(`location.pathname==='/${other}/contact' && document.documentElement.lang==='${other}'`, "Contact language switch");
    results.push({ locale, width, ...snapshot, clickIntents: 5, keyboard: true, languageSwitch: true });
  }
  assert.deepEqual(browser.errors, []); assert.deepEqual(browser.networkFailures, []);
  await mkdir("artifacts/contact", { recursive: true });
  await writeFile("artifacts/contact/browser.json", JSON.stringify({ base, results, errors: browser.errors, networkFailures: browser.networkFailures }, null, 2));
  console.log(`PASS ${results.length} Contact ID/EN viewport cases: official hrefs, footer, 40 click intents, keyboard/language, no forms/maps/overflow; external apps NOT TESTED`);
} finally { await browser.close(); }
