# Phase 5 — Production readiness, stability & QA

Tindak lanjut: hasil historis Phase 5 di bawah dipertahankan. Perkembangan Range dan dependency tercatat pada [Phase 5.1 technical hardening](PHASE_5_1_TECHNICAL_HARDENING.md); gunakan validasi kandidat terbaru untuk keputusan release.

Tanggal audit: 21 Oktober 2026 (Asia/Jakarta). Proyek: Anggun AR Sukses Abadi, `C:\AnggunAR`.

## 1. Ringkasan kesehatan dan keputusan release

**Status: NOT READY untuk peluncuran profesional ke publik.** Aplikasi dapat dibangun dan sebagian besar perilaku teknis telah lulus pengujian production lokal, tetapi konten/kontak/domain belum siap, advisori tooling High masih terbuka, dan gate HTTP menemukan unsatisfiable range video mengembalikan 500. Status ini bukan klaim aplikasi selalu gagal: request MP4 normal dan playback production berhasil diuji.

Audit ini tidak memberi izin deployment. Tidak melakukan commit, push, reset, deployment, pemasangan dependency, akun monitoring, layanan berbayar, atau pengiriman telemetry baru. Tidak menjanjikan bebas bug.

Baseline Git disimpan di `artifacts/production-readiness/before-status.txt` dan `before.patch`. Working tree sudah memiliki banyak modified/untracked sebelum audit; dipertahankan. Audit mencakup routing, homepage, Hero, cinematic, destinasi, paket, gallery, About, placeholder kontak/booking/legal, navigasi, konfigurasi, media, tests, keamanan, dan rencana operasi. Scan statis mencakup 73 file TypeScript/TSX pada saat scan, dilengkapi inspeksi manual modul interaktif dan server serta pengujian perilaku.

## 2. Temuan berdasarkan severity

Severity menggabungkan dampak teknis dan kesiapan bisnis; temuan bisnis tidak dinyatakan sebagai kerentanan keamanan.

| ID | Severity | Bukti/lokasi | Status dan dampak |
| --- | --- | --- | --- |
| C0 | Critical | Audit source, dependency runtime dan pengujian yang tercatat di bawah | Tidak ditemukan Critical dalam cakupan ini; bukan jaminan tidak ada kerentanan lain. |
| H1 | High — release blocker | `src/lib/business.ts`: email, whatsapp, address, websiteUrl masih null; `src/app/[locale]/[slug]/page.tsx`: contact/booking/privacy/terms masih placeholder | Terbuka. Tidak ada jalur kontak resmi yang dapat dipakai pelanggan; jangan memasarkan sebagai layanan booking aktif. Pemilik perlu memberikan dan menyetujui data/teks resmi. |
| H2 | High — tooling | `package-lock.json`; `artifacts/production-readiness/npm-audit-full.json`: 5 entri High pada braces → micromatch → fast-glob → @next/eslint-plugin-next → eslint-config-next | Terbuka, dependency development. Lima entri berada pada satu rantai, bukan lima kerentanan runtime independen. npm menyarankan perubahan mayor/downgrade eslint-config-next; tidak dijalankan otomatis. Verifikasi patch upstream yang sesuai, lalu uji di perubahan dependency terpisah. |
| H3 | High — release blocker | `src/app/[locale]/layout.tsx`: noindex/nofollow; `src/lib/business.ts`: domain null; `src/data/tour-packages.ts`: semua draft/demo; `src/data/gallery.ts`: kosong | Terbuka. Metadata canonical/hreflang SEO/sitemap/domain, penawaran resmi, konten legal dan aset berizin belum siap. Pertahankan noindex sampai konten/domain disetujui; jangan menerbitkan draft untuk mengejar kesiapan. |
| M1 | Medium | `scripts/verify-production.mjs`: `Range: bytes=999999999-` ke MP4 aktif menghasilkan **500**, `Content-Range: bytes */10907407`; normal 0-1023 dan suffix -1024 menghasilkan 206 | Terbuka, regresi gate FAIL. Dapat direproduksi juga pada bytes=10907407- dan 5-1. Jalur public/static Next.js pada konfigurasi sekarang belum menghasilkan 416 sebagaimana mestinya. Belum dipisahkan sepenuhnya antara perilaku framework dan konfigurasi root layout; bukan bukti proxy memblokir request normal. Perbaikan melalui framework/hosting/media serving memerlukan tinjauan dan persetujuan. |
| M2 | Medium | Sebelum audit tidak ada `src/app/[locale]/error.tsx` atau `src/app/global-error.tsx` | Diperbaiki: fallback umum bilingual, retry dan tautan beranda; tidak menampilkan exception/digest mentah. Uji harness lulus; fault injection pada server Next/hosting langsung belum dilakukan. |
| M3 | Medium | Belum ada monitoring frontend/server, uptime/alert, health check deployment atau prosedur rollback yang dioperasikan | Rencana tersedia di bagian 10–11; belum diaktifkan karena layanan/hosting belum disetujui. Tanpa ini, insiden dapat terlambat diketahui. |
| M4 | Medium | Firefox/WebKit tidak tersedia; Safari/iOS fisik dan fault injection hosting tidak dijalankan | NOT TESTED. Perlu signoff perangkat sebelum release, terutama media autoplay/decoder/dialog. Browser emulation tidak menggantikan Safari fisik. |
| M5 | Medium | `scripts/verify-gallery-browser.mjs`: load promise sebelumnya dapat reject saat Page.navigate masih pending, sebelum cleanup fixture berjalan | Diperbaiki pada harness: handler rejection segera, deadline kompilasi development 60 detik, backup sumber di artifacts. Fixture pertama terinterupsi; sumber asli dipulihkan persis dari sourcesContent build, dan empat file sintetis dibersihkan setelah verifikasi konten/path. Pengulangan akhirnya lulus dan byte dataset asli diverifikasi sama. Jangan menjalankan build ketika fixture terpasang. |
| L1 | Low | Browser meminta `/favicon.ico` yang tidak tersedia | Diperbaiki dengan metadata ikon kosong `data:,`; tidak membuat atau mengubah branding. Ikon resmi masih membutuhkan persetujuan. |
| L2 | Low | `src/app/[locale]/layout.tsx` dan `src/styles/globals.css`: smooth scroll tanpa marker Next | Diperbaiki dengan `data-scroll-behavior="smooth"`; CSS/desain tidak berubah. |
| L3 | Low | `next.config.ts` sebelumnya tidak menambahkan header keamanan dasar | Diperbaiki: nosniff dan strict-origin-when-cross-origin, diuji pada HTML/aset/media. CSP/HSTS/frame policy belum dipaksakan karena membutuhkan threat model, domain HTTPS, dan pengujian embedding. |
| L4 | Low | `next.config.ts`: allowlist IP development historis; `experimental.globalNotFound` | Origin hanya mengatur development; runtime src media relatif dan tidak bergantung IP. Allowlist perlu diperbarui saat LAN berubah; fitur experimental perlu regression gate saat upgrade. Tidak diubah spekulatif. |
| L5 | Low | Hero/about foto null, sembilan slot foto destinasi belum tersedia, poster cinematic tidak ada, gallery kosong | Fallback/empty state memang disengaja dan diuji. Bukan request aset rusak yang disembunyikan. Lengkapi hanya dengan media pemilik/berizin. |
| M6 | Medium — privacy/config | `next telemetry status` menunjukkan telemetry bawaan sebelumnya Enabled | Tidak diaktifkan audit. Ditambahkan opt-out lokal `.env.local`, contoh `.env.example`, dan env runner `NEXT_TELEMETRY_DISABLED=1`. Konfigurasi global tidak diubah. Perintah build awal berjalan sebelum temuan ini; tidak dapat membuktikan apakah terjadi transmisi sebelumnya. Terapkan opt-out pada CI/hosting sebelum menjalankan Next. |

## 3. Perubahan berisiko rendah yang dilakukan

- `next.config.ts`: header `X-Content-Type-Options: nosniff` dan `Referrer-Policy: strict-origin-when-cross-origin`. Tidak menambahkan CSP agresif, HSTS, wildcard origin atau policy autoplay.
- `src/app/[locale]/layout.tsx`: marker smooth scroll dan ikon kosong agar tidak meminta favicon hilang. Noindex tetap dipertahankan.
- `src/i18n/errors.ts`, `src/app/[locale]/error.tsx`, `src/app/global-error.tsx`: fallback error dan pemulihan. Root fallback sengaja memakai anchor untuk reload dokumen saat router gagal; pengecualian ESLint diberi alasan lokal.
- `scripts/lib/browser-session.mjs`, `verify-production.mjs`, `verify-production-browser.mjs`, `verify-recovery-browser.mjs`, `run-production-checks.mjs`: HTTP/asset/header/media gate, perilaku production dan pengukuran lab lokal, harness recovery tanpa mengubah route/data aplikasi.
- `scripts/verify-gallery-browser.mjs`, `verify-packages-image.mjs`: deadline dan penanganan promise fixture. Gallery menunggu unmount aktual sebelum memeriksa scroll, bukan asumsi 600ms.
- `package.json`, `README.md`: perintah test dan dokumentasi; dependency/lockfile tidak diubah.
- `.env.example` dan `.env.local` terabaikan: opt-out telemetry Next.js untuk perintah berikutnya; tidak ada secret. Runner juga memasang opt-out di environment proses anak.

Tidak mengubah video, codec, lifecycle cinematic, overlay, heading, Hero gesture/desain, foto pengguna, data penawaran, maupun alur booking. Tidak menambahkan backend/database/auth/payment.

## 4. Validasi otomatis dan production build

| Pemeriksaan | Hasil final | Bukti / batas |
| --- | --- | --- |
| ESLint / typecheck / production build | PASS | final-lint.log, final-typecheck.log, final-build.log; 22 halaman statis dihasilkan. |
| Gate production 16 skrip | **15 PASS, 1 FAIL**; exit 1 | suite.json. Satu FAIL: verify-production.mjs karena M1. Tidak diganti menjadi PASS. |
| Unit controller / resolver / markup | PASS | verify-home-video.mjs; race cleanup, stale promise/controller, fallback dan reduced-motion. |
| Integrasi routing/paket/destinasi | PASS | verify-routes, verify-packages, verify-destinations; root redirect, ID/EN, query, draft isolation, 404 dan recovery links. |
| HTTP localhost dan LAN | **FAIL gate range**, pemeriksaan lain PASS | Masing-masing 26/26 halaman 200, 26/26 link internal dan 18/18 aset 200, header/MIME/cache benar, full/range normal 200/206. Unsatisfiable range 500 pada keduanya. Tiga source eksternal HEAD 200. |
| Homepage/navigasi/browser production | PASS | Chrome localhost dan Edge LAN: masing-masing 6 kombinasi ID/EN × 390/768/1440, skip keyboard, CTA, query XSS, detail reload dan client navigation; 0 console/runtime/network failure atau unexpected HTTP error. |
| Hero | PASS | 6 kombinasi; autoplay, swipe/drag/wheel, keyboard, CTA, reduced-motion, no overflow. |
| About / destinations-gallery public / packages public | PASS | 14 / 36 / 12 kombinasi pada skrip terkait; public gallery/paket tetap honest empty state. |
| Cinematic production | PASS | 6 kasus playback lengkap localhost; 54 lifecycle checks pada localhost/LAN, 8 kombinasi pixel rendering dengan dua timestamp, serta frame/waktu bergerak pada Edge LAN. |
| Diagnostics production absent | PASS | verify-video-debug-browser: kedua origin, ID/EN, desktop/mobile; query videoDebug=1 tetap tanpa panel/atribut diagnostik. |
| Recovery UI | PASS terisolasi; live Next failure NOT TESTED | 4 kasus route/global × ID/EN memakai komponen aktual dalam React harness, Next hook/Link adapter; keyboard reset pulih dan exception detail tersembunyi. |
| Gallery/lightbox fixture development | PASS setelah perbaikan harness | 8 kombinasi, focus trap/return, keyboard/arrows/Escape, category/reset/language, image decode, scroll cleanup; dataset byte-identik dan media fixture dibersihkan. |
| Paket preview / image fixture development | PASS | 24 kombinasi preview/filter/detail/bahasa/keyboard; image optimizer/decode/focal point lulus. Draft tidak dipublikasikan. |
| Firefox / WebKit / Safari-iOS fisik / Android fisik Phase 5 | **NOT TESTED** | Browser automation yang tersedia adalah Chromium; tidak mengklaim emulasi sebagai perangkat fisik. |
| Clean CI / hosting TLS-CDN / load-soak / live server fault injection | **NOT TESTED** | Lingkungan hosting/domain dan izin pengujian tersebut belum tersedia. |

Artefak gate final: artifacts/production-readiness/suite.json, log per skrip, http-localhost.json, http-192.168.1.29.json, browser-chromium.json, browser-edge-lan.json, dan recovery/results.json. Gate favicon yang gagal pada run awal sudah lulus pada build final; M1 tetap gagal.


Suite menggunakan Node assert/TypeScript/React dan browser CDP yang sudah tersedia. Tidak mengunduh browser atau menambah dependency. Default server uji `next start` port 3100, bind 0.0.0.0, dipisahkan dari development port 3000. Alamat aktif saat audit: 192.168.1.29. Server lokal bukan deployment.

Baseline suite mencatat timeout fixture development dan 404 favicon yang kemudian diperbaiki pada harness/metadata. Hasil pengulangan dibedakan dari hasil pertama. Uji legacy yang memerlukan screenshot baseline historis, codec/decoder negatif tertentu, atau perubahan source sementara tidak dimasukkan sembarang ke gate production. Fixture gallery/gambar/paket preview dijalankan terpisah pada development; konten tersebut tidak menjadi data production.

Untuk mengulang:

```powershell
npm run lint
npm run typecheck
npm run build
npm run start -- --port 3100 --hostname 0.0.0.0
# Terminal lain, browser uji dengan CDP loopback dan profil workspace terpisah:
$env:TEST_BASE_URL = 'http://localhost:3100'
$env:TEST_ORIGINS = 'http://localhost:3100,http://192.168.1.29:3100'
$env:BROWSER_DEBUG_URL = 'http://127.0.0.1:9333'
npm run test:production
```

Sesuaikan IP dengan interface aktual. Gate mengembalikan nonzero selama M1 belum diperbaiki. Jangan menjalankan fixture mutasi data saat build. Test log, screenshot, baseline dan JSON ada di artifacts yang diabaikan Git; bukan artefak publik website.

## 5. Media reliability

`ffprobe` memverifikasi sumber aktif `/videos/home/batam-cinematic-h264.mp4`: H.264/AVC, yuv420p, 1920×1080, 30 fps, 14,266667 detik, satu stream video tanpa audio, 10.907.407 byte. Sumber HEVC asli 18.892.571 byte dipertahankan. Faststart sudah diverifikasi pada audit sebelumnya dan tidak ada perubahan file; kedua path tetap tersedia.

Pengujian memastikan full request 200, valid range 206, video/mp4, dimensi positif, decoded frames dan currentTime meningkat. Perbandingan screenshot dengan frame hasil decode plus overlay dipakai sebagai bukti pixel, bukan sekadar event playing. Lifecycle mencakup viewport/tab pause-resume, loop, reduced-motion, network-failure fallback, autoplay-denied terkontrol, reload, cache on/off, history, client remount dan bahasa.

Panel videoDebug dan atribut diagnostik development tidak muncul pada production walaupun query diberikan. Asset/fallback tidak membuat kontrol booking palsu atau menutupi CTA/navigasi. Tidak menganggap HMR sebagai penyebab bug awal cinematic. Konfirmasi fisik pemilik pada audit sebelumnya (“video sekarang terlihat bergerak”) bersifat historis; pengujian Phase 5 bukan signoff seluruh perangkat fisik.

## 6. Performance dan caching

Sampel final homepage production, cache browser disabled, tanpa throttling: 12 kombinasi dari Chrome localhost dan Edge LAN.

| Ukuran | Hasil lab lokal |
| --- | --- |
| LCP tercatat | 84–256 ms |
| CLS maksimum | 0.000341 |
| JavaScript homepage, resource initiator script | transfer 155155–155155 byte termasuk overhead; decoded body 493315–493315 byte |
| Event duration interaksi yang tersampel | maksimum 40 ms; **bukan INP lapangan** |

Data mentah ada pada browser-chromium.json dan browser-edge-lan.json. Pengukuran ini tidak memberi skor Lighthouse, p75 lapangan, atau jaminan performa di jaringan/CPU perangkat lain.


- Lighthouse: **NOT TESTED**, CLI/package tidak tersedia; tidak dipasang tanpa kebutuhan yang disepakati.
- INP lapangan, CrUX dan RUM: **NOT TESTED**. Sampel event duration pada harness bukan INP pengguna nyata.
- Semua pengukuran browser adalah lab lokal tanpa CPU/network throttling. Cache browser dinonaktifkan untuk sampel homepage; OS/server tetap dapat hangat. Tidak menyebutnya skor Lighthouse atau prediksi koneksi seluler.
- Dua font next/font disajikan lokal; sampel file 48.432 dan 27.272 byte. CSS/JS/font fingerprint memakai public max-age=31536000 immutable. Font dibutuhkan dari Google saat build pertama; siapkan jalur CI yang dapat mengunduh atau cache build yang sah.
- Video aktif sekitar 10,4 MiB. Source diikat ketika viewport memperbolehkan; reduced-motion mencegah pemuatan awal. Jangan mengganti resolusi/codec/kualitas tanpa ukuran dampak dan persetujuan. Public video memakai revalidasi, bukan immutable path versioned.
- Optimasi terukur kecil: menghapus request favicon 404 tanpa mengganti visual. Tidak ada alasan terukur untuk refactor besar, mengganti desain, atau menambah dependency optimasi pada audit ini.
- Listener/timer Hero, cinematic dan dialog diinspeksi; cleanup tersedia. Unit cinematic menguji race promise/cleanup dan controller lama. Tidak dilakukan heap soak jangka panjang, sehingga klaim bebas memory leak tidak dibuat.

## 7. Security audit

- `npm audit --json`: 5 High (tooling development) pada rantai H2; 0 Critical. Advisory utama yang dilaporkan npm: [GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm).
- `npm audit --omit=dev --json`: 0 kerentanan yang dilaporkan pada dependency runtime saat scan. Ini cakupan database advisori, bukan bukti ketiadaan semua celah.
- `npm ls --depth=0`: versi langsung sesuai package.json; terdapat enam modul opsional/WASM berstatus extraneous di node_modules lokal. Tidak dihapus. Reproduksibilitas clean CI `npm ci` pada runner baru: **NOT TESTED**, rekomendasi sebelum release.
- Pada scan awal tidak ada `.env*`; audit kemudian menambahkan `.env.example` dan `.env.local` berisi opt-out telemetry tanpa secret. Public source map `.next/static` berjumlah 0; tidak ditemukan NEXT_PUBLIC secret dalam source. `.gitignore` mengabaikan env lokal dan tetap memperbolehkan .env.example. Tidak mencetak isi credential/private environment.
- Tidak ditemukan dangerouslySetInnerHTML/eval/new Function pada source aplikasi. Query filter diuji dengan payload markup dan tetap teks; tidak muncul elemen/event handler injeksi.
- Locale, slug publik, draft preview, allowlist file lokal dan path traversal diuji. Draft development tidak dapat diakses dengan preview query pada production. Tidak ada route handler/backend autentikasi/upload/payment yang perlu diasumsikan aman.
- Header baru diuji; tidak memasang CSP ketat yang dapat memblokir inline bootstrap Next, image optimizer, media atau embedding IDE. Rekomendasi CSP dimulai dari inventaris sumber dan staging/report-only yang pengumpulan laporannya disetujui. HSTS hanya setelah domain HTTPS/rollback domain siap; jangan preload secara otomatis.
- Tautan eksternal yang ada adalah sumber resmi destinasi, tidak membuka target blank tanpa proteksi. Tiga source URL diuji HEAD dan merespons 200; kebenaran seluruh konten eksternal tidak diaudit ulang di sini.
- Tidak mengaktifkan monitoring/analytics baru atau pengiriman diagnostik aplikasi ke vendor. Telemetry bawaan Next.js yang sebelumnya Enabled ditemukan dan di-opt-out pada scope lokal/perintah berikutnya; status pengiriman sebelum opt-out tidak diverifikasi. Profil browser/CDP lokal bukan layanan production; jangan mengekspos port debugging ke LAN/internet.

## 8. Browser compatibility dan aksesibilitas

Chromium production diuji pada Chrome 155.0.8059.85 dan Edge 155.0.4283.62, desktop/tablet/mobile emulation; hasil Edge dicatat terpisah dalam tabel validasi. Runtime lokal: Node 24.14.1, npm 11.11.0, Next.js 16.4.2 dan React 19.3.1. Focus indicator, skip link keyboard, menu Enter/Escape/focus return, Hero keyboard/swipe/drag/wheel, language/query preservation, empty state, detail reload dan lightbox keyboard diuji. Dialog memakai API native showModal yang sesuai browser modern; browser lama dan Safari fisik tetap membutuhkan pemeriksaan.

Firefox, WebKit automation, Safari/iOS fisik, pembaca layar nyata dan audit WCAG formal: **NOT TESTED**. Tidak mengklaim cakupan tersebut dari Chrome emulation. Uji error UI memakai komponen aktual dengan adapter Next hook/Link dalam harness React; bukan verifikasi layout failure/digest/streaming error pada server Next langsung. Perlu staging fault-injection terkontrol setelah ada lingkungan yang disepakati.

## 9. Prioritas tindak lanjut yang memerlukan persetujuan

1. Pemilik menyetujui kontak, domain, teks legal, paket resmi dan hak media; tentukan apakah release hanya profil perusahaan atau juga inquiry. Jangan menerima data pribadi sebelum storage/security/privacy disepakati.
2. Tinjau upgrade dependency tooling H2 berdasarkan advisori/upstream terverifikasi. Jangan menjalankan npm audit fix --force/downgrade Next secara otomatis.
3. Reproduksi M1 dalam proyek minimal/versi framework yang ditinjau, lalu pilih patch framework atau aturan media serving di hosting. Jalankan gate range 200/206/416 serta playback kembali sebelum menyetujui perubahan.
4. Selesaikan pemeriksaan Safari/iOS/Android fisik dan error-recovery server di staging; tetapkan browser support matrix.
5. Setelah domain/content siap, usulkan canonical, alternate language metadata, sitemap/robots dan penghapusan noindex hanya pada halaman publik yang disetujui. Perubahan ini berdampak pada publikasi/search exposure.
6. Pilih hosting/monitoring/CSP sesuai anggaran dan privasi. Dokumentasi di bawah merupakan rekomendasi, bukan layanan yang diaktifkan.

## 10. Monitoring, health checks dan recovery plan

### Deteksi tanpa mengaktifkan pihak ketiga sekarang

- **Frontend/server errors:** mulai dengan log server hosting yang sudah disetujui dan mekanisme error boundary. Jika memilih vendor monitoring, sepakati data, lokasi, retensi, biaya, akses, redaksi URL/query/PII dan sampling. Jangan kirim form/contact data, cookie, token, IP pelanggan atau isi DOM secara default. Tentukan pemilik triage dan daftar error release yang harus diinvestigasi.
- **Uptime/alert:** setelah domain tersedia, monitor GET /id dan /en serta MP4 range pendek dari jaringan eksternal yang disetujui. Gunakan beberapa kegagalan berurutan dan pemeriksaan kedua agar satu timeout tidak memicu alarm palsu. Sepakati notifikasi/on-call; tidak membuat akun, job atau mengirim pesan sekarang.
- **Broken links/assets:** jalankan verify-production secara berkala di lingkungan yang disepakati; pisahkan 4xx/5xx internal dari eksternal yang bisa menolak HEAD. Inventaris aset fallback yang disengaja agar tidak dianggap semua gambar tersedia. Jalankan ulang setelah setiap perubahan konten.
- **Media failures:** scripted canary harus menguji dimensi, waktu/frame meningkat dan screenshot, bukan hanya HTTP 200. Reduced-motion dan autoplay rejection adalah kondisi yang perlu dibedakan dari error transport/decode. Production debug panel tetap dilarang; instrumentasi failure tersampling memerlukan persetujuan data/layanan terpisah.
- **Core Web Vitals:** gunakan audit lab release yang dapat diulang; RUM hanya setelah persetujuan privasi. Pantau p75 LCP/CLS/INP menurut device/route dan tren antar-release ketika data cukup, bukan enam sampel lokal.

### Deployment health checks yang direkomendasikan

Sesudah candidate build di staging, periksa readiness proses, /id dan /en (200, lang/title), root redirect, unknown path 404, static JS/CSS/font 200 dan MIME, MP4 full/range, draft isolation, diagnostics absent, CTA/contact nyata yang telah disetujui, serta console/hydration. Video harus benar-benar bergerak pada minimal satu perangkat fisik target. Jangan menganggap Next start ready berarti aplikasi/layanan bisnis siap.

### Rollback dan backup

- Simpan artefak build release yang sudah tervalidasi, versi Node/npm, lockfile, konfigurasi hosting dan daftar aset yang cocok. Jangan menimpa aset bersama yang dibutuhkan release stabil.
- Backup env/config sensitif secara terenkripsi di penyimpanan yang disetujui, akses terbatas dan pemulihan diuji. Saat ini tidak ada database atau data booking; jangan mengarang backup database. Jika backend ditambahkan, backup/restore dan migrasi menjadi gate baru.
- Sepakati trigger rollback: halaman utama 5xx, navigasi/CTA utama rusak, media/fallback mengganggu pengalaman, atau pelanggaran data. Bedakan kegagalan fitur opsional dari outage menyeluruh.
- Operator yang diberi kewenangan mengalihkan traffic ke artefak stabil sebelumnya melalui mekanisme hosting; **jangan git reset working tree atau menghapus perubahan lokal**. Jangan membangun ulang versi lama dari source/config yang sudah berubah tanpa memastikan kecocokan aset/env.
- Setelah rollback, ulangi health checks, cek cache/CDN sesuai hosting dan simpan bukti waktu/error/release. Tidak melakukan rollback/deployment pada audit ini.

### Penanganan insiden

Catat waktu WIB, scope pengguna/origin/browser, release aktif, request status dan error/digest yang sudah disanitasi. Triage: jaringan/TLS → proses/server → route/asset → decode/autoplay/viewport → rendering. Jangan mengubah banyak variabel sekaligus atau menganggap event playing membuktikan pixel terlihat. Gunakan fallback, kurangi dampak lewat rollback yang disetujui, lalu lakukan postmortem dan tambahkan regresi untuk penyebab yang terbukti. Akar masalah cinematic historis belum terbukti; simpan kondisi nyata jika berulang.

## 11. Release checklist

### Sebelum deployment (memerlukan izin deployment tersendiri)

- [ ] Kontak/domain/konten resmi, hak media, privacy/terms dan tujuan bisnis release disetujui.
- [ ] H2 ditangani atau ada penerimaan risiko tooling secara eksplisit; clean CI npm ci dan lockfile tervalidasi.
- [ ] Gate range M1 diperbaiki; lint/typecheck/build/unit/integration/browser production lulus pada candidate final.
- [ ] Browser/perangkat fisik target, khususnya Safari/iOS dan Android, ditandatangani; batas dukungan jelas.
- [ ] Domain HTTPS, environment (termasuk NEXT_TELEMETRY_DISABLED=1), akses operator, proses start, public/.next/static, cache dan asset versioning diverifikasi pada hosting yang dipilih.
- [ ] Indexing/canonical/sitemap diatur sesuai konten yang disetujui; jangan menghapus noindex dari placeholder.
- [ ] Monitoring/alert, sanitasi log, backup/restore, artefak stabil dan langkah rollback disetujui serta diuji.
- [ ] Tidak ada test fixture/debug panel/source map publik/secret; review diff dan seluruh pekerjaan pengguna tetap dipertahankan.

### Setelah deployment oleh operator yang diberi izin

- [ ] Ulangi health/smoke dari jaringan eksternal, cek TLS dan URL canonical publik.
- [ ] Uji CTA/contact, language switch, detail refresh, media range/frame/fallback pada browser nyata.
- [ ] Pantau 4xx/5xx, console/asset failures dan performa selama periode observasi yang disepakati.
- [ ] Catat release/build/config dan bukti signoff; bila gate gagal, operator mengikuti rollback plan dan menyimpan bukti insiden.

## 12. Git dan batas verifikasi

Tidak ada commit/push/reset/deployment. Sebelum audit sudah ada modified/untracked dari pekerjaan sebelumnya. File fixture gallery dipulihkan byte-identik dari sumber original build; aset milik pengguna tidak dihapus. File test sintetis yang dibuat audit dibersihkan. `.gitignore` tetap mengabaikan artifacts, profil browser dan build. Daftar perubahan audit terdapat di bagian 3; patch/status akhir disimpan sebagai artefak lokal.

Snapshot Git: 84 entri modified/untracked sebelum audit, 97 sesudah audit, 0 entri deleted; package-lock.json tidak berubah. Ini hitungan entri status, bukan jumlah baris perubahan audit saja. Server production uji port 3100 dihentikan setelah validasi; development port 3000 tetap dipertahankan.

Production server dan browser automation lokal bukan hosting production sesungguhnya. Tidak ada pengujian sertifikat/TLS/CDN, outage hosting, traffic/soak/load, clean CI, atau pemulihan database. Seluruh batas ini tetap NOT TESTED sampai benar-benar dijalankan. Status NOT READY perlu dievaluasi ulang setelah blocker diselesaikan dengan bukti, bukan diubah hanya karena build hijau.
