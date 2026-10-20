# Roadmap

## Phase 1 — fondasi lokal

Selesai. Inisialisasi stack, Git, konfigurasi bisnis, layout, homepage sementara, placeholder, routing `/id` dan `/en`, metadata dasar, dan dokumentasi. Fondasi ini dipertahankan dalam Phase 2.

## Phase 2 — Professional UI/UX & Homepage Development

Disetujui dan diimplementasikan lokal: design tokens, font next/font, header/footer, navigasi mobile, tujuh section homepage bilingual, reusable cards, SVG placeholder orisinal, metadata homepage, dan regresi Phase 1. Validasi lint, TypeScript, build, HTTP routing, browser headless, screenshot, interaksi, dan reduced motion dicatat di `VALIDATION.md`.

Batas Phase 2 ditetapkan oleh brief terakhir: tidak membuat listing/detail atau galeri interaktif. Konten resmi, foto berizin, harga, itinerary, fasilitas, profil, kontak, FAQ, dan dokumen hukum masih menunggu pemilik serta persetujuan ruang lingkup berikutnya. Tidak ada klaim popularitas atau testimoni palsu.

## About Us — pengembangan halaman tersendiri

Disetujui dan diimplementasikan: route About khusus Indonesia/Inggris, delapan section editorial, metadata, dictionary bertipe, konten resmi dari pemilik, fallback visual lokal, dan pengujian responsive/navigasi. Tidak memperluas ke listing paket, destinasi, backend, atau tahap penyimpanan. Hero carousel dan perubahan sebelumnya tetap dipertahankan. Foto dan kontak resmi masih menunggu data.

## Phase 3 — Tour Packages & Itinerary Development

Disetujui pemilik 20 Oktober 2026. Katalog dan detail bilingual, filter query GET, tuple tiga foto lokal dengan fallback, itinerary dinamis, status draft/published, preview khusus development, integrasi homepage, dan CTA konteks inquiry. Data lokal tanpa backend. Panduan pengelolaan ada di `TOUR_PACKAGES.md`; hasil validasi di `VALIDATION.md`.

## Inquiry dan penyimpanan — tahap terpisah, belum disetujui

Rancang PostgreSQL/Prisma, validasi server, perlindungan spam, kebijakan data, dan alur inquiry/booking. Field yang direncanakan: nama, email, WhatsApp, paket, tanggal perjalanan, peserta, dan permintaan tambahan. Integrasi WhatsApp hanya setelah nomor resmi tersedia. Inquiry bukan konfirmasi booking otomatis.

## Phase 4 — admin dan media (menunggu persetujuan)

Autentikasi dan otorisasi admin; kelola destinasi, paket, itinerary, galeri, inquiry, booking, dan pengaturan website. Evaluasi Cloudinary atau object storage untuk media, dengan konfigurasi dan biaya yang disetujui.

## Phase 5 — kesiapan produksi (menunggu persetujuan)

Tinjau dokumen hukum, keamanan, aksesibilitas, performa, backup, monitoring, domain, dan deployment. Tidak ada deployment atau layanan berbayar tanpa persetujuan. Pembayaran bukan bagian fase awal dan memerlukan ruang lingkup terpisah.
