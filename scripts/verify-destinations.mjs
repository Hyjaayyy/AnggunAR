import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const require = createRequire(import.meta.url);
async function load(file, modules = {}) {
  const code = ts.transpileModule(await readFile(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true}}).outputText;
  const exports = {};
  vm.runInNewContext(code,{exports,process,require:(id)=>id==="server-only"?{}:modules[id]??require(id)});
  return exports;
}
const { destinations } = await load("src/data/destinations.ts");
const data = [...destinations,{...destinations[0],slug:"test-draft",status:"draft"},{...destinations[0],slug:"unverified",sources:[]}];
const lib = await load("src/lib/destinations.ts",{"@/data/destinations":{destinations:data},"@/lib/tour-packages":{getPackages:()=>[{slug:"test-official"},{slug:"unrelated"}]}});
assert.equal(lib.getDestinations().length,3);
assert.equal(lib.getDestination("test-draft"),undefined);assert.equal(lib.getDestination("unverified"),undefined);
assert.equal(lib.getRelatedPackages({...destinations[0],relatedPackageIds:["test-official"]}).length,1);
for(const locale of ["id","en"]) {
  assert.equal(lib.filterDestinations(destinations,{q:"  NONGSA  "},locale).length,1);
  assert.equal(lib.filterDestinations(destinations,{category:"beaches-islands"},locale).length,2);
  assert.equal(lib.filterDestinations(destinations,{q:"barelang",category:"beaches-islands"},locale).length,0);
  for(const category of ["nature","culture-heritage","city-attractions","unknown"]) assert.equal(lib.filterDestinations(destinations,{category},locale).length,0);
}
const imageLib = await load("src/lib/local-photos.ts");
for(const src of [null,"/images/destinations/../secret.webp","https://remote/photo.webp","/images/gallery/missing.webp"]) assert.equal(await imageLib.resolveLocalPhoto(src),null);
const galleryLib = await load("src/lib/gallery.ts",{"@/data/gallery":{galleryPhotos:[
  {id:"draft",status:"draft",permission:"ok",image:{src:"exists"}},
  {id:"unlicensed",status:"published",permission:null,image:{src:"exists"}},
  {id:"missing",status:"published",permission:"ok",image:{src:"missing"}},
  {id:"official",status:"published",permission:"ok",image:{src:"exists"}},
]},"./local-photos":{resolveLocalPhoto:async(src)=>src==="exists"?"/images/gallery/test.webp":null}});
assert.equal((await galleryLib.getGalleryPhotos()).length,1);
assert.equal((await galleryLib.getGalleryPhotos())[0].id,"official");
console.log("PASS destination publication/source gating, search/categories, explicit package relations, local path safety, gallery permission/status/missing filters (isolated fixtures)");

const base=process.env.TEST_BASE_URL??"http://127.0.0.1:3100";
for(const locale of ["id","en"]) {
  for(const suffix of ["destinations","gallery",...destinations.map(d=>`destinations/${d.slug}`)]) {
    const res=await fetch(`${base}/${locale}/${suffix}`);assert.equal(res.status,200,suffix);const html=await res.text();
    assert.ok(html.includes(`lang="${locale}"`));assert.ok(html.includes("Anggun AR Sukses Abadi"));assert.ok(html.includes("<title>"));
    if(suffix.startsWith("destinations/")) {
      assert.equal((html.match(/<div[^>]*data-local-photo/g)??[]).length,3);
      assert.ok(!html.includes("/packages/batam-city-escape"));
    }
  }
  for(const [query,count] of [["q=NONGSA",1],["category=beaches-islands",2],["q=barelang&category=landmarks",1],["category=nature",0],["q=unknown",0]]) {
    const html=await fetch(`${base}/${locale}/destinations?${query}`).then(r=>r.text());assert.equal((html.match(/<article/g)??[]).length,count,query);
  }
  for(const suffix of ["destinations/unknown","destinations/unknown?preview=draft","destinations/barelang-bridge/extra","gallery/unknown"]) assert.equal((await fetch(`${base}/${locale}/${suffix}`)).status,404,suffix);
  const gallery=await fetch(`${base}/${locale}/gallery`).then(r=>r.text());assert.ok(!gallery.includes("data-gallery-open"),"No invented public photography");
}
assert.equal((await fetch(`${base}/fr/destinations/barelang-bridge`)).status,404);
console.log("PASS ID/EN catalogue, 6 destination details, 3 photo slots, filters, invalid routes/locales, related-demo exclusion and honest gallery empty state");
