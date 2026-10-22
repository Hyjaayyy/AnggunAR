# Cinematic homepage media

Video aktif: `batam-cinematic-h264.mp4` (H.264/AVC Main, yuv420p, faststart, tanpa audio).
Sumber asli: `batam-cinematic.mp4` (HEVC), dipertahankan tanpa perubahan.

Ganti versi web dengan MP4 H.264 milik sendiri pada nama aktif yang sama. Jangan menimpa sumber asli. Target desain sekitar 10 detik dan rasio 16:9; versi saat ini mempertahankan seluruh 428 frame sumber (sekitar 14.27 detik).

Poster opsional: `public/images/home/batam-cinematic-poster.webp`. Jika aset tidak tersedia, resolver mengembalikan null dan fallback statis tetap berfungsi. Tidak ada video sintetis atau unduhan footage eksternal.

Lihat `docs/HOME_VIDEO.md` untuk parameter konversi dan validasi.
