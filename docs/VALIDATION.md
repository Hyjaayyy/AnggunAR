# Validasi proyek

## Phase 3 — Tour Packages & Itinerary Development

Tanggal: 20 Oktober 2026 (Asia/Jakarta). Implementasi disetujui pemilik setelah audit. Tidak ada commit, push, instalasi dependency, operasi Git destruktif, database, dashboard, backend booking atau deployment.

### Implementasi dan perlindungan

Katalog dan detail ID/EN memakai data lokal bertipe dan sumber tunggal, filter GET, tuple tiga gambar, fallback tanpa broken image, itinerary berdasarkan hari, status fasilitas belum dikonfirmasi, informasi penting hanya jika terisi, serta inquiry berkonteks paket published tanpa pengiriman data. Ketiga konsep tetap draft/demo; tidak ada penawaran resmi published. Homepage menggunakan sumber/kartu sama dengan empty state profesional.

Snapshot diff awal: `artifacts/phase3/before.patch`; hash 24 file sumber yang dilindungi sebelum perubahan: `protected-before.json`. Perbandingan akhir menghasilkan **24 identik, 0 berubah**, dicatat pada `protection-result.json`. File hero/carousel, About, header/footer, navigasi utama, konfigurasi dan kamus hero/About tetap identik dengan awal sesi. Perubahan homepage pada tahap ini hanya section paket dan penghapusan data konsep duplikat dari dictionary; perubahan homepage/hero/About lain di Git sudah ada sebelum Phase 3. Tidak mengubah konfigurasi Git global; safe.directory hanya per perintah.

### Hasil yang benar-benar dijalankan

| Pemeriksaan | Hasil |
| --- | --- |
| `npm run lint` | Lulus, tanpa warning/error |
| `npm run typecheck` | Lulus |
| `npm run build` | Lulus, katalog/detail server-rendered, About/homepage tetap prerender |
| `scripts/verify-routes.mjs` pada production lokal | 30 pemeriksaan HTTP lulus |
| `scripts/verify-packages.mjs` pada production dan development | Lulus: katalog ID/EN, semua tiga detail draft pada preview dev, invalid slug, penolakan draft publik/production, preview production ditolak, kedalaman route/locale, isolasi konteks inquiry |
| Logika server aktual dengan fixture terisolasi | Lulus: published non-demo saja, draft development/production/test, search, kategori, gabungan lokasi/durasi, empty result dan validasi path gambar |
| `scripts/verify-packages-browser.mjs` pada dev | Lulus: 24 kombinasi locale/viewport/halaman listing-detail; form search melalui Enter, filter/reset, katalog ke detail, ID→EN dengan query, detail EN→ID, tiga slot, reduced motion |
| Script browser paket pada production | Lulus: 12 kombinasi locale/viewport katalog empty state |
| `scripts/verify-packages-image.mjs` pada dev | Lulus: file WebP sintetis sementara diproses Next Image, decoding pixel, alt, focal point dan tiga slot. File uji dibersihkan |
| Regresi `scripts/verify-browser.mjs` | Lulus: homepage ID/EN pada 7 ukuran, 7 section, menu, keyboard, bahasa dan reduced motion |
| Regresi `scripts/verify-about-browser.mjs` | Lulus: 14 kombinasi locale/viewport, delapan section, konten, CTA, menu, bahasa |
| Regresi `scripts/verify-hero-browser.mjs` | Lulus: layout, autoplay riil 7 detik, pause hover/fokus, manual, keyboard, visibility simulasi, reduced motion, cleanup |
| Console/runtime/hydration dalam skenario browser | Tidak ada error yang tertangkap |
| `git diff --check` | Lulus; hanya peringatan normal konversi LF/CRLF Git Windows |

Viewport paket: 320, 390, 768, 1024, 1440, 1920 px untuk ID/EN. Grid terukur 1/2/3 kolom sesuai breakpoint, satu h1, tidak ada overflow horizontal atau teks yang terpotong pada elemen diperiksa. Tepat tiga slot foto diperiksa pada detail. Screenshot detail desktop Inggris dan katalog mobile Indonesia diperiksa secara visual. JSON/screenshot berada di `artifacts/phase3/`; laporan regresi lama pada folder artefak masing-masing (diabaikan Git).

Kesalahan selama validasi: sisa field dictionary paket Inggris menyebabkan typecheck/build pertama gagal; field lama dihapus, pemeriksaan diulang dan lulus. Hitungan slot HTTP awal menghitung payload React bersama DOM sehingga menjadi enam; regex dibatasi elemen HTML, browser mengonfirmasi tiga slot. Dev server khusus tidak dimulai karena server development pengguna sudah berjalan; pengujian dev memakai server existing tanpa menghentikannya.

### Batas verifikasi dan data

Belum ada paket resmi published, sehingga browser menguji konten detail melalui preview draft, bukan penawaran riil. Filter lokasi/durasi diuji pada logika server dengan fixture terisolasi, belum pada browser dengan paket resmi; opsi disembunyikan ketika tidak ada data. Itinerary/fasilitas/informasi penting terisi dan CTA inquiry published belum diuji sebagai alur browser paket resmi; cabang kosong, isolasi publikasi dan konteks draft diuji. Tidak menambahkan aktivitas atau harga rekaan untuk membuat katalog tampak aktif.

Foto resmi belum tersedia. Jalur gambar tersedia diuji dengan WebP sintetis; kualitas/crop foto wisata asli belum dapat dinilai. File hilang menggunakan fallback; isi file rusak harus diperiksa sebelum publikasi. Preview dibatasi development di proxy dan server, bukan autentikasi; aset public tetap dapat diakses publik. Production menolak query preview dan draft. Noindex dipertahankan; domain null sehingga canonical/hreflang produksi belum dibuat.

Browser berupa Chrome headless lokal melalui CDP, bukan perangkat fisik atau lintas browser. Tidak ada audit WCAG menyeluruh, Lighthouse/Core Web Vitals atau audit dependency/advisory baru. Panduan editor lengkap di `docs/TOUR_PACKAGES.md`. Server production dan Chrome khusus pengujian ditutup setelah validasi; server development pengguna dipertahankan.

## About Us Development — hasil final

Tanggal: 19 Oktober 2026 (Asia/Jakarta). Scope hanya About Us dan penyesuaian route placeholder/dokumentasi terkait. Tidak ada commit, push, instalasi dependency, operasi Git destruktif, atau deployment.

### Implementasi

`/id/about` dan `/en/about` memiliki route khusus, metadata terjemahan, satu h1, dan delapan section: About Hero, Company Introduction, Vision, Mission, Company Philosophy, Core Values, Our Commitment, Contact CTA. Visi, lima misi, filosofi, empat nilai, komitmen, dan copy utama berasal dari brief pemilik; tidak ada tambahan statistik, persentase, testimoni, sertifikasi, jumlah pelanggan, maupun tahun berdiri.

Seluruh komponen About adalah Server Components dan memakai Container, SectionHeading, ButtonLink, serta tokens Phase 2. Visual hero memakai fallback pesisir CSS berlabel sampai foto resmi diberikan. Filosofi memakai tipografi editorial besar dan aksen lingkaran halus; misi memakai daftar bernomor, nilai memakai empat kartu ikon Lucide tanpa progress bar.

Route dinamis hanya diubah pada generateStaticParams agar mengecualikan slug about dari prerender placeholder. Whitelist route/proxy dan locale tidak berubah. Build mengonfirmasi About khusus diprerender untuk ID/EN tanpa konflik.

### Hasil pemeriksaan

| Pemeriksaan | Hasil |
| --- | --- |
| `npm run lint` | Lulus, 0 error/warning |
| `npm run typecheck` | Lulus |
| `npm run build` | Lulus; `/id/about` dan `/en/about` diprerender |
| `node scripts/verify-routes.mjs` | 30 pemeriksaan HTTP lulus, termasuk kedua halaman About |
| `node scripts/verify-about-browser.mjs` | Lulus, 14 kombinasi locale/viewport |
| `node scripts/verify-hero-browser.mjs` | Lulus, regresi hero lengkap termasuk timer real-time, pause, keyboard, reduced motion, cleanup |
| Hash file dilindungi | 25 file identik dengan snapshot sebelum About |

About diuji pada 320, 390, 430, 768, 1024, 1440, 1920 px untuk kedua bahasa. Pengujian memeriksa urutan delapan section, satu h1, lima misi, empat nilai, metadata, active navigation, teks filosofi/visi, tidak ada progress bar atau klaim persentase, internal links, font termuat, dan layout tanpa overflow horizontal atau teks terpotong pada elemen yang diperiksa.

Interaksi yang lulus: language switcher ID → EN → ID pada About; Enter/Escape dan fokus menu mobile; Enter pada CTA menuju packages; CTA ke contact; reduced motion. Tidak ditemukan console/runtime/hydration error dalam skenario uji. Screenshot desktop 1440 full-page dan mobile Inggris 390 telah diperiksa secara visual. Screenshot/laporan lengkap berada di `artifacts/about/`, diabaikan Git.

Satu masalah ditemukan dan diperbaiki: minimum height visual hero memaksa aspect ratio melebar di viewport 320 px. Width visual kini eksplisit 100%; build dan browser test diulang setelah perbaikan dan lulus.

### Perlindungan perubahan sebelumnya

Git diff/status diperiksa sebelum dan sesudah. Snapshot SHA-256 disimpan pada `artifacts/about/protected-before.json`; homepage, seluruh komponen home/carousel dan layout, konfigurasi hero, dictionary hero, business config, proxy, global styles, package.json/lockfile, dan next.config.ts tidak berubah (25 file). Diff awal disimpan pada `artifacts/about/diff-before.patch` untuk membedakan perubahan yang sudah ada. Refinement hero tetap uncommitted; initial commit terakhir tetap `bd950f8`.

Dokumentasi yang sudah memuat refinement hero dipertahankan dan diperluas. Tidak menggunakan reset, clean, restore, commit otomatis, atau perubahan konfigurasi Git global.

### File About

Baru: `src/app/[locale]/about/page.tsx`, `src/i18n/about.ts`, `src/data/about-visual.ts`, `src/components/about/about-hero.tsx`, `company-sections.tsx`, `principle-sections.tsx`, `about.module.css`, `public/images/about/README.md`, dan `scripts/verify-about-browser.mjs`.

Diubah pada tahap ini: filter About dalam `src/app/[locale]/[slug]/page.tsx`, `PROJECT.md`, `README.md`, serta `docs/ROADMAP.md`, `ARCHITECTURE.md`, `SITEMAP.md`, dan `VALIDATION.md`. Homepage dan hero yang tampil modified pada status Git adalah perubahan sebelumnya, bukan perubahan About.

### Batas verifikasi

Browser yang dipakai adalah Chrome headless terpasang melalui CDP, bukan perangkat fisik atau lintas browser. Tidak ada audit aksesibilitas menyeluruh atau pengukuran Lighthouse/Core Web Vitals. Foto resmi belum tersedia, sehingga kualitas/crop foto nyata belum diuji. Visual CSS adalah ilustrasi, bukan foto lokasi. Penggantian foto didokumentasikan di `public/images/about/README.md`.

Kontak WhatsApp/email/alamat tetap belum dikonfigurasi; CTA memakai halaman internal sesuai brief. Noindex situs tetap dipertahankan. Catatan dependency development, experimental.globalNotFound, dan kepemilikan Git dari tahap sebelumnya tidak diubah atau diaudit ulang. Server dan Chrome pengujian ditutup setelah validasi.

## Refinement Premium Hero Carousel

Tanggal: 19 Oktober 2026 (Asia/Jakarta). Scope: hanya hero, konfigurasi/dictionary carousel, dokumentasi, dan verifikasi terkait. Tidak ada perubahan header/footer, enam section lain, routing/proxy, business config, package.json/lockfile, atau instalasi dependency.

### Git safety checkpoint

`.gitignore` diperiksa dan dilengkapi dengan pola kredensial/private key. `.env`, `.env.local`, credentials.json, private.key, .aws, node_modules, .next, profil browser, dan artifacts terabaikan. Pemindaian pola private key/token pada kandidat source tidak menemukan kecocokan; ini pemeriksaan pola, bukan sertifikasi bahwa semua jenis rahasia mungkin telah terdeteksi.

Initial commit berhasil: `bd950f8` — `chore: baseline Phase 1 and Phase 2 website`, mencakup 48 file. Identitas Git existing dipakai. Pengecualian kepemilikan safe.directory hanya berlaku per perintah; tidak ada perubahan Git global atau push. Perubahan refinement dibiarkan uncommitted agar mudah ditinjau terhadap baseline.

### Pemeriksaan

| Pemeriksaan | Hasil |
| --- | --- |
| ESLint | Lulus |
| TypeScript | Lulus |
| Production build | Lulus |
| Regresi HTTP `verify-routes.mjs` | 30 permintaan lulus |
| Regresi browser Phase 2 | Lulus: kedua locale, 7 ukuran viewport, menu mobile, bahasa, active state, reduced motion |
| Browser hero | Full-width, tanpa overflow/overlap pada 320, 390, 430, 768, 1024, 1440, 1920 px untuk ID/EN |
| Navigasi | Next/Previous wrap, indikator, link sesuai locale, Arrow Left, slide tersembunyi inert |
| Autoplay | Teramati maju sekali setelah 7 detik, satu timeout aktif |
| Pause hover/fokus | Timer dibersihkan dan indeks tetap selama lebih dari 7 detik |
| Pause/Play | Pause bertahan setelah meninggalkan kontrol; Play melanjutkan saat hover/fokus dilepas |
| Visibility | Simulasi visibilityState hidden + visibilitychange menghentikan timer; visible melanjutkan |
| Reduced motion | Autoplay mati, transition 0s, kontrol manual tetap bekerja |
| Cleanup | Navigasi client ke halaman lain menghapus timeout dan listener visibility carousel |
| Runtime/hydration | Tidak ada error console/runtime yang tertangkap pada skenario uji |

Pengukuran layout tambahan memeriksa ketiga slide untuk kedua bahasa pada seluruh ukuran, termasuk tinggi hero konsisten dan CTA tidak menutupi kontrol. Screenshot desktop 1440 dan mobile 320/390 diperiksa secara visual. Laporan dan gambar disimpan di `artifacts/hero/results.json`, `layout-results.json`, serta PNG per locale/viewport. Artefak tidak dilacak Git.

### Batas verifikasi

Chrome headless terpasang dipakai melalui CDP dan Node WebSocket, tanpa library baru. Bukan pengujian perangkat fisik atau lintas browser. Visibility diuji dengan event/state simulasi, bukan perpindahan tab fisik. Cleanup timeout/listener dibuktikan lewat instrumentasi browser; bukan heap profiling menyeluruh.

Foto belum disediakan, sehingga foto nyata, crop/focal point, prioritas jaringan gambar, dan cabang kegagalan file gambar belum diuji secara visual. Kode memakai next/image dengan prioritas indeks pertama, lazy loading berikutnya, error fallback, dan src null untuk tidak meminta file yang belum ada. Format/nama/dimensi dan penggantian foto didokumentasikan di `public/images/hero/README.md`.

Server/browser pengujian ditutup sesudah validasi. Temuan dependency development, Git ownership, dan experimental.globalNotFound dari fase sebelumnya tetap menjadi catatan; tidak ada audit dependency baru atau perubahan arsitektur pada refinement.

### File refinement

Baru: `src/data/hero-slides.ts`, `src/i18n/hero.ts`, `src/components/home/hero-{carousel,slide,controls}.tsx`, `src/components/home/hero-carousel.module.css`, `public/images/hero/README.md`, `scripts/verify-hero-browser.mjs`.

Diubah setelah baseline: `src/components/home/hero-section.tsx`, satu pemanggilan di `src/app/[locale]/page.tsx`, `README.md`, `PROJECT.md`, `docs/ARCHITECTURE.md`, dan `docs/VALIDATION.md`. `.gitignore` diperkuat sebelum baseline.

## Phase 2 — hasil final

Tanggal: 19 Oktober 2026 (Asia/Jakarta). Tidak ada dependency npm tambahan, perubahan package.json/lockfile, atau deployment. Next.js 16.4.2, React 19.3.1, TypeScript 6.0.3, dan Tailwind 4.3.3 dipertahankan.

| Pemeriksaan | Hasil Phase 2 |
| --- | --- |
| `npm run lint` | Lulus, 0 error / 0 warning |
| `npm run typecheck` | Lulus |
| `npm run build` | Lulus, seluruh halaman berhasil dikompilasi dan diprerender |
| Plus Jakarta Sans / Inter melalui next/font | Berhasil diunduh dan dimuat lokal; computed font browser sesuai |
| `node scripts/verify-routes.mjs` | 30 permintaan HTTP lulus; regresi Phase 1 tetap utuh |
| `node scripts/verify-browser.mjs` | Lulus pada Chrome headless yang sudah terpasang, tanpa dependency tambahan |
| Console/runtime/hydration | Tidak ditemukan error pada skenario browser yang diuji |

### Cakupan browser dan inspeksi visual

- `/id` dan `/en` diuji pada viewport 320, 390, 430, 768, 1024, 1440, dan 1920 px: 14 kombinasi homepage. Lebar dokumen tidak melebihi clientWidth, satu h1, tujuh section, semua ilustrasi dan font termuat, serta link yang terlihat tidak terpotong horizontal.
- Placeholder paket kedua bahasa diuji pada ketujuh ukuran tersebut: 14 kombinasi tambahan dengan layout tanpa overflow dan active state navigasi sesuai halaman.
- Menu mobile diuji dengan Enter, Escape dan pengembalian fokus, pointer, klik link paket, penutupan sesudah navigasi, serta tombol tutup.
- Language switcher diklik ID → EN → ID pada halaman paket; pathname dan atribut lang tetap sesuai halaman dan bahasa.
- Emulasi prefers-reduced-motion mengonfirmasi scroll-behavior menjadi auto.
- Screenshot viewport dan full-page desktop 1440, mobile 390 kedua bahasa, mobile Inggris 320, serta menu terbuka disimpan dalam `artifacts/phase2/`. Laporan terstruktur: `artifacts/phase2/browser-results.json`. Artefak dan profil browser diabaikan Git serta ESLint.
- Inspeksi gambar dilakukan pada screenshot desktop, mobile, menu terbuka, dan halaman panjang untuk memeriksa komposisi, wrapping, serta placeholder. Screenshot full-page panjang dapat diperkecil oleh penampil; pemeriksaan overflow juga memakai ukuran DOM.
- Pengujian memakai Chrome headless dengan viewport responsif, bukan perangkat fisik atau matriks lintas browser. Tidak ada audit aksesibilitas otomatis lengkap, pengukuran Lighthouse/Core Web Vitals, atau klaim kesesuaian WCAG menyeluruh.

### Perbaikan selama verifikasi

Script browser disesuaikan agar menunggu navigasi, menggulir untuk memuat gambar lazy-load, mengukur clientWidth tanpa menganggap scrollbar sebagai overflow, dan mengabaikan tautan yang sengaja tersembunyi. Pengiriman Enter/fokus diperbaiki pada harness Chrome agar keyboard native diuji dengan benar. Satu warning ekspresi di harness diperbaiki.

ESLint semula ikut memindai ekstensi dalam profil Chrome sementara. `.browser-profile/**` dan `artifacts/**` sekarang dikecualikan secara eksplisit tanpa mengecualikan source atau script verifikasi. Lint final lulus. Ini perubahan tooling yang berkaitan langsung dengan pengujian Phase 2; konfigurasi arsitektur Next.js tidak diubah.

### Informasi yang belum tersedia dan kendala lama

- Foto resmi, kontak, nomor WhatsApp, harga, durasi, itinerary, fasilitas, profil lengkap, dan dokumen hukum masih menunggu data pemilik. Tiga SVG lokal adalah ilustrasi konsep, bukan foto atau peta lokasi. Kartu paket adalah konsep editorial dan tidak dapat dipesan.
- Noindex dipertahankan hingga konten dan domain siap. Tidak ada backend, autentikasi, database, pembayaran, atau dashboard.
- Temuan dependency development dan peringatan ESLint 9 pada arsip Phase 1 belum diperbaiki pada fase ini; tidak ada instalasi atau audit npm baru, sehingga hasil audit lama bukan jaminan kondisi advisory terkini.
- experimental.globalNotFound dan kondisi kepemilikan Git Phase 1 tidak diubah. Repository masih belum memiliki commit/remote; seluruh file tetap untracked. Tidak ada reset, penghapusan pekerjaan pengguna, perubahan konfigurasi Git global, atau penulisan source di luar workspace.
- Pengambilan Google Fonts berhasil pada sesi ini; build awal pada mesin baru tetap memerlukan jaringan. Font disajikan lokal saat runtime, dengan display swap dan fallback sistem.
- Tidak tersedia tool browser bawaan; browser terpasang diuji melalui CDP lokal memakai WebSocket bawaan Node 24. Profil khusus workspace dipakai tanpa profil pribadi. Server dan browser pengujian ditutup setelah pemeriksaan.

### File Phase 2

File baru:

- `src/i18n/home.ts`
- `src/components/ui/{container,button-link,section-heading}.tsx`
- `src/components/home/{hero-section,introduction-section,featured-destinations,popular-packages,why-choose-us,travel-inspiration,final-cta,travel-visual}.tsx`
- `src/components/destinations/destination-card.tsx`
- `src/components/packages/tour-package-card.tsx`
- `src/components/layout/main-navigation.tsx`
- `public/images/placeholders/{batam-coast,barelang,islands}.svg` dan `README.md`
- `scripts/verify-browser.mjs`

File diubah:

- `src/styles/globals.css`
- `src/app/[locale]/{layout,page}.tsx`
- `src/components/layout/{header,footer,language-switcher}.tsx`
- `.gitignore`, `eslint.config.mjs`
- `AGENTS.md`, `PROJECT.md`, `README.md`
- `docs/{ARCHITECTURE,ROADMAP,SITEMAP,VALIDATION}.md`

### Sumber destinasi

Nama dan deskripsi inspirasi singkat Barelang, Nongsa, dan Pulau Abang dirujuk dari [portal resmi Indonesia Travel](https://www.indonesia.travel/gb/en/travel-ideas/adventure/4-rekomendasi-tempat-wisata-batam-yang-unik-dan-seru). Tidak menggunakan foto dari sumber tersebut, menyalin artikel, maupun menganggap destinasi sebagai paket yang tersedia dari perusahaan.

## Arsip validasi Phase 1

Tanggal: 19 Oktober 2026 (Asia/Jakarta). Workspace: `C:\AnggunAR`.

## Environment dan dependency final

Node.js 24.14.1, npm 11.11.0, Git 2.53.0.windows.2.

| Dependency langsung | Versi |
| --- | --- |
| next | 16.4.2 |
| react / react-dom | 19.3.1 |
| lucide-react | 1.59.0 |
| typescript | 6.0.3 |
| tailwindcss / @tailwindcss/postcss | 4.3.3 |
| eslint | 9.39.5 |
| eslint-config-next | 16.4.2 |
| @types/node | 24.19.2 |
| @types/react / @types/react-dom | 19.3.0 |

Dependency langsung dipin dengan versi tepat. `package-lock.json` disertakan. TypeScript 7 yang ditawarkan tag latest diganti dengan 6.0.3 karena parser ESLint mendukung TypeScript `<6.1.0`. ESLint 9 dipilih sesuai peer dependency plugin React yang digunakan konfigurasi Next.js; npm memberi peringatan bahwa ESLint 9 sudah tidak didukung upstream. Evaluasi ulang kombinasi ini sebelum pengembangan produksi.

## Hasil pemeriksaan final

| Pemeriksaan | Hasil |
| --- | --- |
| `npm ci` | Lulus; instalasi dari lockfile |
| `npm run lint` | Lulus, 0 error / 0 warning |
| `npm run typecheck` | Lulus |
| `npm run build` | Lulus, kompilasi dan prerender selesai |
| `node scripts/verify-routes.mjs` | Lulus, 30 permintaan HTTP pada server production lokal |
| `npm audit --omit=dev` | 0 kerentanan dependency produksi |
| `npm audit` | 5 temuan high pada rantai dependency development ESLint, belum terselesaikan |
| `.gitignore` | `.env`, `.env.local`, `node_modules`, `.next`, dan `.npm-cache` terabaikan |

## Uji HTTP

Server dijalankan dengan `npm run start -- --hostname 127.0.0.1`.

- `/id` dan `/en`: HTTP 200, bahasa HTML sesuai locale, heading, judul metadata termasuk nama perusahaan, serta robots noindex.
- Sembilan slug pada setiap locale: HTTP 200, metadata, heading, dan tautan perpindahan bahasa menuju slug yang sama. Total 20 halaman tersedia.
- `/`: HTTP 307 ke `/id`.
- `/?source=local-test`: HTTP 307 ke `/id?source=local-test` (query dipertahankan).
- `/fr`, `/fr/packages`, `/ID`, `/destinations`, `/id/missing`, `/en/missing`, `/id/packages/not-yet-available`, `/en/gallery/missing`: HTTP 404 dengan tautan pemulihan ke `/id` dan `/en`.
- Halaman tersedia tidak memuat form yang seolah-olah dapat mengirim booking.

## Kendala dan batas verifikasi

- Akses registry npm memerlukan eskalasi karena sandbox menolak jaringan. Instalasi berhasil setelah akses diberikan; cache dependency diarahkan ke workspace dan diabaikan Git.
- Satu percobaan `npm ci` gagal EBUSY karena folder dikunci sementara Windows; pengulangan berhasil.
- Peringatan PostCSS dan masalah judul homepage diperbaiki. Respons slug tak dikenal semula tidak memuat tautan pemulihan; validasi whitelist di proxy memperbaikinya. Build dan uji HTTP diulang setelah perubahan tersebut.
- Temuan audit development mengikuti rantai `eslint-config-next` → `@next/eslint-plugin-next` → `fast-glob` → `micromatch` → `braces`. Advisory yang dilaporkan npm: `GHSA-vfj7-8cjw-p6xm`. Saran otomatis npm menurunkan konfigurasi ke major Next.js 14, sehingga tidak diterapkan karena tidak sesuai stack saat ini. Tidak menjalankan `npm audit fix --force`.
- `npm ls --depth=0` menandai enam paket optional WASM/native transitif sebagai extraneous, termasuk setelah `npm ci`. Semua dependency langsung terpenuhi; lint dan build berhasil. Tidak menambahkan paket transitif sebagai dependency langsung hanya untuk menyembunyikan label npm.
- Git sudah diinisialisasi, tanpa remote atau commit. Perbedaan akun sandbox dan akun Windows memicu dubious ownership saat pemeriksaan dari akun Windows; gunakan `git -c safe.directory=C:/AnggunAR status` bila diperlukan. Konfigurasi global tidak diubah.
- Next.js menandai `experimental.globalNotFound` sebagai eksperimen; dipakai untuk fallback global pada root layout dinamis. Validasi URL utama tetap dilakukan di proxy. Evaluasi ulang opsi ini ketika upgrade framework.
- Tidak tersedia alat browser interaktif pada sesi ini. Klik perpindahan bahasa, hydration di browser, screenshot, dan inspeksi visual mobile belum diuji; verifikasi perpindahan bahasa mencakup href HTML dan respons halaman tujuan. Responsivitas diterapkan menggunakan breakpoint Tailwind dan layout fleksibel.
- Tidak ada deployment, database, autentikasi, dashboard, integrasi layanan eksternal, atau pemrosesan booking. Informasi bisnis resmi menunggu pemilik.

Server pengujian dihentikan setelah validasi. Jalankan kembali melalui panduan README untuk membuka website.
