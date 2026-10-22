# Ocean Blue Luxury — UI/UX refinement

Scope disetujui pemilik: penyempurnaan presentasi seluruh halaman ID/EN Phase 1–4. Tidak mengubah konten bisnis, data, status publikasi, relasi, routing, proxy, query/filter, keamanan preview, mekanisme carousel atau lightbox. Tidak ada dependency baru, commit, push, deployment atau Phase 5.

## Design system

Tokens navy `#102A43`, ocean `#087F8C`, aqua `#24B8B0`, font Inter dan Plus Jakarta Sans dipertahankan agar perubahan tidak merambat ke hero carousel. Tokens tambahan: secondary navy `#173D59`, mist `#E8F3F6`, light ocean `#F5FAFB`, dan ocean ink `#066575`. Ocean tetap untuk tombol dengan teks putih; ink untuk teks/link kecil pada mist. Aqua menjadi aksen dekoratif atau dipakai pada navy.

Class presentasi eksplisit di `globals.css`:

- `ocean-mist`, `ocean-light`, `ocean-secondary`: pemisahan section.
- `ocean-panel`, `ocean-card`, `ocean-filter`: permukaan putih, border blue-gray, radius 1rem dan shadow ringan. Filter memiliki aksen teal di atas.
- `ocean-dark-copy`: heading/teks/eyebrow yang berkontras pada section navy.
- `ocean-hero-content`, `ocean-detail-heading`, `ocean-source`: ritme hero/detail dan batas section.
- `ocean-empty`: lebar terbatas untuk empty state; `EmptyState` menggunakan icon dekoratif, bidang secondary navy dan permukaan konten putih.

Tidak ada override yang mengubah seluruh elemen bg-white menjadi gelap. Section gelap dipakai selektif: hero, visi/About CTA, Why Choose Us, final CTA dan footer. Konten utama tetap terang dan kartu putih. Transisi mengikuti reduced motion yang sudah ada.

## Penerapan per halaman

- Navbar: struktur/interaksi sama, pemisahan border dan shadow ringan. Footer: deep navy, teks putih/blue-white dengan kontras terbaca.
- Gallery: hero dengan spacing responsif, konten mist, empty state lebih terukur, filter/kartu galeri memakai surface bersama. Tidak menambahkan foto atau klaim dokumentasi pelanggan.
- Destinations: mist pada katalog, filter/kartu putih, detail terang dengan overview putih, highlights secondary navy, frame galeri dan area related/CTA terstruktur.
- Tour Packages: hero navy solid, filter/kartu putih pada mist, empty state bersama, detail berpanel dan inquiry dengan aksen teal. Semua kondisi draft/published/inquiry dipertahankan.
- About: introduction dan misi sebagai komposisi editorial di atas light ocean; visi secondary navy, filosofi mist, values kartu putih, commitment dan CTA dipisahkan secara visual. Konten resmi tidak berubah.
- Homepage: alternating light/mist/navy dan white card surfaces. Seluruh file hero/carousel dan konfigurasi/dictionary-nya tetap identik. Gambar/teks tidak diganti.
- Contact, booking, FAQ, privacy dan terms: hanya konten placeholder yang ada disusun menjadi panel dua bidang navy/putih; tanpa form atau integrasi baru.

## Heading Gallery setelah navigasi

Pengujian direct-load saja tidak cukup. Baseline menunjukkan heading Gallery dapat berada di atas viewport setelah pergantian bahasa meskipun direct-load normal. Instrumentasi menemukan framework melakukan scrollIntoView ke section konten kedua dari root Fragment. Hero dan konten Gallery kini dikelompokkan dalam satu wrapper presentasi. Listing destinasi/paket memakai grouping yang sama. Router, URL dan language switcher tidak diubah oleh refinement ini.

Regresi harus memeriksa navigasi dari About yang telah di-scroll hingga bawah, kemudian ID→EN/EN→ID, pada mobile/desktop. Jangan memakai scrollIntoView buatan pada link navbar sticky dalam harness; ukur posisi heading relatif terhadap tepi bawah navbar setelah transisi selesai. Ini bukan alasan untuk membuat judul selalu menempel saat pengguna sengaja menggulir konten ke bawah.

## Verifikasi dan screenshot

`scripts/verify-ocean-browser.mjs` menggunakan Chrome CDP yang sudah tersedia, tanpa dependency baru. Server dev: `TEST_BASE_URL=http://localhost:3000`; `BROWSER_DEBUG_URL` mengikuti port browser khusus. `OCEAN_STAGE=before` dipakai sebelum perubahan; default after. `OCEAN_PAGES` (dipisah `|`) dan `OCEAN_WIDTHS` (dipisah koma) membatasi pemeriksaan per tahap. Tanpa override, pengujian final mencakup seluruh jenis halaman ID/EN dan detail yang tersedia termasuk preview paket development.

Artefak sebelum/sesudah: `artifacts/ocean-refinement/before/` dan `after/`. Screenshot full-page memuat gambar lazy terlebih dahulu. Kontras dihitung dari warna teks dan komposisi background hasil render; background gambar/gradient ditandai untuk tinjauan manual. Penghitungan ini melengkapi pemeriksaan keyboard/label/fokus, bukan sertifikasi WCAG menyeluruh.

Snapshot diff Phase 4 awal disimpan pada `before.patch`; 32 file data, logika, terjemahan, model, proxy, language switcher, konfigurasi dan hero dilindungi dengan SHA-256. `protection-result.json` mencatat hasil perbandingan. `gallery-before.tsx` dipakai untuk memastikan perubahan PhotoGallery hanya class presentasi. Hasil final tercatat di `VALIDATION.md`.

## Inventaris file refinement

Daftar ini hanya scope refinement, bukan seluruh status Git yang juga memuat Phase 4 belum committed. Tiga file baru pada tahap ini: EmptyState, script browser Ocean, dan panduan ini. File lain merupakan pembaruan presentasi/dokumentasi.

- `src/styles/globals.css`
- `src/components/ui/button-link.tsx`
- `src/components/ui/section-heading.tsx`
- `src/components/ui/empty-state.tsx`
- `src/components/layout/header.tsx`
- `src/components/layout/footer.tsx`
- `src/components/destinations/editorial-hero.tsx`
- `src/app/[locale]/gallery/page.tsx`
- `src/components/gallery/photo-gallery.tsx`
- `src/app/[locale]/destinations/page.tsx`
- `src/app/[locale]/destinations/[slug]/page.tsx`
- `src/components/destinations/destination-card.tsx`
- `src/components/destinations/destination-filters.tsx`
- `src/app/[locale]/packages/page.tsx`
- `src/app/[locale]/packages/[slug]/page.tsx`
- `src/components/packages/tour-package-card.tsx`
- `src/components/packages/package-filters.tsx`
- `src/components/about/about-hero.tsx`
- `src/components/about/company-sections.tsx`
- `src/components/about/principle-sections.tsx`
- `src/components/home/introduction-section.tsx`
- `src/components/home/featured-destinations.tsx`
- `src/components/home/popular-packages.tsx`
- `src/components/home/why-choose-us.tsx`
- `src/components/home/travel-inspiration.tsx`
- `src/components/home/final-cta.tsx`
- `src/app/[locale]/[slug]/page.tsx`
- `scripts/verify-ocean-browser.mjs`
- `PROJECT.md`
- `docs/ARCHITECTURE.md`
- `docs/VALIDATION.md`
- `docs/OCEAN_BLUE_LUXURY.md`
