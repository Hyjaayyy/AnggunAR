# Arsitektur

## Stack dan pembagian tanggung jawab

Next.js App Router merender halaman menggunakan React Server Components. Pemilih bahasa dan navigasi utama menjadi Client Components karena membaca pathname dan menangani disclosure mobile. Seluruh section homepage tetap Server Components. TypeScript memakai mode strict. Tailwind CSS melalui plugin PostCSS, dan Lucide menyediakan ikon dekoratif dengan `aria-hidden`.

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

## Interaksi dan aksesibilitas

Disclosure mobile memakai elemen details/summary, sehingga toggle dasar tetap dapat digunakan tanpa JavaScript. Saat hydration tersedia, Escape menutup dan mengembalikan fokus, tombol tutup mengembalikan fokus, dan pemilihan link menutup panel. Ini disclosure nonmodal, sehingga tidak memakai focus trap. Active state memakai aria-current=page. LanguageSwitcher tetap mengganti prefix locale pada pathname. Menu ditampilkan di bawah breakpoint xl; tablet dan laptop 1024px menggunakan menu yang sama agar navigasi tidak terdesak.

Hero memiliki satu h1; setiap section memakai h2 dengan aria-labelledby dan kartu memakai h3. Skip link Phase 1 dipertahankan. Warna aqua menjadi aksen pada navy, bukan teks kecil di atas putih. Interaksi hanya transisi warna ringan; prefers-reduced-motion menonaktifkan smooth scroll dan transisi.

## Aset dan sumber konten

`public/images/placeholders` memuat tiga SVG yang dibuat untuk proyek, beserta catatan penggunaannya. Foto resmi belum tersedia. Deskripsi destinasi bersifat inspirasi singkat yang dirujuk dari portal wisata resmi Indonesia Travel; sumber dicatat di VALIDATION.md. Nama paket adalah konsep editorial dan ditandai jelas, bukan produk bisnis yang telah dikonfirmasi.

## Pengembangan berikutnya

Pisahkan route fitur saat konten dan perilakunya tersedia; jangan memperbesar placeholder menjadi seluruh aplikasi. Data destinasi/paket dapat dipindahkan ke `src/data` dan tipe domain ke `src/types` saat digunakan. PostgreSQL dan Prisma direncanakan di lapisan server; komponen tampilan tidak mengakses database langsung. Validasi input, autentikasi admin, upload foto dan pengelolaan inquiry harus dirancang sebelum ditambahkan. Tidak ada dependency integrasi tersebut pada Phase 1.
