# Anggun AR Sukses Abadi

Audit Phase 5, temuan terbuka, gate pengujian, serta monitoring/rollback: [Production readiness](docs/PRODUCTION_READINESS_AUDIT.md). Build lokal bukan izin deployment; konten kontak/legal/paket dan domain resmi masih membutuhkan konfirmasi.

Tindak lanjut Range dan dependency: [Phase 5.1 technical hardening](docs/PHASE_5_1_TECHNICAL_HARDENING.md). `node scripts/verify-video-range.mjs` menguji boundary/conditional dan byte file pada TEST_ORIGINS; sudah termasuk `npm run test:production`. Advisory development tetap dilaporkan selama belum ada patch aman.

Phase 4 Destinations & Gallery tersedia di `/id/destinations`, `/en/destinations`, `/id/gallery` dan `/en/gallery`. Detail contoh: `/id/destinations/barelang-bridge`. Destinasi adalah informasi wisata, bukan penawaran paket; galeri masih empty state sampai foto berizin tersedia. Panduan: [Destinations](docs/DESTINATIONS.md), [Gallery](docs/GALLERY.md).

Phase 3 katalog/detail paket telah ditambahkan. Panduan data bilingual, itinerary, tiga foto lokal, draft preview development dan publikasi: [docs/TOUR_PACKAGES.md](docs/TOUR_PACKAGES.md). Belum ada paket resmi published; production menampilkan empty state, bukan contoh DEMO. Tidak ada backend booking atau deployment.

Website travel dengan Next.js App Router, TypeScript, Tailwind CSS, ESLint, dan Lucide React. Phase 2 menambahkan homepage Modern Tropical + Premium bilingual, design system, header/footer, dan navigasi mobile. Informasi layanan masih sementara; tidak menerima booking.

## Prasyarat dan instalasi

- Node.js 24.x (environment awal: 24.14.1), npm 11.x.
- Jalankan semua perintah dari `C:\AnggunAR`.

```powershell
npm ci
npm run dev
```

Buka http://localhost:3000/id atau http://localhost:3000/en. URL `/` mengarah ke `/id`. Hentikan server dengan Ctrl+C.

## Validasi dan production lokal

```powershell
npm run lint
npm run typecheck
npm run build
npm run start
```

Regresi production tanpa dependency tambahan (gunakan Chromium dengan CDP loopback dan profil uji terpisah; server `next start` harus sudah berjalan):

```powershell
npm run test:unit
$env:TEST_BASE_URL = 'http://localhost:3100'
$env:TEST_ORIGINS = 'http://localhost:3100,http://192.168.1.29:3100'
$env:BROWSER_DEBUG_URL = 'http://127.0.0.1:9333'
npm run test:production
```

Sesuaikan IP dengan interface aktif. Contoh server port terpisah: `npm run start -- --port 3100 --hostname 0.0.0.0`. Runner menyimpan log/status per skrip di `artifacts/production-readiness/`; exit nonzero berarti ada gate yang gagal, termasuk temuan yang sengaja belum diperbaiki. `npm run test:recovery` memakai komponen error aktual dalam harness React terisolasi dengan adapter router, bukan injeksi kegagalan hosting. Skrip fixture gallery/gambar dijalankan terpisah pada development; jangan menjalankan build selama fixture terpasang.

`npm run start` memakai hasil build, bukan deployment. Tidak ada secret atau akun layanan eksternal yang diperlukan. `.env.example` berisi `NEXT_TELEMETRY_DISABLED=1` untuk menonaktifkan telemetry bawaan Next.js; gunakan nilai ini juga pada environment CI/hosting. Audit membuat `.env.local` terabaikan dengan nilai yang sama; konfigurasi telemetry global pengguna tidak diubah. Plus Jakarta Sans dan Inter memakai next/font/google: font diunduh saat build, lalu disajikan lokal ke pengunjung. Build pertama memerlukan akses Google Fonts. CSS menyediakan fallback sistem.

Dengan server production lokal berjalan, jalankan `node scripts/verify-routes.mjs` di terminal kedua untuk menguji 30 respons HTTP, metadata, atribut bahasa, dan tautan perpindahan bahasa. Ini belum menggantikan pengujian interaksi browser atau inspeksi tampilan pada perangkat nyata.

## Routing dan konten

- `/id` dan `/en`: homepage dengan delapan section, termasuk cinematic, dan konten bilingual.
- `/destinations`, `/destinations/[slug]`, `/gallery`, `/packages`, `/packages/[slug]`, dan `/about` memiliki halaman khusus. `/booking`, `/contact`, `/faq`, `/privacy`, dan `/terms` tetap placeholder tanpa backend.
- Bahasa tidak ditebak dari browser; fallback awal selalu `id`. Locale yang tidak didukung dan slug yang tidak dikenal menghasilkan 404, bukan pengalihan diam-diam.
- Pemilih bahasa mempertahankan slug serta query filter dikenal untuk paket/destinasi/galeri dan konteks paket inquiry. Hash tidak dipertahankan.
- Kamus terjemahan: `src/i18n/dictionaries.ts`. Tipe kamus memastikan kedua bahasa memiliki key yang sama.
- Kamus homepage dan navigasi Phase 2: `src/i18n/home.ts`. Gambar konsep lokal: `public/images/placeholders` (bukan foto lokasi).
- Hero memakai carousel tiga slide: konten ID/EN di `src/i18n/hero.ts`, konfigurasi gambar/link/focal point di `src/data/hero-slides.ts`. Petunjuk foto: `public/images/hero/README.md`. Saat ini seluruh foto `null`, sehingga gradient placeholder ditampilkan tanpa request gambar yang hilang.
- Identitas bisnis: `src/lib/business.ts`. Nilai `null` berarti belum diberikan pemilik bisnis; jangan diisi dengan data rekaan.
- Metadata menggunakan Metadata API. Semua halaman masih `noindex, nofollow` karena konten sementara. Canonical, sitemap XML, dan domain produksi ditambahkan setelah domain dan konten disetujui.

## Struktur

```text
src/
  app/
    [locale]/
      [slug]/page.tsx
      layout.tsx
      not-found.tsx
      page.tsx
    global-not-found.tsx
  components/layout/
  components/home/
  components/ui/
  components/destinations/
  components/packages/
  i18n/
  lib/
  styles/
  proxy.ts
docs/
scripts/verify-routes.mjs
scripts/verify-browser.mjs
public/images/placeholders/
```

Data lokal bertipe berada di `src/data`, model di `src/types`; tidak ada backend. Halaman placeholder berbagi satu route, sementara About, paket, destinasi dan galeri memiliki route fitur khusus.

Fallback error route berada di `src/app/[locale]/error.tsx`, fallback root di `src/app/global-error.tsx`, dan pesan di `src/i18n/errors.ts`. Keduanya memakai pesan umum tanpa detail exception. `next.config.ts` menambahkan `nosniff` dan `strict-origin-when-cross-origin`; belum mengaktifkan CSP/HSTS. Favicon kosong secara eksplisit mencegah request 404 sampai ikon resmi disetujui. Tidak ada layanan monitoring atau telemetry baru yang diaktifkan.

Fallback framework untuk error file statis berada di `src/pages/_error.tsx` dan `src/pages/404.tsx`, memakai komponen standar Next agar status 416 tidak berubah menjadi 500. Halaman bisnis tetap App Router dan aturan locale/404 proxy dipertahankan. `src/lib/video-range.ts` hanya menormalkan GET suffix di atas ukuran file pada URL H.264 aktif; streaming/cache/range lainnya tetap Next.

## Verifikasi browser opsional

`scripts/verify-browser.mjs` memakai Chrome/Edge yang sudah terpasang dengan Chrome DevTools Protocol, tanpa dependency npm tambahan. Jalankan browser headless terpisah dengan remote debugging hanya pada loopback port 9222 serta profil khusus `C:\AnggunAR\.browser-profile`; jangan gunakan profil pribadi. Setelah server production lokal aktif, jalankan `node scripts/verify-browser.mjs`. Override `BROWSER_DEBUG_URL`/`TEST_BASE_URL` bila port berbeda. Screenshot dan laporan JSON ditulis ke `artifacts/phase2/`, diabaikan Git. Hentikan browser pengujian setelah selesai. Script tidak mengunduh atau memasang browser.

Lihat `PROJECT.md`, `docs/ARCHITECTURE.md`, `docs/ROADMAP.md`, dan `docs/SITEMAP.md`. Hasil validasi lokal dicatat di `docs/VALIDATION.md`.

## Catatan Git pada environment awal

Repository diinisialisasi oleh akun sandbox Windows. Jika akun Windows Anda mendapat pesan `detected dubious ownership`, gunakan pengecualian khusus satu perintah: `git -c safe.directory=C:/AnggunAR status`. Konfigurasi Git global tidak diubah oleh proyek ini. Baseline Phase 1/2 disimpan sebagai initial commit `bd950f8` sebelum refinement hero. Tidak ada push. Perubahan carousel dibiarkan di working tree untuk ditinjau.

## About Us

Buka http://localhost:3000/id/about atau http://localhost:3000/en/about. Halaman menggunakan route khusus, delapan section, konten resmi dari brief pemilik, dan dictionary `src/i18n/about.ts`. Konfigurasi visual terpisah: `src/data/about-visual.ts`; cara mengganti foto tersedia di `public/images/about/README.md`.

Dengan server production dan Chrome CDP lokal aktif, jalankan `node scripts/verify-about-browser.mjs` untuk memeriksa kedua bahasa pada tujuh ukuran viewport, urutan section, misi/nilai, metadata, CTA, keyboard, dan language switcher. Screenshot/laporan berada di `artifacts/about`, diabaikan Git.

## Hero carousel

Navigasi Previous/Next, indikator, dan Pause/Play tersedia di bawah hero. Arrow Left/Right bekerja ketika fokus berada di carousel. Autoplay 7 detik berhenti selama hover, fokus, tab tidak aktif, pilihan Pause, atau reduced motion. Play mengaktifkan kembali izin autoplay; timer baru berjalan setelah hover/fokus meninggalkan carousel. Reduced motion selalu menonaktifkan autoplay dan fade, sementara navigasi manual tetap tersedia.

Dengan server production dan browser CDP lokal aktif, jalankan `node scripts/verify-hero-browser.mjs` untuk layout, kontrol, autoplay real-time, pause, reduced motion, dan cleanup. Script memerlukan sekitar satu menit untuk menunggu interval nyata; `--layout-only` hanya memeriksa tiga slide pada tujuh ukuran viewport. Screenshot/laporan disimpan di `artifacts/hero` dan diabaikan Git. Test visibility memakai state/event simulasi; tidak menggantikan pengujian tab fisik atau perangkat nyata.
