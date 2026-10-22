# Phase 5.1 — Technical hardening

Audit: 21–22 Oktober 2026, Asia/Jakarta. Anggun AR Sukses Abadi.

## 1. Status

**Blocker HTTP Range 500: selesai pada candidate yang diuji. Seluruh blocker teknis: belum selesai**, karena lima entri High tooling belum memiliki patched release kompatibel yang terverifikasi. Regresi aplikasi production 17/17 PASS; tidak menyatakan READY publik. Blocker bisnis dan signoff perangkat fisik tetap terbuka.

Blocker kontak/domain resmi, konten bisnis, placeholder booking/legal, noindex, dan pengujian perangkat fisik dari Phase 5 tetap berlaku. Fase ini bukan izin deployment dan tidak memberikan status READY untuk publik.

## 2. Akar masalah Range 500

Request MP4 sebelumnya dikecualikan matcher proxy. Range dibaca penyaji file public Next.js, bukan controller cinematic.

Urutan yang dibuktikan melalui source terpasang dan instance tracing localhost:

1. `next/dist/server/serve-static.js` menggunakan bundled send. Offset tidak terpenuhi menghasilkan error **416** dan Content-Range yang benar.
2. `next/dist/server/lib/router-server.js` menangkap 416 dan meneruskannya ke renderer error internal.
3. `next/dist/server/base-server.js`, renderErrorToResponseImpl, mencari komponen Pages `/_error`. Build App Router-only sebelumnya hanya memiliki 404/500 statis tanpa komponen ini.
4. Pencarian gagal; missing-required-error-components masuk fallback yang mengubah status menjadi **500**.

```text
Sebelum:
renderError entry 416 /_error
findPageComponents /_error app false found false
renderError exit 500

Sesudah:
renderError entry 416 /_error
findPageComponents /_error app false found true
renderError exit 416
```

Handler serveStatic Next yang sama saat diuji langsung, tanpa page renderer, menghasilkan **416**, `Content-Range: bytes */10907407`. Wrapper tracing hanya berada di artifacts dan instance localhost sementara; tidak menjadi startup aplikasi. **Tidak ada patch node_modules.**

### Workaround framework

`src/pages/_error.tsx` mengekspor komponen bawaan `next/error`. Turbopack 16.4.2 hanya menerbitkan manifest Pages ketika ada entry page; `_error` saja tidak memenuhi hasPagesEntries pada `next/dist/build/turbopack-build/impl.js`. Fallback 404 standar pada `src/pages/404.tsx` membuat build menerbitkan komponen `_app`, `_document`, `_error` bawaan yang dibutuhkan.

Halaman bisnis tetap App Router. Proxy tetap memvalidasi locale/halaman dan menangani recovery 404 bilingual. URL fallback internal tidak ditambahkan ke navigasi atau allowlist publik. Null guard pada empat pemakai hook diperlukan karena tipe navigasi Next menjadi nullable pada konfigurasi App/Pages; nilai normal App Router tidak berubah.

Ini workaround kompatibilitas memakai API publik. Setelah perbaikan framework tersedia, penghapusannya perlu gate Range/routing yang sama. Tidak mengganti server streaming atau mengubah versi Next.

### Boundary suffix

Bundled parser juga menolak suffix lebih panjang dari file. Ditambahkan normalisasi **GET pada URL H.264 aktif saja**: suffix numerik di atas ukuran file menjadi `bytes=0-`, agar seluruh representasi dapat dikirim.

Ukuran dibaca dari file konfigurasi, bukan path input pengguna; tidak dicache. Streaming, validator, cache dan Range lain tetap Next. Request biasa/open-ended tidak melakukan stat tambahan pada helper. Stat failure/missing file diteruskan ke penanganan Next; sumber HEVC tidak dinormalisasi.

## 3. File yang diubah sesi ini

| File | Perubahan |
| --- | --- |
| `src/pages/_error.tsx`, `src/pages/404.tsx` | Infrastruktur fallback standar untuk mempertahankan status error file statis. |
| `src/app/[locale]/error.tsx` | Guard params nullable, teks dan visual tetap. |
| `src/components/home/cinematic-video-debug.tsx` | Guard search params nullable. |
| `src/components/layout/language-switcher.tsx` | Guard search params/pathname nullable. |
| `src/components/layout/main-navigation.tsx` | Guard pathname nullable. |
| `src/lib/video-range.ts`, `src/proxy.ts` | Normalisasi satu kasus suffix pada media aktif; aturan locale/halaman lain dipertahankan. |
| `scripts/verify-video-range.mjs` | Matriks boundary/conditional HTTP dan verifikasi byte terhadap file asli. |
| `scripts/verify-dependency-exposure.mjs` | Audit versi, merged ESLint config, dan probe terisolasi terbatas waktu/memori. |
| `scripts/run-production-checks.mjs` | Gate Range ditambahkan ke suite existing. |
| `README.md`, laporan Phase 5 dan laporan ini | Perintah, perubahan infrastruktur, bukti dan batas validasi. |

Alias percobaan `_app`/`_document` yang dibuat sesi ini sudah dibersihkan. Package manifest, dependency versions, lockfile, next.config.ts, visual/playback cinematic, Hero, konten bisnis dan media tidak diubah. Perubahan arsitektur fallback didokumentasikan di README/laporan ini; docs/ARCHITECTURE.md lama dipertahankan karena encoding existing bukan UTF-8.

## 4. Hasil HTTP dan regresi

| Pemeriksaan | Hasil | Bukti / batas |
| --- | --- | --- |
| ESLint / typecheck / production build | PASS | Log lint.log, typecheck.log, build.log. Build menghasilkan 23 halaman statis termasuk fallback. |
| Suite production | 17/17 PASS, exit 0 | Seluruh 16 gate sebelumnya dan gate Range baru. suite.json disalin ke artifacts/phase5-1. |
| Range localhost dan LAN | 66 kasus PASS, 0 gagal | Status, Content-Range, panjang, dan byte/SHA-256 dibandingkan file asli. |
| Smoke Chrome localhost / Edge LAN | PASS | Masing-masing 6/6 kombinasi ID/EN × 390/768/1440; homepage, skip keyboard, video, contact/language navigation, detail reload dan XSS query. Console/network/HTTP unexpected error nol. |
| Hero / About / destinations / packages public | PASS | Autoplay/gesture/keyboard/CTA; 6/14/36/12 kombinasi sesuai artefak existing. |
| Cinematic playback / lifecycle / rendering / production debug absent | PASS | Playback, fallback, loop, viewport/tab, reduced-motion; 54 lifecycle checks; 8 kombinasi rendering × 2 timestamp; panel development absen di production. |
| Unit cinematic dan integration routing/paket/destinasi | PASS | Termasuk controller race/cleanup, resolver, bilingual route, 404, draft isolation dan query filter. |
| Gallery fixture / package image / package preview development | PASS | 8 kombinasi lightbox keyboard/focus/scroll; image optimizer/decode; 24 kombinasi filter/detail/bahasa. Fixture dipulihkan. |
| Error UI recovery harness | PASS terisolasi | Komponen aktual, empat kasus ID/EN route/global dengan adapter; bukan live Next/hosting fault injection. |
| Dependency audit | 5 High dev tetap terbuka; runtime 0 advisori | Bukan hasil keamanan bersih. Tidak ada downgrade/major/override/vendor patch. |
| Perangkat fisik / Firefox-WebKit / hosting TLS-CDN / clean CI | NOT TESTED | Tidak diklaim dari automation atau hasil fase sebelumnya. |

Contoh hasil per origin:

| Request | Status | Content-Range / hasil |
| --- | --- | --- |
| normal | 200 | 10907407 byte body |
| first KB | 206 | bytes 0-1023/10907407 |
| suffix | 206 | bytes 10906383-10907406/10907407 |
| suffix larger than file | 206 | bytes 0-10907406/10907407 |
| open ended | 206 | bytes 10906383-10907406/10907407 |
| start at EOF | 416 | bytes */10907407 |
| very large offset | 416 | bytes */10907407 |
| zero suffix | 416 | bytes */10907407 |
| fresh cache precedes invalid range | 304 | 0 byte body |
| If-Range mismatch ignores invalid range | 200 | 10907407 byte body |
| precondition failure | 412 | 2375 byte body |

Direct checks terhadap /404, /416, /_app, /_document, /_error: semuanya 404, dengan proxy publik tetap berlaku. Matriks HTTP mencakup kedua origin. Request HEAD normal juga 200; tidak mengklaim semantik seluruh metode telah diaudit.


Unknown range unit, header tanpa sintaks Range yang dikenali, dan multipart yang tidak dilayani dapat diabaikan menjadi 200 oleh handler Next. Tidak memaksa semua header malformed menjadi 416. Byte range tidak terpenuhi tetap 416 dengan Content-Range `bytes */N`.

Tes cache memakai Cache-Control eksplisit: default Node/Undici pada conditional fetch dapat menambahkan no-cache dan mengubah penilaian freshness. Validator cocok diuji 304, If-Range mismatch 200, If-Range cocok 206/416, precondition failure 412. Suffix terlalu besar juga diuji bersama validator agar normalisasi tidak melewati keputusan cache.

Safari/iOS/Android fisik Phase 5.1: **NOT TESTED**. Automation mobile bukan perangkat fisik. Konfirmasi cinematic pemilik pada fase sebelumnya bersifat historis.

## 5. Audit lima temuan High

Snapshot registry/advisory saat audit:

| Paket | Terpasang | Latest diperiksa | Versi aman untuk rantai ini |
| --- | --- | --- | --- |
| braces | 3.0.3 | 3.0.3 | Belum ada patched release menurut advisory dan registry. |
| micromatch | 4.0.8 | 4.0.8 | Masih memakai braces ^3.0.3. |
| fast-glob | 3.3.1 | 3.3.3 | Latest tetap memakai micromatch/braces; tidak menyelesaikan advisory. Plugin Next mem-pin 3.3.1. |
| @next/eslint-plugin-next | 16.4.2 | 16.4.2 | Rantai fast-glob/braces masih ada. |
| eslint-config-next | 16.4.2 | 16.4.2 | Mewarisi rantai plugin tersebut. |

Satu advisory akar dipropagasikan menjadi lima entri audit, bukan lima exploit runtime independen. CVE-2026-93687 / GHSA-vfj7-8cjw-p6xm mencakup stack-exhaustion dari brace pattern bersarang, affected <=3.0.3; patched version belum tersedia pada saat pemeriksaan.

- `npm audit --json`: **5 High, 0 Critical**, tidak disembunyikan.
- `npm audit --omit=dev --json`: **0 advisori runtime yang dilaporkan**; bukan jaminan ketiadaan semua celah.
- FixAvailable npm mengarah ke eslint-config-next 14.2.35, perubahan mayor/downgrade terhadap stack 16.4.2. Tidak dijalankan.
- Tidak memakai audit fix --force, overrides spekulatif, penghapusan lint rule, atau patch vendor. Upgrade fast-glob saja tidak dipilih karena tidak menyelesaikan akar finding.

### Exploitability proyek

Consumer yang ditemukan berada pada tooling ESLint: getRootDirs plugin Next menerima glob dari settings.next.rootDir, bukan input HTTP website.

Merged ESLint config proyek tidak mengisi rootDir. Audit getRootDirs menghasilkan C:\AnggunAR dengan **0 panggilan globSync**. Tidak ditemukan jalur publik aplikasi yang mengirim query/form ke parser braces tersebut.

Probe compile pola nested dalam child process terpisah, limit memori 128 MB dan timeout 5 detik, **tidak mereproduksi stack overflow pada pola/runtime yang dicoba**. Ini tidak membantah advisory atau membuktikan semua konfigurasi aman. Tidak menjalankan probe dalam server atau proses lint utama.

### Mitigasi/rekomendasi

- Gunakan konfigurasi repository yang ditinjau; jangan memasukkan string HTTP/input eksternal ke glob/rootDir.
- Isolasi job CI kontribusi tidak tepercaya, gunakan timeout/resource limit dan least privilege; jangan berikan credential production pada job tersebut.
- Pertahankan lockfile; gunakan npm ci pada runner bersih sebelum release. Clean install baru tidak dilakukan agar node_modules pengguna tidak dirombak.
- Pantau patched braces dan consumer kompatibel; tinjau pembaruan terpisah dengan audit/lint/typecheck/build/regresi. Latest tidak otomatis aman.

Risiko development **tetap terbuka**. Perlu patch upstream yang aman atau penerimaan risiko eksplisit; exposure yang terbatas pada konfigurasi saat ini tidak otomatis menyelesaikannya.

## 6. Risiko tersisa

- Workaround fallback perlu regresi pada upgrade Next/Turbopack. Metadata/cache/media tetap bergantung framework.
- Normalisasi hanya GET pada H.264 aktif. Tidak mengklaim semua metode, asset, CDN atau hosting telah diuji.
- Lima High tooling belum memiliki remediation kompatibel yang terverifikasi; tidak ada major upgrade yang diotorisasi/dijalankan.
- Kontak/domain/paket resmi/legal/noindex tetap belum siap untuk release publik.
- Perangkat fisik, Firefox/WebKit, TLS/CDN hosting, load/soak dan clean CI baru belum diverifikasi fase ini.

## 7. Bukti dan pengulangan

Artefak lokal terabaikan di artifacts/phase5-1: baseline status/patch, before-trace.txt, direct-send.json, after-trace.log, audit-full.json, audit-runtime.json, dependency-exposure.json, lint/typecheck/build logs, video-range-results.json, ringkasan dan salinan suite final. Wrapper tracing tidak menjadi kode startup website.

```powershell
$env:NEXT_TELEMETRY_DISABLED = '1'
npm run lint
npm run typecheck
npm run build
npm run start -- --port 3100 --hostname 0.0.0.0
# Terminal lain; browser CDP loopback dengan profil uji terpisah:
$env:TEST_BASE_URL = 'http://localhost:3100'
$env:TEST_ORIGINS = 'http://localhost:3100,http://192.168.1.29:3100'
$env:BROWSER_DEBUG_URL = 'http://127.0.0.1:9333'
node scripts/verify-video-range.mjs
npm run test:production
node scripts/verify-dependency-exposure.mjs
```

Sesuaikan IP aktif. Jangan build ketika fixture gallery terpasang. Probe security sintetis tidak dikirim ke monitoring eksternal.

## 8. Git

Tidak melakukan commit, push, reset, deployment atau edit vendor. Baseline dibuat sebelum perubahan. Pekerjaan pengguna yang belum di-commit dipertahankan; file alias percobaan yang dibersihkan dibuat sendiri sesi ini. Tidak ada media atau fitur pengguna yang dihapus.

Snapshot status: 97 entri sebelum sesi, 103 sesudah, 0 entri deleted. Ini jumlah entri Git, bukan jumlah file patch sesi saja. Package manifest, package-lock.json dan next.config.ts byte-identik dengan baseline sesi. Kedua SHA-256 video identik, dan dataset gallery dipulihkan byte-identik. Perubahan sesi dapat ditinjau lewat daftar file di atas serta after-status.txt/after.patch. Tidak ada commit/push/reset/deployment.

## 9. Referensi

- [Next.js — Custom Errors dan komponen next/error](https://nextjs.org/docs/pages/building-your-application/routing/custom-error).
- [RFC 9110 §14 — Range requests](https://www.rfc-editor.org/rfc/rfc9110.html#section-14).
- [Advisory GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
- Versi/constraint berasal dari npm view dan package tree lokal, disandingkan dengan audit JSON; kondisi dapat berubah setelah tanggal audit.
