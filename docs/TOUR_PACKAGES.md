# Pengelolaan Tour Packages

Phase 3 memakai data lokal, tanpa database, form inquiry, pembayaran, atau deployment. Satu sumber data ada di `src/data/tour-packages.ts`; tipe di `src/types/tour-package.ts`. Homepage, katalog, detail, proxy, dan konteks inquiry memakai sumber yang sama.

## Menambahkan dan mengubah paket

Tambahkan objek `TourPackage` pada array ekspor `tourPackages`, setelah `...draftPackages`. Gunakan slug unik huruf kecil, angka dan tanda hubung, sama untuk ID/EN. Jangan mengubah seluruh factory `draftPackages` menjadi published: ketiga entri itu hanya contoh editorial.

Contoh kerangka berikut sengaja draft dan belum merupakan penawaran. Lengkapi dengan data resmi pemilik:

```ts
{
  slug: "paket-baru",
  status: "draft",
  demo: false,
  price: null,
  durationDays: null,
  location: null,
  category: { id: "kategori-baru", label: { id: "Kategori baru", en: "New category" } },
  images: [
    image("paket-baru", "Nama paket", "cover"),
    image("paket-baru", "Nama paket", "detail-01"),
    image("paket-baru", "Nama paket", "detail-02"),
  ],
  content: {
    id: { name: "Nama paket", description: "Deskripsi resmi menunggu konfirmasi." },
    en: { name: "Package name", description: "Official description awaiting confirmation." },
  },
  itinerary: null,
  included: null,
  excluded: null,
  information: [],
}
```

Edit objek tersebut untuk mengubah konten. Semua teks konten wajib memiliki ID/EN; teks antarmuka di `src/i18n/packages.ts`. Harga resmi berbentuk `{ amount: nilaiResmi, currency: "IDR" }`; `null` menampilkan “Hubungi untuk harga”. Durasi adalah jumlah hari positif atau null. Lokasi adalah `{ id: "id-stabil", label: { id: "Nama resmi", en: "Official name" } }` atau null. Jangan memakai null untuk mengklaim informasi tersedia.

## Itinerary, fasilitas dan informasi penting

Isi `itinerary` dengan array `{ day, title: { id, en }, activities: { id: string[], en: string[] } }` berdasarkan itinerary resmi. Nomor hari dimulai 1, unik, urut; jumlah hari mengikuti paket. Jangan menyusun aktivitas rekaan. `null` atau array kosong menampilkan pesan menunggu konfirmasi.

`included` dan `excluded` masing-masing null atau `{ id: string[], en: string[] }`. Isi hanya fasilitas resmi. `information` berisi `{ label: { id, en }, value: { id, en } }` untuk meeting point, keberangkatan, minimum peserta, catatan booking, kebijakan pembatalan, atau informasi peserta lainnya yang telah dikonfirmasi. Item tidak tersedia tidak perlu ditambahkan.

## Mengganti tepat tiga foto

Buat direktori hanya saat memiliki aset: `public/images/packages/[slug]/`. Tambahkan:

1. `cover.webp` — foto utama dan kartu; rekomendasi lebar 1600–2000 px.
2. `detail-01.webp` — foto pendukung pertama.
3. `detail-02.webp` — foto pendukung kedua.

Tiga objek `images` independen berisi `src`, `alt: { id, en }`, dan `position`, misalnya `"50% 40%"`. Edit alt agar mendeskripsikan foto sebenarnya dan focal point sesuai subjek. Tidak perlu mengubah React. `src: null` atau file belum tersedia menghasilkan placeholder, tanpa elemen/request gambar rusak. Pemeriksaan file dilakukan di server; Next Image dipakai untuk file yang tersedia. Aset hanya dari folder paket lokal, bukan URL eksternal. Jangan gunakan foto tanpa izin. Tambahkan file sebelum build; rebuild setelah mengganti aset production. Kerusakan isi file bukan sekadar file hilang dan perlu dicek sebelum publikasi.

## Preview dan publikasi

Jalankan `npm run dev`, buka `/id/packages?preview=draft` atau `/en/packages?preview=draft`, lalu klik detail. Query preview dibawa ke detail dan language switcher. Semua draft diberi label DEMO/DRAFT; CTA inquiry draft tidak tersedia.

Preview hanya berlaku ketika `NODE_ENV === "development"`, diperiksa di proxy dan modul server. `next build`/`next start` tidak dapat membuka draft meskipun query ditambahkan secara manual. Preview development bukan kontrol akses pengguna: jangan mengekspos dev server ke publik. Foto di folder `public` adalah aset publik; jangan menaruh materi rahasia dalam draft/public.

Setelah konten resmi disetujui, pastikan `demo: false`, lalu ubah objek paket itu menjadi `status: "published"`. Paket demo tetap tidak tampil publik meskipun statusnya keliru diubah. Rebuild production; paket akan otomatis tampil pada katalog, detail dan hingga tiga kartu homepage. Mengubah kembali ke draft menarik paket dari ketiganya. Tidak ada paket resmi published pada akhir implementasi ini.

## Filter dan inquiry

Form GET memakai `q`, `destination`, `category`, `duration`. Nilai lokasi/kategori berupa ID stabil, durasi berupa jumlah hari. Opsi berasal dari paket yang boleh terlihat; filter tanpa data tidak ditampilkan. Kata kunci dicari pada nama paket sesuai locale, maksimal 200 karakter. Language switcher membawa query filter yang dikenal; kata kunci sama dapat menghasilkan hasil berbeda bila nama diterjemahkan. Query tidak dikenal tidak diteruskan saat ganti bahasa.

CTA paket terbit menuju `/{locale}/booking?package=[slug]`. Halaman memeriksa ulang bahwa paket published dan bukan demo sebelum menampilkan namanya. Tidak ada form, pengumpulan data, pengiriman inquiry, atau konfirmasi booking.

## Validasi lokal

Jalankan `npm run lint`, `npm run typecheck`, `npm run build`. Jalankan production di terminal terpisah, lalu `node scripts/verify-routes.mjs` dan `node scripts/verify-packages.mjs`. `TEST_BASE_URL` dapat menunjuk port lain. Untuk server dev, set `TEST_PREVIEW=1` ketika menjalankan `verify-packages.mjs`.

Browser: Chrome headless terpisah dengan profil di `artifacts/`, remote debugging hanya lokal, lalu `node scripts/verify-packages-browser.mjs`; atur `BROWSER_DEBUG_URL` sesuai port dan `TEST_BASE_URL` ke server target. Set `TEST_PREVIEW=1` hanya untuk dev. Script HTTP saat ini menguji baseline tanpa paket resmi; sesuaikan ekspektasi empty state saat paket resmi diterbitkan. Fixture published pada pengujian logika tetap terisolasi dan tidak masuk katalog.

`scripts/verify-packages-image.mjs` khusus server development: memakai WebP sintetis sementara untuk menguji Next Image. Penulisan eksklusif tidak menimpa foto yang sudah ada; file yang dibuat sendiri dihapus pada finally. Jangan menjalankannya terhadap production karena preview memang tidak tersedia di sana.
