# Anggun AR Sukses Abadi

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

`npm run start` memakai hasil build, bukan deployment. Tidak ada environment variable atau akun layanan eksternal yang diperlukan. Plus Jakarta Sans dan Inter memakai next/font/google: font diunduh saat build, lalu disajikan lokal ke pengunjung. Build pertama memerlukan akses Google Fonts. CSS menyediakan fallback sistem.

Dengan server production lokal berjalan, jalankan `node scripts/verify-routes.mjs` di terminal kedua untuk menguji 30 respons HTTP, metadata, atribut bahasa, dan tautan perpindahan bahasa. Ini belum menggantikan pengujian interaksi browser atau inspeksi tampilan pada perangkat nyata.

## Routing dan konten

- `/id` dan `/en`: homepage Phase 2 dengan tujuh section dan konten bilingual.
- Tambahkan `/destinations`, `/packages`, `/gallery`, `/booking`, `/about`, `/contact`, `/faq`, `/privacy`, atau `/terms` setelah locale untuk halaman placeholder.
- Bahasa tidak ditebak dari browser; fallback awal selalu `id`. Locale yang tidak didukung dan slug yang tidak dikenal menghasilkan 404, bukan pengalihan diam-diam.
- Pemilih bahasa mempertahankan slug halaman. Query dan hash tidak dipertahankan; Phase 1 belum menggunakan keduanya untuk konten.
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

Folder data, hooks, dan backend belum dibuat karena belum digunakan. Seluruh halaman placeholder berbagi satu route bertipe untuk menghindari pengulangan; route fitur dapat dipisahkan saat memiliki perilaku khusus.

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
