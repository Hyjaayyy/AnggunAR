# Foto About Us

Halaman About saat ini memakai visual CSS berlabel. Bukan foto lokasi atau dokumentasi perusahaan. Tidak ada request foto sampai aset resmi tersedia.

Untuk mengganti visual, simpan foto milik sendiri/berizin, misalnya `company-travel.webp`, pada folder ini. Isi `src` di `src/data/about-visual.ts` menjadi `/images/about/company-travel.webp`, isi alt Indonesia/Inggris sesuai foto, dan sesuaikan `position` (contoh `65% 50%`). Pastikan file ada sebelum konfigurasi diaktifkan. Tidak perlu mengubah komponen.

Gunakan foto landscape minimal sekitar 1200 × 960 piksel (5:4), WebP/AVIF/JPEG yang dikompresi dengan baik. Object-cover akan melakukan crop responsif; periksa subjek dan alt pada mobile/desktop. Hindari teks penting di tepi gambar. Next Image memberi prioritas pada visual hero dan menyajikan ukuran berdasarkan viewport.
