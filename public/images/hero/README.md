# Foto hero carousel

Belum ada foto resmi. Carousel memakai gradient lokal berlabel, tanpa request gambar kosong atau path file yang belum tersedia.

## Mengganti foto

1. Simpan foto yang Anda buat atau miliki izin penggunaannya di folder ini.
2. Nama yang disarankan: `explore-batam.webp`, `travel-experiences.webp`, `plan-your-trip.webp`.
3. Buka `src/data/hero-slides.ts` dan ubah `image.src` dari `null` menjadi path yang benar, misalnya `/images/hero/explore-batam.webp`. Pastikan file sudah ada sebelum menyimpan konfigurasi.
4. Sesuaikan `desktopPosition` dan `mobilePosition`, misalnya `65% 50%` dan `75% 45%`. Persentase pertama mengatur fokus horizontal, kedua vertikal. Tempatkan subjek penting di tengah/kanan agar tidak tertutup teks kiri.
5. Isi `imageAlt` sesuai foto sebenarnya untuk kedua bahasa pada `src/i18n/hero.ts`. Jika foto hanya dekoratif dan informasi sudah lengkap di teks slide, alt kosong dapat dipertahankan.
6. Jalankan lint, typecheck, build, dan periksa crop desktop/mobile. Mengganti foto tidak memerlukan perubahan komponen atau logika timer.

## Rekomendasi aset

- WebP atau AVIF; JPEG juga didukung. Hindari SVG dari sumber tak tepercaya.
- Master landscape sekitar 2400 × 1350 px (16:9); minimum praktis 1920 × 1080 px untuk desktop. Rasio tampilan hero berubah sesuai viewport, sehingga object-cover akan memangkas foto.
- Target ukuran file sekitar 200–500 KB setelah kompresi, disesuaikan dengan detail gambar dan kualitas yang diperlukan. Bukan batas teknis mutlak.
- Pastikan subjek tetap terlihat pada crop portrait mobile. Bila membutuhkan foto portrait terpisah, perluas konfigurasi secara terencana; konfigurasi saat ini mendukung focal point terpisah, bukan source terpisah.
- Hindari teks, logo, atau informasi penting di dalam foto. Jangan memakai foto referensi atau foto berhak cipta tanpa izin.

Next.js Image memakai sizes=100vw; hanya slide pertama diberi prioritas untuk LCP, lainnya lazy-load. Rasio/tinggi carousel tidak bergantung pada dimensi asli foto atau jumlah baris headline. Jika sebuah foto gagal dimuat di browser, image dihapus dari slide dan gradient berlabel kembali ditampilkan. Kesalahan path tetap harus diperbaiki, karena fallback tidak membuat URL yang salah menjadi valid.
