# Audit cinematic video — 21 Oktober 2026

## Kesimpulan

Gejala video hilang tidak dapat direproduksi pada Chrome headless lokal, desktop responsif maupun emulasi mobile. Jangan menganggap penyebab video hilang pada semua perangkat sudah ditemukan atau masalah pada perangkat pemilik sudah selesai.

Masalah yang terkonfirmasi: Wi-Fi aktif kini 192.168.1.5, sedangkan next.config.ts sebelumnya hanya mengizinkan origin development 192.168.88.189. Log Next.js mencatat blokir request /_next/hmr dari 192.168.1.5. IP aktif ditambahkan secara spesifik, dengan IP lama tetap dipertahankan. Blokir HMR ini tidak membuktikan penyebab hilangnya video; request MP4 sendiri sudah berhasil sebelum perubahan.

## Audit kode dan aset

- CinematicSection tetap dirender setelah HeroSection dan sebelum IntroductionSection pada /id dan /en.
- Git diff homepage, proxy, Hero Carousel dan CSS diaudit. Tidak ditemukan kaitan langsung perubahan gesture Hero dengan cinematic. Kode cinematic masih untracked sejak sebelum sesi ini; Git tidak menyediakan baseline perubahan historisnya.
- public/videos/home/batam-cinematic.mp4 tersedia, 18.892.571 byte: ffprobe menunjukkan HEVC 1920x1080 yuv420p dan audio AAC.
- public/videos/home/batam-cinematic-h264.mp4 tersedia, 10.907.407 byte: ffprobe menunjukkan H.264/AVC avc1 Main level 4.0, 1920x1080, yuv420p, 30 fps, 428 frame, durasi 14,266667 detik, satu stream video tanpa audio.
- Faststart terkonfirmasi: atom moov di offset 32, sebelum mdat di offset 5912.
- Sumber aktif: /videos/home/batam-cinematic-h264.mp4. Konfigurasi src dan allowlist resolver cocok dengan file tersedia. Konversi ulang tidak diperlukan; kedua file asli dipertahankan.
- Proxy mengecualikan kedua path MP4 yang disetujui. URL video lain dan path dengan suffix /extra tetap 404.
- Autoplay muted, loop, playsInline, tanpa kontrol; observer viewport, visibility, reduced-motion, error fallback dan overlay navy 70% dipertahankan.

## Perubahan sesi ini

Satu perubahan kode pada next.config.ts: tambahkan 192.168.1.5 pada allowedDevOrigins yang sebelumnya hanya memuat 192.168.88.189. Tidak memakai wildcard. Saat pindah jaringan, gunakan IP aktif dan tambahkan origin development spesifik bila diperlukan; restart server jika perubahan konfigurasi belum termuat.

Dokumentasi baru: docs/CINEMATIC_URGENT_AUDIT.md. Skrip uji mobile sementara berada di artifacts/urgent-video/mobile-playback.mjs yang sudah diabaikan Git. Tidak mengubah komponen video, Hero, section lain, proxy, desain, dependency, maupun file video.

## Hasil pengujian

Keempat URL berikut berhasil HTTP 200:

- http://localhost:3000/id
- http://localhost:3000/en
- http://192.168.1.5:3000/id
- http://192.168.1.5:3000/en

IP lama 192.168.88.189 bukan alamat interface aktif dan diganti untuk pengujian. Tes dilakukan dari mesin host melalui alamat LAN, bukan perangkat fisik kedua.

Pada kedua origin, MP4 full request HTTP 200 dan range bytes=0-1023 HTTP 206, Content-Type video/mp4. Desktop responsif 390/768/1440 px, kedua bahasa: videoWidth=1920, videoHeight=1080, opacity=1, frame decode dan currentTime meningkat. Contoh LAN ID 390 px: currentTime 0,121 -> 1,623 detik, decodedFrames 8 -> 53.

Skrip verify-home-video-playback-browser.mjs lulus di kedua origin: autoplay, loop akhir file, viewport pause/resume, tab visibility, reduced-motion saat awal maupun berubah, fallback jaringan gagal, simulasi autoplay ditolak, full bleed, overlay, heading, tanpa kontrol dan tanpa overflow. Emulasi mobile=true lebar 390 juga lulus pada kedua origin dan bahasa menggunakan salinan skrip dalam artifacts.

verify-home-video-lifecycle-browser.mjs lulus 54 pemeriksaan playback: direct visit, reload cache on/off, client remount, history back/forward, switch bahasa, recovery interupsi play/load terkontrol, jaringan 512 KB/s dengan latency 150 ms, dan pause/resume. Tidak ada error console/hydration/HMR atau kegagalan jaringan tak terduga pada hasil akhir.

verify-home-video-rendering-browser.mjs lulus delapan kombinasi origin/bahasa/lebar 390 dan 1440, masing-masing pada timestamp 2 dan 5 detik. Pixel screenshot dibandingkan dengan frame decode plus overlay; mean absolute error 0,115–1,843 (<3), dan berbeda dari navy polos. Screenshot LAN ID 390 t2 juga diperiksa visual dan memperlihatkan frame video di belakang heading.

Bukti lokal yang diabaikan Git:

- artifacts/home-video-real/urgent-localhost-results.json
- artifacts/home-video-real/urgent-lan-results.json
- artifacts/home-video-real/urgent-mobile-localhost-results.json
- artifacts/home-video-real/urgent-mobile-lan-results.json
- artifacts/home-video-lifecycle/urgent-results.json
- artifacts/home-video-rendering/urgent-results.json
- artifacts/home-video-rendering/urgent-192.168.1.5-id-390-t2.png
- artifacts/home-video-rendering/urgent-192.168.1.5-id-390-t5.png

Lint, TypeScript typecheck, production build, dan skrip unit verify-home-video.mjs lulus. Root / mengembalikan 307 ke /id; /fr, /id/missing, video tak diizinkan dan suffix /extra mengembalikan 404. Production build berhasil; playback di atas diuji terhadap server development port 3000.

Satu percobaan browser LAN pertama timeout 12 detik saat kompilasi awal sesudah reload next.config.ts; setelah server siap, seluruh pengulangan lulus. Log memuat warning smooth scroll Next.js yang sudah ada; tidak diperbaiki karena di luar cakupan bug video. Tidak ada error console atau hydration dalam hasil akhir.

## Batas verifikasi dan langkah berikutnya

Belum menguji ponsel fisik, Safari/iOS, atau profil browser pribadi yang mengalami masalah. Jika video masih hilang, buka URL IP aktif dari perangkat gagal dan catat browser/OS, pengaturan reduced-motion, status request MP4, serta diagnostic cinematic pada sesi development. Bandingkan videoWidth/videoHeight, decodedFrames, currentTime, mediaError, visibility dan reducedMotion untuk menentukan apakah kegagalan berasal dari jaringan, autoplay policy atau decoder. Reduced-motion memang sengaja menampilkan fallback statis.

## Git

Working tree sudah berisi banyak file modified dan untracked sebelum sesi ini; semuanya dipertahankan. Perubahan sesi ini hanya satu tambahan IP pada next.config.ts serta laporan baru ini. Tidak melakukan commit, push, reset, penghapusan, atau deployment.