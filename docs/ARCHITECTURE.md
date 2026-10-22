# Arsitektur

## Ocean Blue Luxury â€” lapisan presentasi

Refinement mempertahankan arsitektur Phase 1â€“4. `globals.css` menambah tokens secondary navy, mist, light ocean dan ocean ink serta class surface eksplisit (panel/card/filter/empty). Tokens dasar dan font tetap. Tidak menambah dependency, client boundary, data store, URL, router, proxy atau business logic.

`src/components/ui/empty-state.tsx` adalah Server Component presentasional reusable untuk katalog/Gallery: ikon dekoratif, judul, deskripsi dan children CTA dari dictionary existing. ButtonLink dan SectionHeading tetap server. Footer navy dan alternating section light/mist/navy menggunakan teks berkontras, bukan mengganti seluruh bg-white secara global. PhotoGallery hanya berubah class pada figure/caption; state, efek, handler dan keyboard tetap identik.

Listing Gallery/destinasi/paket memakai satu wrapper DOM untuk hero dan konten. Ini memperbaiki sasaran scroll fragment saat pergantian locale yang sebelumnya dapat menuju section kedua dan melewati heading. Perilaku URL/query, locale, route resolution dan validasi keamanan tetap di lapisan yang sama. Tidak ada handler scroll baru atau perubahan LanguageSwitcher.

Seluruh file hero carousel dan data/dictionary-nya dipertahankan byte-identik. Styling homepage menyentuh enam section lain. About mempertahankan konten resmi; Contact/booking/legal tetap placeholder tanpa form. Spesifikasi dan panduan validasi ada di `OCEAN_BLUE_LUXURY.md`.

## Phase 4 â€” Destinations & Gallery

Route khusus `destinations/page.tsx`, `destinations/[slug]/page.tsx` dan `gallery/page.tsx` berada di bawah locale. Placeholder mengecualikan keempat fitur khusus (About, packages, destinations, gallery). Proxy tetap whitelist ketat dan menambahkan pola tiga segmen hanya untuk detail destinasi published dengan sumber. Layout/halaman tetap memvalidasi locale; detail memanggil notFound saat tidak tersedia. Preview draft paket tidak membuka draft destinasi.

`src/types/destination.ts` memuat ID/slug, kategori, lokasi, status, tuple tiga foto dengan cover pada indeks 0, konten ID/EN, highlights, relasi paket dan sumber. `src/data/destinations.ts` adalah sumber tunggal homepage/katalog/detail. `src/lib/destinations.ts` server-only menangani publikasi, filter dan relasi paket memakai getPackages yang mempertahankan isolasi draft/demo. Tidak menambahkan relasi berdasarkan tebakan lokasi.

`src/types/gallery.ts` dan `src/data/gallery.ts` memisahkan foto, kategori, status, caption, alt/focal point dan catatan izin. `src/lib/gallery.ts` hanya mengirim foto published dengan izin terisi serta file yang ada. Dataset kosong sampai pemilik menyediakan foto. `src/lib/local-photos.ts` membatasi path WebP lokal destinasi/galeri dan memeriksa keberadaan file di server. `LocalPhoto` memakai Next Image ketika tersedia, aspect ratio tetap dan fallback CSS saat kosong/hilang. Komponen PackagePhoto/logic Phase 3 tidak diubah.

`EditorialHero` memakai tokens proyek dan ilustrasi CSS pesisir. DestinationCard/Filters dan route baru adalah Server Components. Hanya `PhotoGallery` menjadi client boundary: thumbnail lazy/responsive, satu foto besar ketika dipilih, native modal dialog, focus awal ke Close, Tab/Shift+Tab containment, keyboard panah/Escape, counter live, restore focus dan body overflow saat tutup/unmount. Error foto galeri menghasilkan fallback teks. Daftar foto berubah karena filter me-remount galeri agar state dialog tidak merujuk foto lama.

Dictionary modular ada di `src/i18n/destinations.ts` dan `gallery.ts`. Filter GET berfungsi tanpa JS. LanguageSwitcher membawa q/category destinasi dan category galeri, memvalidasi ID kategori terhadap daftar bertipe; perilaku query paket tetap. Metadata bilingual/dinamis mengikuti Metadata API, robots noindex tetap; domain null sehingga canonical/hreflang produksi belum dibuat. Gallery filter hanya menampilkan kategori yang memiliki foto lolos pemeriksaan server.

Tidak ada perubahan technology stack, dependency baru, layanan eksternal, storage backend, autentikasi atau pengumpulan data. Panduan editor dan validasi fixture ada di `DESTINATIONS.md` dan `GALLERY.md`. Deskripsi arsitektur fase sebelumnya di bawah merupakan catatan historis.

## Phase 3 â€” katalog dan itinerary (20 Oktober 2026)

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
- Kontrol visual Hero tidak lagi dirender. `hero-controls.tsx` adalah komponen lama yang tidak dipanggil carousel. Region carousel fokusable menyediakan Arrow Left/Right, Home/End, dan Space untuk pause/resume; instruksi bilingual khusus screen reader. Pointer Events mendukung swipe/drag, wheel horizontal mendukung touchpad. Gesture dimulai pada CTA diabaikan, dan `touch-action: pan-y pinch-zoom` mempertahankan scroll vertikal serta pinch zoom.
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

## Homepage Cinematic Video — 20 Oktober 2026

Homepage sekarang memiliki delapan section: Hero Carousel, Introduction, Featured Destinations, Cinematic Video, Popular Packages, Why Choose Us, Travel Inspiration, Final CTA. Penambahan hanya menyisipkan komponen baru setelah Featured Destinations; tiga kartu destinasi tetap identik dengan baseline sebelum perubahan.

Konfigurasi aset ada di `src/data/home-video.ts`, terjemahan ID/EN di `src/i18n/home-video.ts`, dan pemeriksaan keberadaan media server-only di `src/lib/home-video.ts`. `cinematic-section.tsx` tetap Server Component; interaksi dibatasi pada `cinematic-video.tsx` dan controller `src/lib/cinematic-playback.ts`. CSS module mengisolasi styling. Tidak ada perubahan routing, proxy, data bisnis, atau dependency.

Sumber video dipasang saat terlihat dan playback diizinkan; preload none, muted, loop, playsInline. IntersectionObserver, Page Visibility, reduced motion dan pilihan Pause manual mengendalikan lifecycle. Poster Next Image atau fallback CSS tetap tersedia; berkas yang tidak ada tidak menghasilkan request broken media. Homepage statis harus di-build ulang setelah memasukkan aset. Panduan lengkap: `docs/HOME_VIDEO.md`.

## Aset cinematic dan origin development — perbaikan 20 Oktober 2026

Path MP4 resmi `/videos/home/batam-cinematic.mp4` dikecualikan secara exact dari matcher proxy atas persetujuan khusus pemilik. Sebelumnya server mendeteksi berkas, tetapi request publik menerima HTML 404 dari validasi locale. Semua URL halaman, validasi locale, 404 dan isolasi draft tetap menggunakan business logic proxy yang sama. Tidak ada route API, rewrite, atau perubahan controller video.

`allowedDevOrigins` pada next.config.ts hanya berisi host LAN development `192.168.88.189`. Origin tersebut sebelumnya ditolak oleh pemeriksaan Next.js untuk HMR; sesudah perubahan handshake WebSocket menghasilkan 101. Perlindungan origin tetap aktif tanpa wildcard. Video sudah dapat diputar di localhost meskipun HMR LAN sebelumnya gagal, sehingga keduanya dipastikan merupakan masalah terpisah.

Homepage tetap Hero Carousel ? Cinematic ? Introduction ? Featured Destinations ? Popular Packages ? Why Choose Us ? Travel Inspiration ? Final CTA. Panduan aset dan browser test asli: docs/HOME_VIDEO.md.

## Background cinematic tanpa kontrol — 20 Oktober 2026

Permintaan terbaru mengganti mode player menjadi video dekoratif. CinematicSection mempertahankan lokasi tepat setelah Hero Carousel; di dalam frame, video/poster/fallback berada di bawah overlay navy transparan 70% dan konten teks bilingual di atasnya. Semua teks utama dipertahankan. Komponen client tidak menerima dictionary player, tidak membuat tombol/status interaksi, dan video disembunyikan dari accessibility tree dengan aria-hidden serta tabIndex -1. Logika controller hanya otomatis dan cleanup; tidak ada API play/pause manual. Reduced motion atau penolakan autoplay menampilkan lapisan statis tanpa kontrol. Frame desktop mengikuti 16:9 dengan tinggi minimum 20rem untuk keterbacaan teks di mobile. File MP4 asli, proxy/origin config, homepage, hero dan section lain tetap dipertahankan. Panduan terbaru: docs/HOME_VIDEO.md.

## Full-width cinematic — 20 Oktober 2026

Container yang sebelumnya membungkus media menyebabkan gutter kiri/kanan; border 1px, radius dan shadow frame memperjelas batasnya. Section kini sekaligus menjadi data-cinematic-frame dengan width 100%, position relative dan overflow hidden. Background media dan overlay absolut memakai inset 0 dan ukuran yang identik. Container berada di lapisan konten saja, sehingga heading/deskripsi sejajar navbar tanpa membatasi background. Tidak ada perubahan global, negative margin, wrapper 100vw, controller, data, proxy atau route. Tinggi minimum responsif clamp(24rem,48vw,48rem) dengan konten dalam normal flow menjaga crop cover dan keterbacaan mobile. Border hanya atas/bawah.

## Ketahanan lifecycle video dan diagnosis origin — 20 Oktober 2026

Audit browser bersih sebelum perbaikan memutar MP4 baru 18.892.571 byte pada localhost dan LAN dengan readyState 4, error null, networkState idle, opacity 1, currentTime bertambah, serta Content-Type video/mp4/HTTP 206/range/ETag yang identik. Localhost secure context dan HTTP LAN non-secure context tidak menimbulkan penolakan autoplay pada Chrome uji. Source tetap URL relatif. Tidak ada bukti stale cache, ukuran/codec, media detection atau CSS sebagai penyebab kegagalan khusus sesi pemilik. Tidak mengubah resolver, URL media, cache headers, next config, proxy, route atau desain.

Dua cacat lifecycle dibuktikan pada controller lama: (1) promise controller yang sudah disposed masih dapat memanggil pause pada elemen yang kini dimiliki controller baru; unit regression gagal pada salinan kode lama; (2) seluruh rejection play(), termasuk AbortError akibat interupsi loading, dikategorikan sebagai blokir autoplay permanen. Reproduksi browser dengan native play() lalu native load() pada MP4 asli menghasilkan AbortError, readyState 4, error null, paused true, currentTime 0 dan opacity 0 pada LAN. Sesudah perbaikan dengan reproduksi yang sama, paused false, currentTime sekitar 4,871 detik dan opacity 1. Ini reproduksi interupsi terkontrol, bukan klaim bahwa error pada sesi pribadi pemilik sudah tertangkap secara langsung.

Perubahan aplikasi hanya src/lib/cinematic-playback.ts: guard disposed pada callback/event; klasifikasi NotAllowedError tetap menjadi fallback tanpa retry; AbortError dapat pulih maksimal satu kali melalui kesiapan media/canplay; interupsi berulang kembali fallback; recovery tetap mengikuti viewport, reduced motion dan tab visibility. Tidak ada timer retry atau polling aplikasi. Handler readiness dibersihkan pada destroy. Diagnostik event terakhir hanya pada development disimpan di video.dataset.cinematicDiagnostic (status, error name, jumlah recovery, readiness, visibility, source publik), tanpa UI/kontrol/log berulang. Production tidak mengekspos atribut tersebut. Unit tests memverifikasi stale promise/observer, recovery offscreen/reduced motion, satu retry maksimum dan policy denial.

Test tambahan scripts/verify-home-video-lifecycle-browser.mjs memeriksa browser Chrome CDP pada kedua origin ID/EN dan 390/1440px: direct load, reload sesudah load event, client remount, history back/forward, language switch, cache on/off, slow network 512KB/s+150ms, controlled native interruption. currentTime DAN totalVideoFrames harus bertambah, video opacity/display/visibility benar, metadata/HTTP/network/console disimpan. Laporan development artifacts/home-video-lifecycle/after-results.json berisi 54 pemeriksaan playback yang lulus. Satu ERR_CACHE_OPERATION_NOT_SUPPORTED dicatat ketika CDP mengganti mode cache byte-range; browser pulih dan setiap skenario tetap merender frame bergerak. Peristiwa tersebut disimpan, tidak dinyatakan sebagai bukti stale cache pada sesi pemilik.

Lihat docs/HOME_VIDEO.md untuk cara membaca snapshot pada sesi yang masih gagal. Seluruh source/aset selain controller identik dengan baseline, termasuk MP4 baru, komponen/CSS video, hero, section homepage lain, data dan proxy. [HMR] connected sendiri merupakan status normal; handshake development berhasil 101 dan tidak ada error HMR pada matrix akhir. Tidak ada dependency, commit, push atau deployment.


### Penyederhanaan kontrol Hero

Hanya `hero-carousel.tsx`, CSS module Hero dan instruksi dictionary Hero yang diperbarui. Semua konfigurasi slide, judul/deskripsi/CTA, foto/fallback, durasi autoplay 7000ms dan transisi 700ms dipertahankan. Padding bawah khusus kontrol dihapus; tinggi minimum sinematik Hero tetap. Pointer horizontal intent >10px memilih drag, ambang navigasi 48px dengan dominasi horizontal 1.25?; arah vertikal membatalkan gesture tanpa preventDefault. Transfer implicit touch capture dari child ke section tidak dianggap pembatalan oleh event lostpointercapture child yang bubbling. Wheel horizontal dikonsumsi hanya jika dominan, akumulasi 60px dan satu perpindahan per burst (jeda 250ms memulai burst baru), Ctrl+wheel dan wheel vertikal dibiarkan native. Semua event listener wheel dibersihkan saat unmount. Tidak ada dependency baru atau perubahan Cinematic Video/routing/data bisnis.
