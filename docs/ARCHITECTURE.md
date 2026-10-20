# Arsitektur

## Phase 3 — katalog dan itinerary (20 Oktober 2026)

Route khusus `src/app/[locale]/packages/page.tsx` membaca query GET di server; detail `packages/[slug]/page.tsx` memvalidasi locale dan paket lewat `getPackage`, lalu memanggil `notFound()` jika tidak tersedia. Proxy hanya membuka kedalaman tiga segmen untuk slug paket terdaftar dan status yang diizinkan; pola route lain tetap ditolak. Placeholder mengecualikan packages dari static params. Halaman placeholder membaca identitas paket hanya untuk booking dan tidak mengumpulkan data.

`src/types/tour-package.ts` memisahkan identitas/status/demo, harga, durasi, lokasi/kategori, tuple tiga gambar, konten bilingual, itinerary, included/excluded, dan informasi terkonfirmasi. `src/data/tour-packages.ts` adalah sumber tunggal; demo tetap draft tanpa harga/aktivitas/fasilitas rekaan. `src/lib/tour-packages.ts` dibatasi server-only, menyediakan publikasi, preview, pencarian/filter, format harga dan pemeriksaan keberadaan aset. `src/i18n/packages.ts` memuat UI bilingual.

`TourPackageCard`, `PackagePhoto`, dan `PackageFilters` merupakan Server Components reusable. Detail mengomposisikan galeri, overview, timeline hari, fasilitas, informasi dan panel inquiry. Galeri memakai Next Image hanya saat file lokal tersedia, aspect ratio tetap, focal point per slot, dan placeholder untuk file hilang. Tidak ada host gambar eksternal atau dependency tambahan.

Preview memerlukan `NODE_ENV === "development"` dan `preview=draft`, diperiksa di proxy serta lapisan data server; produksi hanya mengizinkan published yang bukan demo. Foto public tidak dilindungi status draft. Homepage mengambil paket dari sumber sama tanpa preview dan menampilkan empty state/CTA ketika belum ada paket resmi. Hero dan About tidak berubah.

LanguageSwitcher memakai useSearchParams dalam Suspense agar query-only navigation diikuti tanpa mengubah layout; membawa whitelist filter/preview atau identitas paket inquiry. Slug tetap sama pada dua bahasa. Filter GET bisa digunakan tanpa JS. Metadata katalog/detail bilingual; noindex tetap, domain null sehingga canonical/hreflang produksi belum dibuat. Panduan editor: `docs/TOUR_PACKAGES.md`.

Bagian fondasi berikut mencatat arsitektur fase terdahulu; placeholder paket dan pembatasan semua URL bertingkat telah digantikan oleh bagian Phase 3 ini.

## Stack dan pembagian tanggung jawab

Next.js App Router merender halaman menggunakan React Server Components. Pemilih bahasa dan navigasi utama menjadi Client Components karena membaca pathname dan menangani disclosure mobile. Setelah refinement, hanya HeroCarousel dan subkomponennya berada pada client boundary untuk timer/interaksi; wrapper HeroSection serta enam section lain tetap Server Components. TypeScript memakai mode strict. Tailwind CSS melalui plugin PostCSS, dan Lucide menyediakan ikon dekoratif dengan `aria-hidden`.

- `src/app/[locale]/layout.tsx`: validasi locale, atribut HTML `lang`, metadata global, skip link, header, footer.
- `src/app/[locale]/page.tsx`: komposisi tujuh section homepage Phase 2 dan metadata terjemahan.
- `src/app/[locale]/[slug]/page.tsx`: placeholder bersama untuk slug yang diizinkan. Slug lain memanggil `notFound()`. Daftar route tersedia dibangkitkan lewat `generateStaticParams`.
- `src/components/layout`: komponen layout dan pemilih bahasa.
- `src/components/home`: HeroSection, IntroductionSection, FeaturedDestinations, PopularPackages, WhyChooseUs, TravelInspiration, FinalCTA, dan TravelVisual.
- `src/components/ui`: Container, SectionHeading, ButtonLink; tidak memerlukan library UI tambahan.
- `src/components/destinations` dan `src/components/packages`: kartu presentasi reusable. Kartu tidak menyiratkan halaman detail atau ketersediaan booking.
- `src/i18n/config.ts`: tipe locale, whitelist, dan default locale.
- `src/i18n/dictionaries.ts`: kamus bertipe yang sama untuk Indonesia/Inggris dan whitelist halaman.
- `src/i18n/home.ts`: kamus homepage/navigation bertipe untuk kedua locale; dipisahkan agar dictionary Phase 1 tidak menjadi terlalu besar.
- `src/lib/business.ts`: identitas bisnis terpusat dengan nilai kosong untuk data belum dikonfirmasi.
- `src/styles/globals.css`: design tokens melalui Tailwind v4 @theme, font variables, container bersama yang tetap kompatibel dengan placeholder, section spacing responsif, focus ring, dan prefers-reduced-motion.
- `src/proxy.ts`: redirect `/` ke `/id` (307, query dipertahankan); validasi locale, whitelist slug, dan kedalaman URL sebelum render. URL tidak tersedia menerima HTML 404 bilingual dengan tautan pemulihan, sehingga respons bukan streamed soft-404. Validasi memakai daftar slug yang sama dengan route; ketika menambah fitur detail, perluas validasi proxy. Aset framework dikecualikan dari matcher.

Locale valid diperiksa kembali di server pada layout dan halaman. `not-found.tsx` menyediakan tautan pemulihan bilingual. Global not-found menangani URL yang tidak cocok dengan route mana pun; opsi Next.js `experimental.globalNotFound` dibutuhkan karena root layout berada pada segmen locale. Fitur ini harus diperiksa kembali saat upgrade Next.js.

## Aturan multilingual

URL menggunakan slug bahasa Inggris yang sama untuk kedua locale, sedangkan konten memakai kamus sesuai locale. Fallback hanya berlaku untuk `/`: menuju `/id`. URL dengan locale tidak dikenal tidak diubah menjadi konten Indonesia secara diam-diam. Key terjemahan wajib lengkap; bukan fallback campuran bahasa. Pemilih bahasa mengganti prefix dan mempertahankan slug, tanpa menduplikasi komponen.

## SEO dan data

Metadata API menyediakan judul dan deskripsi terjemahan. Situs masih ditandai noindex karena informasi resmi belum lengkap. Domain belum ditentukan sehingga canonical/alternate absolut dan sitemap XML belum dibuat. Tidak ada fetch API bisnis eksternal, form submission, atau penyimpanan data pelanggan. Link WhatsApp dan peta menunggu konfigurasi resmi.

Plus Jakarta Sans dan Inter menggunakan `next/font/google` pada layout locale, `display: swap`, subsets latin, dan font fallback sistem pada CSS. Next mengunduh font saat build dan menyajikannya lokal saat runtime. Build memerlukan jaringan pada pengambilan pertama; jika pengambilan gagal, gunakan fallback sistem atau next/font/local dengan aset berlisensi resmi, laporkan perubahan, dan pastikan build lulus.

TravelVisual menggunakan next/image untuk SVG lokal dengan alt kosong karena ilustrasi dekoratif; label placeholder tetap terlihat dan teks destinasi ada di sekitar gambar. Hero diberi prioritas; gambar lain lazy-loaded secara default. Rasio aspek membatasi pergeseran layout. SVG ini bukan foto atau peta lokasi. Tidak ada remote image host atau perubahan konfigurasi Next.js.

Catatan refinement: TravelVisual tidak lagi dipakai pada hero. Carousel memakai konfigurasi foto terpisah berikut; TravelVisual pada section lain dipertahankan.

## Hero carousel

- `src/components/home/hero-section.tsx`: wrapper server yang memilih dictionary locale.
- `hero-carousel.tsx`: client boundary, indeks aktif, izin autoplay, pause hover/focus/visibility/reduced motion, dan state kegagalan gambar.
- `hero-slide.tsx`: teks/CTA/foto/gradient. Slide nonaktif memakai inert, aria-hidden, dan pointer-events none. Hanya slide aktif menggunakan h1; judul slide lain h2 yang tersembunyi dari accessibility tree.
- `hero-controls.tsx`: tombol native Previous/Next/Pause/Play serta indikator dengan aria-current dan aria-controls. Arrow Left/Right ditangani di region carousel.
- `hero-carousel.module.css`: seluruh styling hero di-scope pada CSS module. Grid menempatkan slide pada sel yang sama sambil tetap menghitung tinggi konten tertinggi, sehingga indeks aktif tidak menggeser konten di bawah. Lebar full viewport content area, tinggi desktop minimum 36rem dengan target 78svh dan batas minimum target/maksimum target melalui clamp; konten tetap dapat tumbuh agar tidak terpotong pada zoom atau viewport pendek.
- `src/data/hero-slides.ts`: stable ID, href, image.src null/lokal, focal point desktop/mobile, jenis fallback, dan interval 7000ms.
- `src/i18n/hero.ts`: dictionary bertipe untuk tiga slide, kontrol, fallback label, dan imageAlt terjemahan.

Satu setTimeout dibuat hanya ketika enabled, visible, tanpa hover/fokus, dan tanpa reduced motion. Effect membersihkan timeout pada perubahan state/slide/unmount. Effect kedua memasang dan membersihkan listener matchMedia serta visibilitychange. Pengaktifan Play tidak mengalahkan pause karena hover/fokus atau reduced motion. Status live region off selama autoplay dan polite saat navigasi manual; fokus tetap pada kontrol yang diaktifkan.

State awal SSR/hydration konsisten: slide pertama, visible false, dan reducedMotion true sampai browser membaca preferensi. Tidak ada akses window saat render server. Foto memakai next/image, sizes 100vw, object-cover dan focal point melalui CSS variables. Prioritas hanya indeks pertama; slide lain lazy-loaded. Foto error dikembalikan ke gradient. Path null tidak menghasilkan elemen gambar atau request kosong. Cara mengganti aset ada di `public/images/hero/README.md`.

## Interaksi dan aksesibilitas

Disclosure mobile memakai elemen details/summary, sehingga toggle dasar tetap dapat digunakan tanpa JavaScript. Saat hydration tersedia, Escape menutup dan mengembalikan fokus, tombol tutup mengembalikan fokus, dan pemilihan link menutup panel. Ini disclosure nonmodal, sehingga tidak memakai focus trap. Active state memakai aria-current=page. LanguageSwitcher tetap mengganti prefix locale pada pathname. Menu ditampilkan di bawah breakpoint xl; tablet dan laptop 1024px menggunakan menu yang sama agar navigasi tidak terdesak.

Hero memiliki satu h1; setiap section memakai h2 dengan aria-labelledby dan kartu memakai h3. Skip link Phase 1 dipertahankan. Warna aqua menjadi aksen pada navy, bukan teks kecil di atas putih. Interaksi hanya transisi warna ringan; prefers-reduced-motion menonaktifkan smooth scroll dan transisi.

## Aset dan sumber konten

`public/images/placeholders` memuat tiga SVG yang dibuat untuk proyek, beserta catatan penggunaannya. Foto resmi belum tersedia. Deskripsi destinasi bersifat inspirasi singkat yang dirujuk dari portal wisata resmi Indonesia Travel; sumber dicatat di VALIDATION.md. Nama paket adalah konsep editorial dan ditandai jelas, bukan produk bisnis yang telah dikonfirmasi.

## About Us

- `src/app/[locale]/about/page.tsx` adalah route statis khusus dengan validasi locale dan metadata terjemahan. Route khusus lebih spesifik daripada `[slug]`; About dikecualikan dari generateStaticParams placeholder agar tidak dihasilkan dua kali. Daftar pageSlugs dan validasi proxy tidak berubah karena About sudah diizinkan sejak Phase 1.
- `src/i18n/about.ts` berisi dictionary bertipe ID/EN dengan delapan section, lima misi dan empat nilai sebagai tuple agar kelengkapan konten terjaga. Konten resmi bersumber dari brief pemilik; tidak mengarang riwayat/statistik/sertifikasi.
- `src/components/about/about-hero.tsx` menyediakan hero dan visual; `company-sections.tsx` menyediakan introduction/vision/mission; `principle-sections.tsx` menyediakan philosophy/core values/commitment/CTA. Pengelompokan menghindari terlalu banyak file untuk section sederhana.
- Container, SectionHeading, ButtonLink, tokens warna, spacing, tipografi next/font, layout, dan reduced-motion global digunakan kembali. Seluruh About memakai Server Components; tidak ada JavaScript interaksi baru untuk efek visual.
- `about.module.css` hanya mengatur visual pesisir CSS serta aksen lingkaran filosofi. Width eksplisit visual menghindari pertumbuhan aspect ratio pada mobile; CSS di-scope supaya tidak memengaruhi carousel atau halaman lain.
- `src/data/about-visual.ts` mengatur path lokal foto, alt ID/EN dan object-position. Saat src null, visual berlabel digunakan tanpa request gambar. Next Image dipakai ketika foto disediakan. Panduan aset ada di `public/images/about/README.md`.

Halaman memiliki satu h1, tujuh judul section h2, h3 untuk item misi/nilai, ordered list untuk misi, dan internal links ke packages/contact sesuai locale. Ikon nilai: ShieldCheck, BriefcaseBusiness, HeartHandshake, TrendingUp. Nilai ditampilkan sebagai prinsip dengan hover perubahan warna ringan, tanpa progress bar/statistik. Hero CSS bersifat ilustratif, bukan dokumentasi atau peta lokasi. Status noindex situs dipertahankan; domain/canonical produksi belum tersedia.

## Pengembangan berikutnya

Pisahkan route fitur saat konten dan perilakunya tersedia; jangan memperbesar placeholder menjadi seluruh aplikasi. Data destinasi/paket dapat dipindahkan ke `src/data` dan tipe domain ke `src/types` saat digunakan. PostgreSQL dan Prisma direncanakan di lapisan server; komponen tampilan tidak mengakses database langsung. Validasi input, autentikasi admin, upload foto dan pengelolaan inquiry harus dirancang sebelum ditambahkan. Tidak ada dependency integrasi tersebut pada Phase 1.
