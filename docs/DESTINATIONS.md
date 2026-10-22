# Destinations — pengelolaan konten

Sumber tunggal: `src/data/destinations.ts`. Tipe: `src/types/destination.ts`. Logika server: `src/lib/destinations.ts`. UI bilingual: `src/i18n/destinations.ts`. Homepage, katalog dan detail memakai objek yang sama; dictionary homepage hanya menyimpan copy section.

## Menambah destinasi

Tambahkan objek `Destination` pada array `destinations`. Gunakan `id` dan `slug` unik/stabil, huruf kecil, angka dan tanda hubung. Slug sama di ID/EN. Mulai dengan `status: "draft"`; draft tidak tampil di homepage/katalog/detail dan tidak dibuka oleh query preview paket. Jangan mengisi tiket, jam buka, fasilitas atau layanan tanpa verifikasi.

Field wajib:

- `id`, `slug`, `status: "draft" | "published"`.
- `category`: `beaches-islands`, `landmarks`, `nature`, `culture-heritage`, atau `city-attractions`.
- `location: { id: string, en: string }`: nama lokasi geografis, bukan ID locale.
- `images`: tuple tiga objek `{ src: string | null, alt: { id, en }, position: "50% 50%" }`.
- `content.id` dan `content.en`: `{ name, shortDescription, description, highlights: string[] }`.
- `relatedPackageIds: string[]`: slug paket Phase 3 yang benar-benar terkait; default `[]`.
- `sources`: array `{ title, url }` sumber resmi yang mendukung informasi yang ditulis.

Gunakan helper `photos(slug, namaID, namaEN)` untuk kerangka gambar atau tulis tuple langsung agar setiap alt/focal point dapat diatur. Isi narasi netral berdasarkan sumber; jangan menyalin artikel. Tautan sumber tampil pada detail. Periksa sumber dan terjemahan secara manual sebelum mengubah status menjadi `published`; kode hanya memeriksa published dengan daftar sumber tidak kosong, bukan membuktikan akurasi sumber. Setelah perubahan production, rebuild.

## Konten awal dan sumber

Tiga destinasi diterbitkan sebagai informasi geografis/inspirasi, bukan layanan perusahaan: Jembatan Barelang, Pantai Nongsa dan Pulau Abang. Diverifikasi 20 Oktober 2026 melalui portal resmi Kementerian Pariwisata:

- [Barelang Bridge](https://www.indonesia.travel/my/en/destination/sumatra/riau-islands/batam---barelang-bridge-architectural-icon-of-batam).
- [Pantai Nongsa](https://www.indonesia.travel/id/id/destination/sumatra/riau-islands/pantai-nongsa).
- [Abang Island](https://www.indonesia.travel/my/en/destination/sumatra/riau-islands/batam---abang-island).
- [Ikhtisar destinasi Batam](https://www.indonesia.travel/gb/en/travel-ideas/adventure/4-rekomendasi-tempat-wisata-batam-yang-unik-dan-seru).

Hanya informasi lokasi/lanskap dasar dipakai; tidak menambahkan harga tiket, transportasi, jam buka, aktivitas atau fasilitas resmi. Tidak mengambil foto dari sumber. Belum ada relasi paket resmi.

## Tiga foto destinasi

Tempatkan foto berizin dalam `public/images/destinations/[slug]/`:

1. `cover.webp` — foto utama sekaligus slot pertama, rekomendasi 1600–2000 px lebar.
2. `detail-01.webp` — foto pendukung, rekomendasi 1000–1400 px.
3. `detail-02.webp` — foto pendukung, rekomendasi 1000–1400 px.

Total selalu tiga slot, bukan cover ditambah tiga foto lain. Konfigurasi `images[0]` adalah cover; slot 1 dan 2 pendukung. Atur alt ID/EN sesuai isi foto sebenarnya dan `position` seperti `"60% 40%"`. Gambar dapat diganti tanpa menyentuh React. File hilang atau `src: null` menghasilkan fallback CSS berlabel, tanpa request broken image. File tersedia memakai Next Image dan aspect ratio tetap. Hanya path lokal WebP dalam pola tersebut yang diizinkan; periksa isi file sebelum publikasi. Tambahkan aset sebelum build/start production lalu rebuild/restart agar daftar static asset ikut diperbarui.

## Relasi paket, filter dan routing

Isi `relatedPackageIds` hanya untuk paket dengan hubungan yang telah dikonfirmasi. Identifier paket saat ini adalah slug unik, karena model Phase 3 belum memiliki ID terpisah. Detail memakai `getPackages()` sehingga draft dan demo selalu dikecualikan, termasuk bila relasinya ditulis. Tanpa paket terkait, tampil pesan dan CTA umum ke katalog/kontak.

Katalog mendukung form GET `q` dan `category`; filter mencari nama sesuai locale, tidak menerjemahkan kata kunci secara otomatis. Kelima kategori tersedia, termasuk kategori tanpa hasil dengan empty state. Language switcher mempertahankan query dikenal dan ID kategori valid. Invalid slug, draft, locale salah dan kedalaman URL ekstra menerima 404 melalui proxy dan validasi server. Domain belum tersedia sehingga canonical/hreflang produksi belum ditambahkan; noindex dipertahankan.

## Pengujian

Dengan production lokal berjalan: `node scripts/verify-destinations.mjs`. Set `TEST_BASE_URL` bila port berbeda. Browser CDP lokal: `node scripts/verify-destinations-browser.mjs`, dengan `BROWSER_DEBUG_URL` sesuai browser headless. Artefak berada di `artifacts/phase4/`, diabaikan Git. Pengujian mengasumsikan tiga destinasi awal; sesuaikan ekspektasi setelah menambah konten resmi.
