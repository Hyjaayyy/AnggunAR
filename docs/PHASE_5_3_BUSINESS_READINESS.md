# Phase 5.3 — Business Readiness & Content Completeness

Tanggal audit: 22 Oktober 2026. Proyek: Anggun AR Sukses Abadi. Pemeriksaan source dan build production lokal, bukan deployment. Baseline melanjutkan seluruh perubahan Phase 5.2.

## 1. Ringkasan dan status

**Status kesiapan bisnis: NOT READY.** Website berfungsi sebagai informasi dan inspirasi, tetapi belum dapat digunakan pelanggan untuk menyelesaikan inquiry/pemesanan. Kontak resmi belum tersedia, tidak ada paket resmi published, kebijakan legal belum diterbitkan, domain dan deployment belum diverifikasi. Tidak ada data bisnis pengganti yang dibuat.

Kondisi positif: placeholder dijelaskan kepada pengunjung, paket demo tidak tampil pada production, booking tidak menerima data/pembayaran, identitas tampilan konsisten, ID/EN tersedia, dan noindex tetap aktif. Tidak ditemukan broken internal link dalam cakupan crawl. Keberhasilan HTTP atau klik CTA tidak berarti layanan bisnis sudah tersedia.

| Area | Kondisi yang ditemukan | Keputusan |
| --- | --- | --- |
| Kontak/inquiry | WhatsApp, email, alamat, peta belum tersedia | Blocker layanan pelanggan |
| Penawaran | 3 konsep draft, 0 paket published | Blocker penjualan paket |
| Booking | Halaman informasi persiapan; tidak ada submit/backend/payment | Belum operasional; tidak boleh diklaim booking otomatis |
| Legal | Privacy dan Terms placeholder; kebijakan pembatalan/refund belum tersedia | Blocker sebelum layanan/data/transaksi diaktifkan; perlu review pemilik/legal |
| Domain/deployment | websiteUrl null; belum verifikasi hosting/TLS/domain | Blocker peluncuran |
| Profil/trust | Profil bilingual tersedia; bukti identitas, cakupan layanan dan persetujuan klaim belum tersedia dalam repository | REQUIRED INPUT |
| Media | Cinematic lokal tersedia; visual Hero/About fallback, foto destinasi belum tersedia, galeri kosong | Kelengkapan visual dan izin perlu konfirmasi; tidak menghapus media |

## 2. Audit halaman ID/EN dan daftar placeholder

Seluruh pasangan berikut diperiksa pada browser: `/id` dan `/en`, masing-masing `about`, `destinations`, tiga detail destinasi, `packages`, `gallery`, `contact`, `booking`, `faq`, `privacy`, `terms` — total 26 halaman. Detail paket publik belum tersedia karena seluruh dataset paket adalah draft; ketidaktersediaannya diverifikasi sebagai perilaku yang benar.

| Halaman/komponen | Temuan dan lokasi kode | Informasi yang diperlukan |
| --- | --- | --- |
| Homepage | `src/i18n/home.ts`: profil/layanan sedang dipersiapkan, konsep perjalanan, kanal kontak belum tersedia. `src/components/home/popular-packages.tsx:11` hanya mengambil published package dan menampilkan empty state saat kosong | Penawaran resmi dan persetujuan copy pemasaran |
| Hero | `src/data/hero-slides.ts:19`: ketiga src null; visual konsep berlabel. CTA menuju destinations, packages, contact | Foto final berizin bila ingin mengganti fallback; tidak wajib mengubah desain |
| Cinematic | `src/data/home-video.ts:3`: MP4 H.264 dan poster lokal dikonfigurasi; keterangan menyatakan media supplied by owner | Konfirmasi izin publikasi footage/poster; keberadaan file bukan bukti hak penggunaan |
| About | `src/i18n/about.ts:20`: profil, visi/misi, nilai dan komitmen sudah ditulis. `src/data/about-visual.ts:9`: foto null | Persetujuan pemilik atas status/identitas perusahaan dan klaim pelayanan; foto resmi jika tersedia |
| Destinations | `src/data/destinations.ts`: Barelang, Nongsa, Abang published sebagai informasi, bukan konfirmasi layanan. Tiga slot foto setiap destinasi belum memiliki foto lokal; fallback jelas | Foto berizin; validasi isi/caption; rute operasional hanya setelah dikonfirmasi |
| Packages | `src/data/tour-packages.ts:8–20`: Batam City Escape, Coastal Slow Days, Island Perspectives semuanya draft/demo. Price, durationDays, location, itinerary, included, excluded null; information kosong | Daftar paket resmi dan seluruh detail komersial |
| Detail paket | `src/app/[locale]/packages/[slug]/page.tsx`: template overview/itinerary/inclusions tersedia, inquiry ke booking hanya untuk paket published. Draft preview tidak menawarkan inquiry | Belum bisa menguji paket nyata end-to-end; jangan publish demo |
| Gallery | `src/data/gallery.ts:4`: array kosong. `src/lib/gallery.ts:7`: hanya published dengan permission dan file tersedia yang ditampilkan | Foto berizin beserta caption, alt ID/EN, kategori, konteks dokumentasi dan izin subjek jika relevan |
| Contact | `src/i18n/dictionaries.ts:44` dan `:72`, serta route placeholder: tidak ada nomor/email/alamat/peta | Kontak resmi terverifikasi, jam layanan dan penanggung jawab |
| Booking | `src/i18n/dictionaries.ts:45` dan padanan EN: belum tersedia dan tidak memproses data/pembayaran | Alur inquiry manual yang disetujui, kanal tujuan, waktu respons; keputusan booking terpisah |
| FAQ | `src/i18n/dictionaries.ts`: masih halaman persiapan tanpa jawaban layanan | Jawaban resmi dari pemilik; jangan mengarang persyaratan perjalanan |
| Privacy / Terms | `src/app/[locale]/[slug]/page.tsx:34`: legalPending, dokumen belum diterbitkan | Dokumen disetujui, versi/tanggal berlaku dan penanggung jawab review |
| Navbar | `src/components/layout/header.tsx`: tautan ke halaman yang ada; CTA Jelajahi paket/Explore packages. Wordmark dua baris hardcoded, accessible name dari business.name | Logo/identitas final; tidak mengubah branding pada audit ini |
| Footer | `src/components/layout/footer.tsx:14–16`: eksplorasi, perusahaan dan legal; availability menandai website dikembangkan. Lokasi adalah fokus wisata Batam, bukan alamat kantor | Kontak/identitas legal final; jangan menganggap teks lokasi sebagai alamat resmi |

Tidak ditemukan nomor WhatsApp dummy, mailto palsu, harga jual, testimoni, badge sertifikasi atau keberhasilan booking palsu dalam halaman publik yang diperiksa. Tiga nama paket adalah konsep editorial, bukan produk terverifikasi. Fixture synthetic pada skrip test bukan data bisnis dan tidak dipublikasikan. File dalam `public` tetap dapat diakses langsung; status draft/permission pada dataset bukan kontrol akses berkas, sehingga dokumen privat tidak boleh disimpan di sana.

## 3. Booking flow dan status CTA

Alur yang diharapkan: **Homepage → Packages → detail paket published → inquiry resmi → tindak lanjut manusia**. Alur aktual berhenti pada katalog kosong; tautan alternatif menuju Contact, yang juga belum memiliki kanal komunikasi.

| CTA/alur | Hasil teknis | Hasil bisnis |
| --- | --- | --- |
| Hero Explore / Jelajahi Destinasi → daftar/detail destinasi | Target tersedia ID/EN | Informasi inspirasi; bukan janji layanan |
| Navbar, Hero, About, homepage → Packages | Navigasi tersedia | 0 paket resmi; belum bisa memilih produk |
| Katalog kosong → Contact | Klik browser berhasil ID/EN | Tidak ada saluran untuk menghubungi admin |
| About/Destination/slide Contact → Contact | Href benar; halaman tersedia | Label Hubungi Kami belum memberikan kontak langsung; blocker, tidak dialihkan ke nomor pengganti |
| Footer Inquiry & Booking → Booking | Halaman tersedia | Placeholder, bukan konfirmasi pemesanan |
| Detail published → `/[locale]/booking?package=...` | Template tersedia di source | NOT TESTED dengan produk nyata karena tidak ada published package |
| Draft detail / preview di production | 404; draft tidak bocor lewat `?preview=draft` | Aman dari penawaran demo yang tidak disetujui |
| Booking dengan slug draft | Pesan paket tidak tersedia; tidak menampilkan nama draft sebagai penawaran | Tidak ada pengiriman, data atau pembayaran |

Browser menguji klik homepage → packages → contact di kedua bahasa, serta booking dengan konteks draft dan pemeliharaan query saat pergantian bahasa. Tidak ada form kontak/inquiry/booking. Form filter GET destinasi/katalog adalah pencarian konten, bukan formulir pelanggan. Tidak menambahkan tombol WhatsApp/email sebelum identitas kanal diverifikasi.

Sebelum mengaktifkan inquiry: pemilik menentukan kanal resmi, pihak yang menerima, jam layanan, bahasa layanan, target respons, data minimal yang diperlukan dan bagaimana penawaran dikonfirmasi. Pilihan tanggal atau harga yang ditampilkan kelak harus dijelaskan sebagai permintaan, bukan ketersediaan/konfirmasi otomatis. Alur penyimpanan data, pembayaran dan backend memerlukan persetujuan terpisah.

## 4. Legal dan trust

Ini inventaris topik untuk dikonfirmasi, bukan penyusunan kebijakan hukum, penetapan kewajiban hukum final atau klaim kepatuhan. Review dengan pemilik dan pihak yang kompeten sesuai model layanan, wilayah pelanggan dan proses data yang benar-benar dipilih.

| Topik | Status | Konfirmasi sebelum diterbitkan |
| --- | --- | --- |
| Privacy Policy | `/id/privacy` dan `/en/privacy` ada, isinya placeholder | Identitas pengelola, kanal pertanyaan, kategori/tujuan data, hosting/log, pihak penerima, masa simpan, prosedur permintaan data dan penanganan insiden sesuai praktik nyata |
| Terms & Conditions | `/id/terms` dan `/en/terms` placeholder | Ruang lingkup layanan, proses penawaran/konfirmasi, pembayaran bila berlaku, tanggung jawab, batas layanan dan penyelesaian keluhan yang disetujui |
| Cancellation / Refund | Tidak ada route/dokumen khusus | Apakah diperlukan terpisah atau bagian Terms; aturan pembatalan pelanggan/operator, perubahan tanggal, cuaca, no-show, biaya dan waktu refund yang benar-benar disepakati |
| Identitas perusahaan | Nama tampilan ada, data pembuktian tidak disediakan | Nama legal persis dan bentuk usaha; alamat; identitas/perizinan yang boleh ditampilkan. Jangan menambah PT/CV atau nomor izin tanpa bukti |
| Pernyataan layanan wisata | Destinasi memberi disclaimer; About memuat tujuan dan komitmen layanan | Apakah operator/agen/perantara; cakupan wilayah, mitra, tanggung jawab, keselamatan dan bantuan pelanggan. Jangan menjanjikan layanan/aktivitas yang belum disetujui |
| Foto/video dan trust | Fallback berlabel; gallery belum published; cinematic lokal | Hak publikasi, kredit bila disyaratkan, konteks foto dan persetujuan subjek. Tidak membuat testimoni |
| Cookies / analytics | Tidak ditemukan integrasi analytics pemasaran atau kode set cookie/localStorage pada source aplikasi yang diperiksa | Inventaris hosting/CDN/log/cookie sebenarnya sebelum release; jika analytics dipilih, review kebutuhan notice/consent dan minimisasi data lebih dahulu |

Tidak memasang analytics, cookie banner spekulatif, monitoring pihak ketiga, atau formulir pengumpulan data. Tidak ada analytics dalam source bukan bukti hosting masa depan tidak mencatat IP/request atau mengatur cookie. Perlu verifikasi pada target deployment nyata sebelum membuat klaim privasi. Tanggal berlaku dan terjemahan legal harus disetujui, bukan otomatis ditetapkan oleh audit.

## 5. Struktur data bisnis dan konsistensi ID/EN

`src/lib/business.ts:2–9` sudah merupakan titik pusat identitas dengan email, whatsapp, address, websiteUrl dan logo bernilai null. Struktur ini layak dipertahankan; **mengisi nilainya saja belum mengaktifkan kontak**. Pencarian consumer menunjukkan UI saat ini hanya menggunakan business.name; Contact masih membaca teks placeholder, bukan merender field kontak. Integrasi renderer kondisional/CTA bersama dilakukan sesudah data disetujui dan harus menghilangkan placeholder pada saat yang tepat.

Tidak melakukan refactor besar. Rekomendasi tahap implementasi berikutnya: simpan satu nilai WhatsApp/email/domain terverifikasi dalam business config, format link melalui helper yang sama, dan simpan label ID/EN pada dictionary. Pisahkan alamat terstruktur dan copy terjemahan, serta data paket resmi dari presentasi. Jangan menyebarkan nomor di dictionary atau komponen. Tambahkan validasi untuk data yang benar-benar tersedia, tanpa membuat CTA aktif saat null.

Nama perusahaan konsisten pada title/footer/accessible name, meski wordmark visual header ditulis dua bagian dan nama juga disebut dalam copy About/dictionary. Tidak mengubah nama/branding atau mengganti seluruh teks menjadi template pada audit ini.

Hasil ID/EN:

- Semua 26 halaman memiliki lang, title/description, noindex dan tautan bahasa ke halaman ekuivalen; 30 pemeriksaan routing lulus termasuk `/` → `/id` dan URL tidak dikenal 404.
- Pesan kontak belum tersedia, booking tidak memproses data, legal belum diterbitkan, paket/galeri kosong konsisten secara makna.
- Satu label Indonesia “Why choose us” diterjemahkan menjadi “Mengapa memilih kami” di `src/i18n/home.ts`. Copy EN tetap sama.
- Label branding/editorial bilingual dalam Hero serta filosofi About dibiarkan; bukan bukti kesalahan terjemahan bisnis. Hero tidak diubah.
- `home.ts` packages.description ID dan EN tidak sejajar (konsep/pending versus published), tetapi komponen PopularPackages menggunakan description dari dictionary packages/emptyDescription, bukan field itu. Dicatat sebagai copy yang tidak dipakai, tidak menyebabkan penawaran published palsu pada UI saat ini. Sinkronkan setelah strategi copy paket disetujui.
- Label aksesibilitas breadcrumb pada template Packages masih “Breadcrumb” untuk kedua locale; minor, tidak menghambat alur. Tidak mengklaim terjemahan sempurna atau terjemahan legal sudah diverifikasi profesional.

## 6. SEO dan domain

`src/app/[locale]/layout.tsx:14–19` memakai title template dengan business.name dan `robots: {index:false, follow:false}`; seluruh halaman audit tetap `noindex, nofollow`. Title dan description ID/EN tersedia, tetapi metadata Contact/Legal/FAQ masih menjelaskan persiapan. Meta About perlu persetujuan klaim bisnis seperti isi halaman.

`business.websiteUrl` null, belum ada canonical/metadataBase/hreflang metadata final, sitemap final atau social preview resmi yang dikonfigurasi pada source yang diperiksa. Tautan language switcher tersedia tetapi tidak sama dengan metadata SEO alternates. Logo/favikon resmi belum ada; `data:,` adalah placeholder favicon yang disengaja, bukan branding final. Ini pekerjaan sebelum release setelah domain dan aset disetujui, bukan alasan mengarang URL.

Noindex **tidak dihapus** dan bukan kontrol akses. Kesiapan indexing harus dinilai terpisah setelah domain/TLS, kebijakan, data bisnis dan pengujian deployment selesai; penghapusan memerlukan keputusan release, tidak otomatis mengikuti audit ini.

## 7. Perbaikan aman dan hasil validasi

Perubahan source hanya satu label di `src/i18n/home.ts` (ID benefits.eyebrow). Tidak mengubah Hero, cinematic, dataset destinasi/paket/galeri, media, layout/desain Ocean Blue Luxury, routing, noindex, booking atau kebijakan. Tidak ditemukan broken internal link yang membutuhkan perbaikan source.

| Pemeriksaan Phase 5.3 | Hasil dan batas |
| --- | --- |
| ESLint | PASS, exit 0, max warnings 0 |
| Typecheck | PASS, exit 0 |
| Production build | PASS, Next 16.4.2 Turbopack, 23 static pages |
| `npm run test:unit` | PASS, controller/resolver/markup media memakai mock; bukan bukti playback perangkat fisik |
| `verify-packages.mjs` pada production | PASS: aturan publikasi/filter/fixture terisolasi, HTTP ID/EN dan isolasi draft |
| `verify-routes.mjs` | PASS: 30 routing checks, language links, title/lang/noindex/404 |
| `verify-production.mjs` | PASS: 26 halaman, 26 internal links, 18 asset, headers, draft isolation, MP4 200/206/416 |
| Tautan sumber destinasi | Ketiga URL Indonesia Travel memberi HTTP 200 saat HEAD; bukan verifikasi ulang substansi konten |
| Audit rendered browser tambahan | PASS: 26 halaman ID/EN, metadata/status placeholder, tanpa kontak palsu, 4 pemeriksaan alur/query booking, tanpa error runtime/console/network tercatat |
| `verify-browser.mjs --interactions-only` | PASS: mobile menu, active state, language switcher dan reduced motion; tidak menjalankan ulang seluruh matriks visual |
| Detail published dan inquiry nyata | NOT TESTED / BLOCKED: paket/kontak resmi belum tersedia |
| Perangkat fisik/hosting/TLS/email/WhatsApp end-to-end | NOT TESTED pada Phase 5.3 |
| Full 17 production gates / 66 Range matrix | NOT TESTED ulang pada fase ini; hasil Phase 5.1 hanya referensi historis |

Transparansi pengulangan: pemanggilan awal verify-packages tanpa TEST_BASE_URL memakai dev server default dan gagal ekspektasi isolasi production. Diulang dengan `TEST_BASE_URL=http://localhost:3100` dan lulus; bukan perubahan data untuk meluluskan tes. Harness browser awal membandingkan innerText case-sensitive terhadap label yang diberi CSS uppercase, sehingga assertion gagal lalu proses Node Windows melaporkan UV_HANDLE_CLOSING. Assertion harness dinormalisasi hurufnya, tanpa perubahan CSS/aplikasi; seluruh pemeriksaan ulang lulus. Log awal tetap disimpan.

Server uji production lokal di port 3100 dijalankan khusus audit dan dihentikan setelah selesai. Browser automation menggunakan Chromium lokal melalui CDP; tidak mengklaim hasil tersebut sebagai pengujian HP/perangkat fisik. Telemetry Next dinonaktifkan saat build. Tidak mengirim inquiry, pembayaran atau pesan ke pihak luar.

Bukti lokal yang diabaikan Git: `artifacts/phase5-3/` berisi baseline Git, lint/build/typecheck/unit logs, hasil test paket awal dan production, routes/http/navigation logs, `browser-content.mjs`, `browser-content.json`, dan log browser awal/final. Salinan laporan HTTP berisi status setiap link/asset/source. Pengujian link eksternal hanya mengunjungi sumber wisata, bukan melakukan booking.

## 8. Risiko tersisa dan urutan penyelesaian

1. **Prioritas peluncuran:** kanal kontak terverifikasi, minimal satu penawaran atau model layanan resmi, serta dokumen yang sesuai proses bisnis nyata. Tanpa itu pelanggan mencapai halaman persiapan dan tidak dapat melakukan inquiry.
2. Persetujuan identitas, profil, visi/misi dan klaim pemasaran; foto/video dan hak publikasinya. Jangan menganggap copy yang sudah tertulis sebagai bukti layanan/izin resmi.
3. Sesudah input disetujui, integrasikan data terpusat ke UI, terbitkan paket valid beserta terjemahan dan kebijakan, lalu uji alur pelanggan sampai respons admin. Harga boleh tetap berbasis penawaran hanya bila model itu dikonfirmasi dan kontak berfungsi.
4. Verifikasi domain, hosting, TLS, data processing, notifikasi, recovery, dan perangkat fisik di staging/target deployment yang disetujui. Lengkapi SEO dengan domain nyata; baru pertimbangkan indexing.
5. Risiko development dependency dari Phase 5.2 tetap mengikuti mitigasi/exception bersyarat, terpisah dari audit bisnis ini. Tidak ada audit dependency baru atau perubahan penerimaan risiko pada fase ini.

## 9. Git dan batas perubahan

Baseline: 104 entri Git yang sudah ada; status akhir 105 entri, tanpa deleted entry. Deliverable sesi: satu edit label pada `src/i18n/home.ts` dan laporan ini. Perbandingan diff sebelum/sesudah memastikan satu-satunya bagian diff tracked yang berubah adalah file terjemahan tersebut. Seluruh perubahan lain dipertahankan; tidak melakukan commit, push, reset, deployment atau penghapusan media. Bukti lokal berada di direktori artifacts yang sudah diabaikan.

## 10. Checklist REQUIRED INPUT — diisi bersama pemilik

Gunakan catatan persetujuan bisnis, bukan secret atau salinan dokumen identitas pribadi dalam repository. Setiap kelompok perlu penanggung jawab, tanggal verifikasi, dan persetujuan ID/EN. Tandai N/A hanya dengan alasan yang disetujui pemilik.

- [ ] **Identitas resmi:** nama legal/bentuk usaha yang boleh dipublikasikan: ______; nama tampilan disetujui: ______; informasi perizinan yang boleh ditampilkan dan bukti verifikasinya: ______; pemilik persetujuan/tanggal: ______.
- [ ] **WhatsApp resmi:** nomor format internasional: ______; pemilik akun bisnis/penanggung jawab: ______; berhasil diuji kirim/terima pada HP dan desktop tanggal: ______; izin publikasi: ______.
- [ ] **Email bisnis:** alamat final: ______; domain dikuasai pemilik: ______; uji kirim/terima selesai: ______; penanggung jawab inbox: ______; izin publikasi: ______.
- [ ] **Alamat/peta:** alamat kantor/customer-facing yang benar: ______; apakah menerima kunjungan/perlu janji: ______; pin peta terverifikasi: ______; izin publikasi alamat: ______.
- [ ] **Jam layanan dan inquiry:** hari/jam/zona waktu: ______; bahasa layanan: ______; target waktu respons yang realistis: ______; admin utama/cadangan: ______; kanal keluhan: ______.
- [ ] **Domain/hosting:** domain final yang dimiliki: ______; URL resmi: ______; target staging/production: ______; penanggung jawab akses/TLS/backup: ______. Jangan memasukkan password/token di sini.
- [ ] **Ruang lingkup layanan:** operator/agen/perantara: ______; wilayah/rute resmi: ______; layanan dan mitra yang benar-benar tersedia: ______; batas layanan dan prosedur bantuan: ______.
- [ ] **Paket resmi — ulangi per paket:** nama/slug: ______; deskripsi ID/EN: ______; destinasi/durasi: ______; itinerary harian/titik temu/transportasi: ______; termasuk/tidak termasuk: ______; batas/minimum peserta dan persyaratan: ______; informasi keselamatan/aksesibilitas relevan: ______; pemilik persetujuan/tanggal: ______.
- [ ] **Harga/ketersediaan:** harga dan mata uang atau model berdasarkan penawaran: ______; basis per orang/grup, pajak/biaya tambahan: ______; periode berlaku: ______; cara mengecek ketersediaan: ______; pihak yang mengonfirmasi: ______. Jangan mengubah null menjadi angka perkiraan.
- [ ] **Proses inquiry/booking:** kanal awal: ______; data minimal yang diminta: ______; langkah penawaran dan konfirmasi manusia: ______; pembayaran bila sudah disetujui: ______; kapan pesanan dianggap terkonfirmasi: ______; bukti konfirmasi yang diberikan: ______.
- [ ] **Terms dan pembatalan/refund:** dokumen final/versi: ______; aturan perubahan/pembatalan/no-show/cuaca/operator: ______; biaya dan waktu refund bila berlaku: ______; pemeriksa dan tanggal persetujuan: ______; dokumen ID/EN selaras: ______.
- [ ] **Privacy/data:** pengelola dan kanal pertanyaan: ______; data/tujuan/penerima/masa simpan: ______; hosting/log/cookies aktual: ______; proses permintaan/insiden: ______; analytics dipakai atau tidak: ______; pemeriksa dokumen dan persetujuan: ______.
- [ ] **Profil/marketing/FAQ:** profil perusahaan, visi/misi, komitmen dan cakupan layanan disetujui: ______; jawaban FAQ resmi: ______; reviewer ID/EN/tanggal: ______. Testimoni hanya bila autentik dan berizin.
- [ ] **Branding/media:** logo/favikon final: ______; daftar foto/video beserta hak publikasi/kredit: ______; caption/alt ID/EN dan konteks dokumentasi: ______; izin subjek jika relevan: ______; pemilik persetujuan: ______.
- [ ] **Release verification:** domain/TLS dan packaging diuji: ______; perangkat/browser fisik ID/EN: ______; inquiry sampai respons admin berhasil: ______; legal dan metadata final ditinjau: ______; monitoring/rollback diuji: ______; keputusan indexing/noindex dan izin release terpisah: ______.
