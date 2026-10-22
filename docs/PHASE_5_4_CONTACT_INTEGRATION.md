# Phase 5.4 — Official Business Contact Integration

Tanggal: 22 Oktober 2026. Implementasi dilakukan setelah Phase 5.5 sesuai urutan permintaan pemilik. Data kontak berasal dari instruksi resmi pemilik pada sesi ini, bukan hasil tebakan atau pencarian pihak ketiga.

## 1. Hasil dan konfigurasi terpusat

Kontak resmi diintegrasikan pada Contact ID/EN, footer seluruh halaman, dan alur inquiry manual. Nama resmi pada konfigurasi adalah **CV Anggun AR Sukses Abadi**. Wordmark/branding singkat, Hero Carousel dan cinematic tidak diubah.

Sumber tunggal: `src/lib/business.ts`.

| Field | Nilai resmi |
| --- | --- |
| name | CV Anggun AR Sukses Abadi |
| address | Perum Royal Grande Tahap 3, Blok A No. 17 |
| email | ARtravel655@gmail.com |
| whatsapp | 6282379595106 |
| whatsappAlternative | 6282114483976 |
| addressCity / addressProvince / addressPostalCode / addressCoordinates | null — belum dikonfirmasi |
| websiteUrl / logo | null — belum tersedia |

Digit nomor hanya disimpan di config; format tampilan +62 823-7959-5106 dan +62 821-1448-3976 diturunkan oleh helper. Email, nomor dan alamat tidak disalin sebagai literal ke komponen lain. Literal kontrak dalam skrip test adalah ekspektasi data resmi, bukan sumber UI kedua. Tidak menyimpan password/token/kredensial Gmail atau memasang integrasi pengiriman email server.

`focusArea` Batam pada config adalah fokus wisata yang sudah ada, **tidak digunakan untuk melengkapi alamat kantor**. Alamat tampil persis sebagaimana diberikan pemilik, tanpa tambahan kota/provinsi/kode pos/koordinat. Tidak menambahkan Google Maps, iframe atau pencarian peta otomatis.

## 2. Halaman Contact dan footer

Route statis `src/app/[locale]/contact/page.tsx` menggunakan bahasa dan metadata lokal, komponen bersama `BusinessContact`, serta gaya Ocean Blue Luxury yang tersedia. Route contact dikeluarkan dari daftar prerender catch-all agar tidak memiliki versi placeholder ganda. `/id/contact` dan `/en/contact` tetap mempertahankan navigasi bahasa dan noindex.

Halaman menampilkan nama resmi, alamat beserta catatan bagian alamat belum dikonfirmasi, email, nomor utama dan alternatif, link telepon, tombol WhatsApp untuk kedua nomor dan tombol kirim email. Footer memakai komponen yang sama dalam mode ringkas: alamat, email dan WhatsApp/telepon utama; alternatif tersedia di Contact agar footer tidak mengulang semua opsi. Navigasi Contact Us/Hubungi Kami tetap menuju halaman Contact sesuai locale.

External link dibuka pada konteks yang sama (tidak memakai target=_blank), sehingga tidak membuat akses window.opener ke tab asal. Label tautan menjelaskan kanal/nomor, target kontak memiliki tinggi minimal 44 px, email dapat membungkus, dan navigasi/focus menggunakan aturan aksesibilitas global yang tersedia. Tidak menjanjikan dukungan aplikasi WhatsApp/email/telepon tertentu pada OS pengguna.

## 3. Helper dan CTA yang diperbarui

`src/lib/contact.ts` menyusun URL dari config dan `src/i18n/contact.ts`. Pesan berbeda untuk konsultasi umum, proses booking manual dan inquiry paket; label/pesan mengikuti ID/EN. WhatsApp memakai URLSearchParams, email memakai percent encoding untuk subject, dan tel memakai format internasional tanpa spasi.

| CTA/kanal | Tujuan dan perilaku |
| --- | --- |
| WhatsApp utama | `https://wa.me/6282379595106?text=...`; pesan konsultasi sesuai bahasa |
| WhatsApp alternatif | `https://wa.me/6282114483976?text=...`; opsi tambahan Contact |
| Email Us / Kirim Email | `mailto:ARtravel655@gmail.com?subject=...`; subject Pertanyaan perjalanan / Travel inquiry dengan nama perusahaan |
| Telepon utama | `tel:+6282379595106` |
| Telepon alternatif | `tel:+6282114483976` |
| Contact Us / Hubungi Kami | Tetap `/${locale}/contact`; tidak mengubah Hero atau alur navigasi |
| Ask About This Package / Tanyakan Paket Ini | Detail paket published membuka WhatsApp utama dengan nama paket dari content locale; tidak lagi menuju placeholder booking |
| Inquiry & Booking umum | `/[locale]/booking` menyediakan konsultasi WhatsApp utama dengan pesan mengenai rencana perjalanan/proses pemesanan; bukan tombol konfirmasi otomatis |
| Booking dengan query paket | Hanya paket published/non-demo yang valid mendapat inquiry bernama paket. Draft/tidak dikenal tidak mendapat CTA inquiry di main content |

Tidak ditemukan CTA literal “Book Now/Pesan Sekarang” dalam source saat audit; tidak membuat penawaran atau mengubah tombol jelajah paket menjadi tombol pesan untuk katalog kosong. Pola booking WhatsApp disiapkan pada helper dan halaman konsultasi, dengan penjelasan bahwa tim harus mengonfirmasi rincian/ketersediaan.

Membuka link **belum mengirim pesan dan belum menyelesaikan pemesanan**. Website tidak memiliki form pengiriman kontak/backend/payment, tidak mengumpulkan data pribadi baru, dan tidak memberikan status booking sukses. Pesan prefilling dapat ditinjau pengguna di aplikasi tujuan. Ketiga paket tetap draft/demo; tidak ada paket bisnis baru yang diterbitkan.

Teks homepage bagian CTA akhir yang sebelumnya mengatakan kanal kontak sedang dipersiapkan disesuaikan agar tidak bertentangan dengan kontak resmi yang kini tersedia. Teks inquiry paket dan metadata Contact/Booking juga diperbarui. Copy Hero tetap dipertahankan sesuai batasan; ajakan mengunjungi Contact tetap berfungsi.

## 4. File yang diubah pada sesi ini

| File | Perubahan |
| --- | --- |
| src/lib/business.ts | Data resmi terpusat dan bagian alamat yang belum dikonfirmasi tetap null |
| src/lib/contact.ts | Helper WhatsApp/email/tel/format tampilan |
| src/i18n/contact.ts | Label, pesan, subject dan penjelasan manual ID/EN |
| src/components/ui/business-contact.tsx | Presentasi kontak bersama untuk Contact/footer |
| src/app/[locale]/contact/page.tsx | Contact resmi ID/EN dan metadata |
| src/app/[locale]/[slug]/page.tsx | Hapus prerender contact placeholder, konsultasi WhatsApp dan guard query paket |
| src/app/[locale]/packages/[slug]/page.tsx | Inquiry published package menuju WhatsApp bernama paket |
| src/components/layout/footer.tsx | Kontak ringkas dari komponen/config bersama |
| src/i18n/dictionaries.ts | Hapus contactPending yang tidak berlaku; metadata Contact/Booking |
| src/i18n/packages.ts | Penjelasan inquiry manual melalui WhatsApp |
| src/i18n/home.ts | Koreksi keterangan kontak pada CTA akhir |
| scripts/verify-contact.mjs | Unit/helper/encoding, published fixture terisolasi dan HTTP guard |
| scripts/verify-contact-browser.mjs | Pemeriksaan kontak responsive, href, focus, click intent dan bahasa |
| scripts/run-production-checks.mjs | Tambah dua contact gates; total menjadi 19 |
| docs/PHASE_5_4_CONTACT_INTEGRATION.md | Laporan ini |

## 5. Validasi

| Pemeriksaan pada versi final | Hasil |
| --- | --- |
| ESLint | **PASS**, exit 0, max warnings 0 |
| Typecheck | **PASS**, exit 0 |
| Production build | **PASS**, Next 16.4.2 Turbopack, 23 static pages termasuk `/id/contact` dan `/en/contact` |
| Existing unit tests | **PASS**, controller/resolver/markup media |
| Contact unit/fixture/encoding | **PASS**, nomor/mailto/tel, subject/pesan ID/EN, nama paket dengan karakter khusus, CTA template published dan penolakan draft |
| Contact HTTP localhost + LAN | **PASS**, ID/EN, data resmi/noindex, tanpa form/peta, booking umum WhatsApp dan guard paket tak tersedia |
| Contact browser Chrome localhost | **8 kasus PASS**, ID/EN 320/390/768/1440 px; 40 click intents, keyboard/focus/bahasa, footer, tanpa overflow/console/network error tercatat |
| Contact browser Edge LAN | **8 kasus PASS**, matriks viewport dan pemeriksaan yang sama; bukti terpisah dari Chrome |
| Routing | **30 checks PASS**, ID/EN, bahasa, metadata/noindex, root redirect dan 404 |
| Production HTTP crawl | **26 halaman, 26 internal links, 18 asset PASS**; tanpa broken internal link dalam cakupan crawl |
| Link eksternal WhatsApp | Enam variasi URL pesan ID/EN pada dua nomor memberi HTTP 200 pada HEAD; bukan bukti akun aktif/pesan diterima |
| Production gates | **19/19 PASS**, seluruh 17 gate lama + 2 gate kontak baru |
| Hero / About / Destinations / Packages | **PASS** pada suite existing; Hero gesture/keyboard/CTA, About responsive/nav, 36 kombinasi destinasi/galeri dan 12 kombinasi katalog publik |
| Cinematic | **PASS**, 6 playback cases, 54 lifecycle checks localhost/LAN, 8 rendering cases × 2 frame; fallback, reload, pause/resume, loop dan reduced motion sesuai skrip |
| HTTP Range | **66/66 PASS** localhost/LAN, 200/206/416 beserta byte/hash/boundary/conditional cases |
| Production smoke / debug exclusion / recovery | **PASS**, smoke Chrome 6 kasus, diagnostic panel production tersembunyi, isolated error recovery 4 kasus; bukan live hosting outage test |
| Perangkat fisik, pengiriman WhatsApp/email/panggilan dan HTTPS deployment | **NOT TESTED** |

Browser lokal Chrome 155.0.8059.85 dan Edge 155.0.4283.62 diuji lewat CDP. Lebar mobile adalah pengujian responsive pada engine desktop, bukan pengujian Android/iPhone. Screenshot `contact-id-390.png` dan `contact-id-1440.png` berada di artifacts fase ini; tampilan desktop ditinjau secara visual. Noindex tetap aktif pada halaman yang diperiksa.

Perintah untuk mengulang setelah build/start production lokal:

```powershell
$env:TEST_BASE_URL = 'http://localhost:3100'
$env:BROWSER_DEBUG_URL = 'http://127.0.0.1:9333'
node scripts/verify-contact.mjs
node scripts/verify-contact-browser.mjs
# Seluruh regresi, dengan browser QA tersedia dan IP LAN aktif:
$env:TEST_ORIGINS = 'http://localhost:3100,http://192.168.1.29:3100'
npm run test:production
```

Tes klik kontak mencegat navigasi eksternal sebelum aplikasi luar dibuka. Ini menguji target link, klik/focus/keyboard dan URL intent tanpa mengirim WhatsApp/email atau memulai panggilan. Pengiriman/penerimaan nyata, status akun WhatsApp/Gmail, handler default OS dan pengujian perangkat fisik **NOT TESTED**. Data disetujui pemilik tidak otomatis membuktikan inbox/nomor sedang dapat menerima pesan.

Fixture paket published hanya berada di memori proses test; tidak menulis atau mempublikasikan paket di source/database/website. Uji encoding menggunakan karakter &, ?, #, +, kutip dan Unicode agar nama paket tidak menjadi query parameter tambahan. Query paket tak dikenal tidak dipakai sebagai nama paket/pesan.

Bukti lokal di `artifacts/phase5-4/`: baseline/status/diff, log lint/build/typecheck/unit, contact unit/HTTP/browser, suite final, dan protected-files.json. Hasil browser dari `artifacts/contact/browser.json` disalin ke direktori fase ini. Log harness awal yang gagal karena VM belum menyediakan URLSearchParams dipertahankan; global standar ditambahkan pada sandbox test, bukan workaround aplikasi.

## 6. Placeholder dan required input tersisa

- Kota/provinsi/kode pos dan pin/koordinat alamat belum dikonfirmasi; tidak menebak dari fokus wisata Batam. Konfirmasi juga jam layanan, penerimaan kunjungan kantor dan waktu respons admin.
- Domain/hosting/HTTPS, logo/favikon dan izin media tetap mengikuti required input/audit sebelumnya.
- Semua paket resmi, harga/durasi/itinerary/inclusions dan ketersediaan belum diterbitkan. Gallery published tetap kosong.
- Privacy/Terms dan pembatalan/refund belum disetujui. Kontak resmi tidak menggantikan legal review maupun izin pengumpulan data.
- Uji manual kedua WhatsApp, email, tel pada laptop/Android/iPhone perlu dilakukan pemilik/tester dengan izin mengirim pesan/panggilan. Tidak mengklaim bukti tersebut dari automation.
- Jam operasional, PIC utama/cadangan, alur penawaran, konfirmasi dan pembayaran belum ditentukan. Tidak menambahkan SLA atau klaim booking otomatis.

**Kontak telah diintegrasikan secara teknis; website keseluruhan tetap NOT READY untuk production.** Laporan ini memperbarui blocker kontak dari Phase 5.3/5.5, tidak membatalkan blocker paket, legal, deployment, monitoring/rollback dan perangkat fisik.

## 7. Git dan pelestarian pekerjaan sebelumnya

Baseline Git berisi **106 entri** perubahan sebelumnya; status akhir **116 entri**, **0 deleted entry**. Sepuluh entri tambahan terdiri dari tiga file sebelumnya clean yang kini dimodifikasi dan tujuh file/direktori baru menurut pengelompokan git status. Ini bukan jumlah seluruh file implementasi: beberapa file yang diedit sesi ini sudah modified/untracked sebelumnya. Daftar deliverable sesi terdapat di bagian 4.

Perbandingan hash dengan baseline source fase sebelumnya menemukan tepat delapan file existing berubah: konfigurasi bisnis, helper-consumer/copy kontak, dan runner gates sebagaimana daftar bagian 4. **31 berkas terlindungi** (media/public, data paket/destinasi/galeri, Hero/cinematic terkait) tetap identik. Layout robots/noindex, next.config.ts, package manifest/lockfile, CSS dan source lain di manifest baseline juga tetap identik. Seluruh perubahan sebelumnya dipertahankan; tidak memulihkan/reset file ke Git HEAD.

Bukti Git/status/diff dan daftar perubahan existing disimpan di artifacts fase ini. File baru test serta komponen kontak tidak menambah dependency. Laporan lama dipertahankan sebagai riwayat; status kontak terbaru mengikuti laporan ini.

Tidak melakukan commit, push, reset atau deployment. Noindex, kebijakan legal dan media dipertahankan; tidak mengubah .env atau konfigurasi hosting. Server production lokal milik sesi dihentikan setelah pengujian; dev server/browser yang sudah ada tidak dihentikan.
