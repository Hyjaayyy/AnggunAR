# Gallery — pengelolaan foto

Konfigurasi terpusat: `src/data/gallery.ts`. Model: `src/types/gallery.ts`. Resolver server: `src/lib/gallery.ts` dan `src/lib/local-photos.ts`. UI bilingual: `src/i18n/gallery.ts`. Galeri interaktif: `src/components/gallery/photo-gallery.tsx`; halaman dan resolusi data tetap Server Components.

Belum ada foto berizin yang diberikan pemilik; dataset publik kosong dan halaman menampilkan pesan persiapan. Placeholder tidak disebut foto perjalanan pelanggan dan tidak membuka lightbox kosong.

## Menambah atau mengganti foto

Simpan WebP berizin di `public/images/gallery/[nama-unik].webp`. Rekomendasi lebar 1600–2400 px, kompres sesuai kualitas dan kebutuhan. Hindari gambar sangat besar; thumbnail menggunakan responsive sizes dan lazy loading, gambar besar hanya dirender ketika lightbox dibuka. Uji kualitas/crop pada mobile/desktop.

Tambahkan objek ke array `galleryPhotos`:

```ts
{
  id: "nama-foto-unik",
  status: "draft",
  category: "destinations",
  image: {
    src: "/images/gallery/nama-foto-unik.webp",
    alt: { id: "Deskripsi foto sebenarnya", en: "Description of the actual photo" },
    position: "50% 50%",
  },
  caption: { id: "Keterangan konteks foto", en: "Photo context caption" },
  permission: null,
}
```

`category` menerima `destinations`, `beaches-islands`, `landmarks`, atau `travel-moments`. Pilih kategori berdasarkan isi dan konteks nyata. Jangan menyebut perjalanan pelanggan untuk foto destinasi umum. Caption dan alt wajib lengkap ID/EN; `position` mengatur focal point thumbnail. Lightbox memakai object-contain agar keseluruhan foto terlihat.

Catat konfirmasi izin dalam `permission` tanpa data pribadi atau dokumen sensitif. Setelah izin dan isi diverifikasi, ubah menjadi `status: "published"`. Foto hanya tampil jika published, permission terisi, serta file lokal tersedia. Draft, foto tanpa catatan izin dan file hilang dilewati. Jumlah foto fleksibel; kategori filter berasal dari foto yang benar-benar bisa ditampilkan. Untuk mengganti gambar cukup ubah file/src dan alt/caption bila isi berubah; tidak perlu mengubah React. Tambahkan aset sebelum build/start production lalu rebuild/restart.

Semua aset di public dapat diakses langsung terlepas dari status draft. Jangan menyimpan foto rahasia atau data pribadi di sana. Path eksternal atau traversal ditolak; hanya `/images/gallery/[nama-unik].webp` diterima. Kode memeriksa keberadaan file, bukan legalitas izin atau integritas semua format gambar; pemilik harus memeriksa isi foto sebelum publikasi. Jika image gagal dimuat pada browser, tampil fallback teks.

## Perilaku galeri

Filter GET menggunakan `category`, reset kembali ke katalog foto, dan pemilih bahasa mempertahankan kategori valid. Tombol thumbnail membuka dialog native, menempatkan fokus ke Close, serta mengunci scroll halaman. Previous/Next dan ArrowLeft/ArrowRight berpindah melingkar; satu foto menonaktifkan kedua tombol arah. Escape, Close, atau klik backdrop menutup dialog. Tab/Shift+Tab tetap di kontrol dialog, fokus kembali ke thumbnail, scroll dipulihkan saat ditutup atau komponen dilepas. Counter dan caption memiliki label aksesibel.

Transisi ringan mengikuti prefers-reduced-motion. Tidak menggunakan library lightbox atau dependency tambahan. Belum ada autentikasi, upload, backend media, database atau layanan eksternal.

## Menguji lightbox sebelum foto resmi tersedia

Jalankan server development pada **http://localhost:3000** dan browser Chrome headless CDP dengan profil terpisah di workspace. Set `TEST_BASE_URL=http://localhost:3000` serta `BROWSER_DEBUG_URL` sesuai port, kemudian `node scripts/verify-gallery-browser.mjs`.

Script khusus dataset awal kosong dan server development localhost. Script sementara mengganti konfigurasi galeri dengan fixture berpola warna berlabel PENGUJIAN, menambah file WebP sintetis memakai penulisan eksklusif, lalu memulihkan konfigurasi persis dan menghapus hanya file yang dibuatnya pada finally. Tidak menjalankan build/deployment atau commit selama fixture aktif. Jangan menjalankan tes fixture bersamaan dengan browser/regresi lain yang membaca folder public. Jika pengguna mengubah dataset saat tes berjalan, script menolak menimpanya. Setelah memiliki foto resmi, sesuaikan tes agar memakai fixture terisolasi lain; pemeriksaan ini sengaja tidak menimpa dataset pemilik.

Gunakan localhost sesuai origin dev server; 127.0.0.1 dapat diblokir bootstrap/HMR Next.js bila server berjalan pada hostname localhost. Tidak perlu melonggarkan konfigurasi origin aplikasi untuk pengujian ini. Laporan dan screenshot tersimpan di `artifacts/phase4/`. Tes ini tidak menggantikan audit WCAG, screen reader, lintas browser, atau perangkat fisik.
