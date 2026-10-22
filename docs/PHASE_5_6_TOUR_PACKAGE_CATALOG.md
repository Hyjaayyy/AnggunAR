# Phase 5.6 — Market-Based Tour Package Catalog

Tanggal riset/implementasi: 22 Oktober 2026. CV Anggun AR Sukses Abadi. Enam nilai target berasal dari instruksi pemilik untuk perencanaan; **bukan persetujuan produk, tarif resmi, kontrak pemasok atau jaminan ketersediaan**.

## 1. Hasil dan lokasi preview

Ditambahkan **enam konsep draft/unverified**, tanpa menghapus tiga demo existing. Total sembilan entri, semuanya tetap draft; nol paket resmi published. Batam City Escape yang lama beririsan tema dengan City Highlights, tetapi tidak setara sebagai spesifikasi: masih demo UI tanpa durasi, rute terstruktur atau harga. Demo tersebut dipertahankan dan konsep baru dipisahkan, bukan ditimpa.

Konsep baru hanya tampil melalui **preview development**: `/id/packages?preview=draft` dan `/en/packages?preview=draft`. Detail memakai `/[locale]/packages/[slug]?preview=draft`. Query tersebut tetap tidak membuka draft pada production. Katalog homepage/production tidak dianggap memiliki penawaran resmi hanya karena draft ini dibuat.

Keputusan mempertahankan batas publikasi mengikuti instruksi bahwa persetujuan pemilik diperlukan sebelum publikasi. Tidak memperluas allowlist proxy untuk draft production. Preview uji QA terpisah menggunakan `http://127.0.0.1:3200`; URL itu bersifat lokal sementara dan servernya dihentikan setelah uji.

| Konsep / slug | Durasi perencanaan | Target indikatif per orang | Status |
| --- | --- | --- | --- |
| Batam City Highlights / batam-city-highlights | 1 hari | Rp450.000 | Draft / unverified |
| Barelang & Culinary Experience / barelang-culinary-experience | 1 hari | Rp725.000 | Draft / unverified |
| Batam Weekend Escape / batam-weekend-escape | 2 hari 1 malam | Rp950.000 | Draft / unverified |
| Batam Complete Discovery / batam-complete-discovery | 3 hari 2 malam | Rp1.500.000 | Draft / unverified |
| Bintan Island Escape / bintan-island-escape | 1 hari | Rp850.000 | Draft / unverified |
| Batam–Bintan Discovery / batam-bintan-discovery | 3 hari 2 malam | Rp2.500.000 | Draft / unverified |

Deskripsi dan urutan aktivitas ID/EN ditulis orisinal dari konsep yang diberikan. Itinerary menyatakan rencana yang perlu dibahas, bukan jadwal operator. Tidak menyalin itinerary/deskripsi/foto pesaing. Semua slot gambar konsep baru null dan memakai fallback existing; tidak mengunduh gambar atau menghapus media.

## 2. Riset pembanding dan batas perbandingan

Konten yang dapat dibaca dari lima URL referensi ditinjau pada tanggal riset. Sebagian hasil sumber memiliki usia crawl lama; ini observasi halaman, **bukan quote live dari operator atau survei pasar representatif**. Tidak menghubungi operator atau menyatakan promo masih berlaku. Harga berbeda basis peserta, layanan, tanggal, hotel dan transportasi; tidak menghitung rata-rata pasar atau margin dari angka yang tidak sebanding.

| Referensi yang diperiksa | Observasi ringkas | Implikasi untuk target Anggun |
| --- | --- | --- |
| [Pegijalan katalog Batam](https://www.pegijalan.com/paket-wisata/batam) | City sehari mulai Rp650.000/orang min. 2; Barelang/kuliner Rp725.000/orang min. 4; Batam 2H1M Rp1.050.000/orang min. 2 | City Rp450.000 dan Weekend Rp950.000 adalah target di bawah contoh tersebut, belum tervalidasi biaya; Barelang sama angka tetapi basis peserta belum disetujui |
| [Pegijalan Batam 3H2M](https://www.pegijalan.com/paket-wisata/paket-wisata-batam-3-hari-2-malam) | Mulai Rp1.500.000/orang, minimum 2; dapat berubah sesuai komponen perjalanan | Mendukung adanya contoh angka sebanding untuk Complete Discovery, bukan bukti Anggun dapat menyediakan komponen yang sama |
| [Batam Wisata 2H1M](https://www.batam-wisata.com/paket-tour-batam-2-hari-1-malam-253.asp) | Mengarahkan pembaca menghubungi operator untuk harga terbaik; tidak ditemukan nominal publik yang dapat dipakai sebagai quote pasti | Rujukan kategori/durasi saja; tidak mengarang angka Rp950.000 dari halaman ini |
| [Tourbatam katalog](https://tourbatam.com/tour/) | Batam–Bintan 3H2M mulai Rp3.200.000/pax; city Batam 3H2M Rp2.600.000/pax | Target gabungan Rp2.500.000 dan Complete Rp1.500.000 lebih rendah dari contoh ini; perlu costing lintas pulau/akomodasi. Minimum peserta tidak diasumsikan |
| [Batam City Travel katalog](https://batamcitytravel.com/destinasi-package/) | Tabel transportasi city sehari mencantumkan Rp450 ribu pada kendaraan kapasitas 1–5; Bintan sehari Rp1,3 juta pada kapasitas 1–5. Baris ini tidak berlabel per orang, sehingga diperlakukan sebagai pembanding kendaraan, bukan pax. Ada promo 2H1M Rp450 ribu/pax min. 2 pada bagian berbeda | **Basis tabel kendaraan tidak disamakan dengan tarif per orang.** Tidak menganggap target Rp450.000 city/Rp850.000 Bintan terbukti dari tabel tersebut; promo berbeda tidak dipindahkan sebagai fasilitas Anggun |

Pemetaan sumber ke konsep disimpan dalam `planning.sourceUrls`. Sumber per konsep adalah pembanding konteks, tidak selalu memuat nominal target yang sama. Terutama **Bintan Rp850.000/orang belum memiliki pembanding setara per orang yang terverifikasi dari halaman tersebut**. Tidak menyamakan kapasitas kendaraan dengan minimum pemesanan atau mengonversinya menjadi biaya per orang tanpa quote.

## 3. Asumsi peserta dan fasilitas

`participantBasis: null` untuk keenam konsep. Tidak menetapkan minimum 1, 2, 4 atau 20 peserta, meskipun operator pembanding memakai minimum tertentu. Satuan per orang adalah satuan target yang diminta pengguna, bukan jaminan harga untuk solo traveler. Tidak ada kalkulasi total grup, diskon anak, pembagian kamar atau tiers ukuran rombongan.

`price` resmi, `included` dan `excluded` tetap null. Hal berikut belum dikonfirmasi termasuk **atau** tidak termasuk dalam target:

- Hotel/nama/kategori, jumlah kamar, okupansi dan sarapan; angka malam adalah durasi konsep, bukan reservasi hotel.
- Menu, jumlah makan, restoran, minuman dan kebutuhan diet.
- Kendaraan, driver/guide, penjemputan/transfer, bahan bakar, parkir, jam layanan dan kapasitas bagasi.
- Tiket objek/aktivitas, ferry/kapal/penyeberangan, pelabuhan dan biaya lintas pulau.
- Pajak, service charge, tip, asuransi, biaya high season, tambahan peserta/anak atau kebutuhan khusus.
- Titik mulai/akhir, jadwal akses, waktu tempuh, cuaca, izin kunjungan, keselamatan dan kelayakan rute Bintan/lintas pulau.

Rute konsep mengikuti brief: city/Welcome to Batam/Nagoya/oleh-oleh; Barelang/foto/kuliner; akhir pekan kota/belanja/waktu bebas; Batam tiga hari; pantai/landmark Bintan; kombinasi Batam–Bintan/pantai/budaya. Tidak menambahkan nama hotel, restoran, jam ferry, tiket atau aktivitas yang dijamin tersedia.

## 4. Model, label dan CTA

Model `TourPackage` ditambah field optional `planning` dengan verification unverified, harga indikatif per orang, basis peserta, jumlah malam, tanggal riset dan source URLs. Tiga demo lama byte-data-nya tetap sama; field baru tidak diwajibkan pada paket lama.

Nilai target tidak disimpan sebagai official `price`. Formatter hanya menampilkan nilai planning sebagai estimasi untuk market draft, berdampingan dengan label **“Estimasi harga pasar — belum final” / “Market price estimate — not final”**, satuan orang/person dan status draft/unverified. Detail memakai judul **Konsep itinerary / Concept itinerary**, disclaimer peserta/fasilitas dan catatan ketersediaan. Deskripsi halaman listing preview juga menyebut konsep untuk ditinjau, bukan published offers. Styling memakai komponen/palet existing, tanpa mengubah Hero, cinematic, branding atau noindex.

CTA khusus preview market draft adalah **Minta Penawaran / Request a Quote**. Helper WhatsApp terpusat memakai nomor utama dari `business.ts`; pesan memuat nama paket, pertanyaan mengenai tanggal, jumlah peserta yang diperlukan dan penawaran aktual, serta pengakuan harga/ketersediaan belum final. Seluruh teks mengikuti locale dan URL-encoded. Tautan tidak mengirim pesan atau mengonfirmasi booking.

Demo UI lama tetap tidak mendapatkan CTA inquiry. Detail market draft tidak mempunyai link ke sistem booking. `/booking?package=<market-slug>` tetap menolak konteks paket draft, termasuk saat development. Published package inquiry existing tetap memakai alur kontak Phase 5.4. Tidak membuat `Offer`/Product JSON-LD, rating, review, best seller atau klaim popularitas penjualan.

## 5. File yang berubah

| File | Tujuan |
| --- | --- |
| src/types/tour-package.ts | Metadata planning optional, terpisah dari official price |
| src/data/tour-packages.ts | Enam konsep orisinal bilingual, sumber dan harga target; tiga demo dipertahankan |
| src/lib/tour-packages.ts | Pengenal market draft, format estimasi dan durasi hari/malam |
| src/i18n/packages.ts | Label draft/estimasi/quote/disclaimer/preview dan itinerary konsep |
| src/i18n/contact.ts | Pertanyaan penawaran bilingual |
| src/lib/contact.ts | Opsi quote pada helper WhatsApp terpusat |
| src/components/packages/tour-package-card.tsx | Label estimasi/status/satuan dan durasi |
| src/components/packages/package-filters.tsx | Unit singular 1 day di filter EN yang kini memiliki durasi nyata |
| src/app/[locale]/packages/page.tsx | Deskripsi preview yang jelas berbeda dari katalog resmi |
| src/app/[locale]/packages/[slug]/page.tsx | Disclaimer konsep dan CTA quote development-only |
| scripts/verify-packages.mjs | Pertahankan isolasi production; ekspektasi data/filter sesuai sembilan draft |
| scripts/verify-packages-browser.mjs | Ekspektasi grid/filter sembilan draft; tunggu URL/konten, bukan hanya delay tetap untuk navigasi preview |
| scripts/verify-market-catalog.mjs | Kontrak enam konsep, quote, encoding/locale dan HTTP production/dev guards |
| scripts/run-production-checks.mjs | Tambah market-catalog gate; total 20 |
| docs/PHASE_5_6_TOUR_PACKAGE_CATALOG.md | Laporan ini |

Tidak mengubah proxy, data destinasi/galeri, kontak bisnis resmi, package status menjadi published, Hero/cinematic, CSS, dependency, legal atau environment files.

## 6. Validasi dan transparansi

| Pemeriksaan final | Hasil dan batas |
| --- | --- |
| ESLint / Typecheck | **PASS**, exit 0 pada source final |
| Production build | **PASS**, Next 16.4.2 Turbopack, 23 static pages; salinan QA sudah dibersihkan sebelum build ini |
| Existing unit tests | **PASS**, controller/resolver/markup media |
| Market catalogue unit | **PASS**, enam target harga/durasi/status, tiga demo utuh, official price/inclusions null, sources, itinerary ID/EN, 12 CTA dari detail aktual, penolakan akses draft tanpa preview |
| Contact integration regression | **PASS**, helper/encoding dan browser kontak ID/EN tetap lulus; pesan non-quote tetap mengikuti konfigurasi terpusat |
| Preview HTTP pada dev existing dan QA | **PASS**, ID/EN untuk keenam detail, label estimasi/noindex, tanpa Offer/booking link, guard konteks booking; dev server existing sempat cold compile |
| QA preview browser existing package suite | **24 kombinasi PASS**, 6 viewport × ID/EN × listing/detail demo; grid sembilan draft, filter/reset, query/bahasa, foto fallback dan keyboard |
| QA market detail browser | **24 kasus PASS**, 6 konsep × ID/EN × 390/1440 px; label estimasi, quote URL/nama/pesan/keyboard intent, noindex, tanpa Offer/overflow atau captured console error |
| Routing | **30 checks PASS**, ID/EN, metadata, noindex, root redirect dan 404 |
| Production HTTP crawl | **26 halaman, 26 internal links, 18 asset PASS**, headers, draft isolation, media dan redirect/404 |
| Market HTTP production | **PASS**, keenam slug tetap 404 dengan/tanpa preview query, ID/EN; draft tidak masuk booking |
| Full production gates | **20/20 PASS** pada build final; semua 19 gate sebelumnya ditambah market-catalog gate |
| Video Range | **66/66 PASS**, localhost dan IP aktif 192.168.1.5, 200/206/416, boundary/suffix/open-ended/conditional dan byte/hash equality |
| Hero/About/Destinations/Packages | **PASS** pada regresi existing: 6 gesture cases Hero, About responsive/navigation, 36 kombinasi destinasi/galeri dan 12 kombinasi katalog publik |
| Cinematic | **PASS**, 6 playback cases, 54 lifecycle checks kedua origin, 8 rendering cases × 2 frame; tidak mengubah source video/playback |
| Production smoke / debug exclusion / error recovery | **PASS**, 6 smoke cases Chrome, panel development tidak tampil pada production, 4 kasus error harness terisolasi; bukan live hosting fault injection |
| Pengiriman WhatsApp, perangkat fisik, HTTPS hosting | **NOT TESTED**; quote hanya diuji sebagai URL/intent tanpa mengirim pesan |

Preview diuji dengan Edge 155 lokal dan viewport desktop/mobile emulation; production suite memakai Chrome 155 lokal. Tidak menyamakan viewport dengan HP fisik. Screenshot `market-preview-id-390.png` dan `market-preview-id-1440.png` tersimpan di artifacts fase ini; screenshot desktop ditinjau dan memperlihatkan status draft, label estimasi, target per orang, CTA quote dan fasilitas belum dikonfirmasi. Tidak ada foto kompetitor pada preview.

Ulangi unit/HTTP dan gates setelah build/start lokal dengan origin yang benar:

```powershell
$env:NEXT_TELEMETRY_DISABLED = '1'
$env:TEST_BASE_URL = 'http://localhost:3100'
$env:TEST_PREVIEW = '0'
node scripts/verify-market-catalog.mjs
$env:TEST_ORIGINS = 'http://localhost:3100,http://192.168.1.5:3100'
$env:BROWSER_DEBUG_URL = 'http://127.0.0.1:9333'
npm run test:production
# Untuk Next development yang sudah berjalan (bukan production):
$env:TEST_BASE_URL = 'http://localhost:3000'
$env:TEST_PREVIEW = '1'
node scripts/verify-market-catalog.mjs
```

Deteksi ulang IP; jangan menganggap 192.168.1.5 permanen. Bukti final: `suite-final.json`, `production-gates-final.log`, `range-final.json`, `lifecycle-final.json`, `rendering-final.json`, `http-final.json`, `market-qa-http.log`, `packages-qa-browser.log` dan `market-browser.json` di `artifacts/phase5-6/`. Build ID dicatat di build-id.txt. Run awal IP lama disimpan sebagai `suite-initial.json` / `production-gates-initial.log`, bukan ditimpa sebagai PASS.

Temuan pengujian awal dipertahankan di artifacts: dev cold compilation 33,8 detik melebihi timeout lama; assertion navigasi preview setelah delay tetap diperbaiki menjadi kondisi URL/konten berbatas, tanpa mengubah aplikasi untuk meluluskan test. Harness awal mencoba JSON.stringify seluruh React tree dan menemukan referensi sirkular; diganti ekstraksi children teks, tanpa perubahan model agar assertion lolos.

IP Wi-Fi berubah dari 192.168.1.29 menjadi **192.168.1.5** selama suite pertama. Run pertama tidak dianggap PASS: Range/lifecycle/rendering/debug pada origin lama gagal/timeout, sedangkan localhost merespons. Run final menggunakan IP yang dideteksi ulang. Tidak mengasumsikan HMR/video codec sebagai penyebab dan tidak mengubah video/playback.

Next menolak server development kedua pada direktori yang sama. Proses pengguna tidak dihentikan dan lock tidak dihapus. Preview tambahan dijalankan pada salinan QA source/media dalam artifacts, tanpa `.env`, `.git` atau credential, dengan Node modules existing dan server Next dev standar port 3200. Source QA diverifikasi identik sebelum pembersihan salinan milik sesi. Salinan QA bukan deployment staging/production atau bukti perangkat fisik.

## 7. Persetujuan yang masih diperlukan sebelum publikasi

- [ ] Nama/fokus setiap produk, kelayakan rute dan deskripsi/itinerary ID/EN disetujui pemilik CV.
- [ ] Penawaran pemasok: transportasi, hotel, konsumsi, tiket, penyeberangan dan kapasitas aktual.
- [ ] Basis/minimum peserta, okupansi kamar, anak/solo traveler, jenis grup dan batas layanan.
- [ ] Tarif resmi/quotation policy, pajak/biaya tambahan, margin, masa berlaku dan high season; jangan menyetujui target hanya karena sama dengan satu referensi.
- [ ] Durasi/hari/malam, titik awal/akhir, jadwal aktual, cadangan cuaca dan prosedur keselamatan/aksesibilitas.
- [ ] Included/excluded tertulis, pembatalan/refund, syarat pembayaran dan proses konfirmasi manusia.
- [ ] Foto berizin, alt/caption ID/EN dan hak publikasi; tidak menggunakan foto pesaing.
- [ ] Review legal dan alur data/contact, uji WhatsApp/perangkat fisik dan persetujuan publikasi eksplisit. Perubahan status draft bukan tindakan otomatis fase ini.

**Status: katalog konsep tersedia untuk review development; belum ada paket atau harga resmi yang dinyatakan tersedia. Website keseluruhan tetap NOT READY.** Noindex hanya boleh ditinjau melalui keputusan release terpisah setelah seluruh gate terpenuhi.

## 8. Git dan bukti

Baseline Git: **116 entri** perubahan yang sudah ada. Status akhir: **123 entri**, **0 deleted entry**. Tujuh tambahan status terdiri dari lima file sebelumnya clean yang kini modified dan dua file baru (laporan serta test market-catalog); beberapa file sesi ini sudah modified/untracked sebelum fase ini. Daftar file implementasi ada pada bagian 5.

Perbandingan data membuktikan tiga demo existing identik dengan baseline yang sebelumnya clean; total berubah hanya dari 3 menjadi 9 dengan penambahan enam konsep. **34 berkas terlindungi** (termasuk public media, Hero/cinematic, CSS, locale layout/noindex, config dan manifest/lockfile) identik dengan hash audit sebelumnya. Seluruh perubahan lama dipertahankan, tidak dipulihkan ke HEAD. Pembacaan git show hanya dipakai untuk membandingkan data lama, bukan reset atau checkout.

Source salinan QA diperiksa: **85/85 berkas identik** dengan source utama. Server QA dihentikan dan hanya salinan baru milik sesi di `artifacts/phase5-6/qa-project` dibersihkan setelah path absolut diverifikasi, agar salinan TypeScript tidak masuk glob build utama. Media asli tidak dihapus; hasil perbandingan source dan screenshot tetap disimpan. Dev server pengguna tetap berjalan.

Tidak commit, push, reset, deployment atau menghapus media asli. Laporan fase sebelumnya tetap menjadi riwayat. Artefak lokal fase ini menyimpan log awal/final, suite, bukti preview/CTA, hash/source QA dan snapshot Git; bukan direktori untuk diunggah ke hosting.
