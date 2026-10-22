# Homepage Cinematic Video

Section bilingual Ocean Blue Luxury berada tepat setelah Hero Carousel dan sebelum Introduction. Tiga kartu destinasi dan hero carousel tidak diubah. Tidak ada dependency, route halaman, data bisnis, atau layanan eksternal baru.

## Memasukkan media resmi

1. Salin versi web H.264 milik sendiri ke `public/videos/home/batam-cinematic-h264.mp4`. File `batam-cinematic.mp4` dipertahankan sebagai sumber asli HEVC.
2. Opsional: salin poster WebP ke `public/images/home/batam-cinematic-poster.webp`.
3. Gunakan komposisi 16:9. Target durasi sekitar 10 detik; durasi tidak dipotong otomatis. Siapkan awal/akhir yang menyambung untuk loop. MP4 H.264 yang sudah dioptimalkan untuk web dan tanpa audio dianjurkan; jangan hanya mengganti ekstensi berkas lain.
4. Jalankan ulang dev server jika perubahan aset belum terdeteksi. Untuk production, jalankan ulang build lalu restart server karena homepage dihasilkan secara statis. Tidak ada deployment otomatis.
5. Uji ID/EN, mobile/desktop, browser yang digunakan pengunjung, autoplay, ketiadaan kontrol, perpindahan tab, reduced motion, kualitas loop, ukuran unduhan, dan poster sebelum dipublikasikan.

Untuk mengganti video/poster, timpa berkas pada nama yang sama lalu build ulang. Konfigurasi terpusat ada di `src/data/home-video.ts`; `position` mengatur crop dengan object-position. Resolver server membatasi media pada dua path yang disetujui. Jika nama/path diganti, perbarui juga allowlist pada `src/lib/home-video.ts`. Teks terpisah di `src/i18n/home-video.ts`.

## Perilaku dan fallback

- Server memeriksa keberadaan berkas. Jika MP4 tidak ada, elemen video dan tombol playback tidak dibuat. Jika poster tidak ada, tidak ada request gambar kosong/broken; visual CSS statis ditampilkan.
- Jika hanya poster tersedia, Next Image menampilkan poster. Jika hanya video tersedia, visual CSS tetap terlihat hingga playback mulai. Poster/visual CSS juga menjadi lapisan bawah ketika autoplay ditolak atau reduced motion aktif.
- Video muted, loop, playsInline, tanpa kontrol audio, dan `preload="none"`. Sumber baru dipasang ketika viewport dan preferensi gerak mengizinkan playback. IntersectionObserver memakai ambang 10%; fallback pengukuran viewport tersedia bila API tidak didukung.
- Video bersifat dekoratif: tidak ada tombol, kontrol native, progress, indikator waktu, ikon Play, volume, atau interaksi manual. Video `aria-hidden="true"`, tabindex -1, picture-in-picture dan remote playback dinonaktifkan. Tidak ada fokus keyboard pada section video.
- Keluar viewport atau tab tidak aktif menjeda video. Kembali terlihat melanjutkan secara otomatis jika preferensi gerak mengizinkan. Controller hanya menyediakan cleanup, tanpa API Play/Pause manual.
- Reduced motion mencegah autoplay dan pemuatan awal video. Jika diaktifkan ketika video sudah berjalan, video dijeda dan disembunyikan agar poster/fallback statis terlihat. Tidak tersedia cara manual untuk memaksa playback selama preferensi tersebut aktif.
- Autoplay yang ditolak tidak dicoba berulang secara paksa dan tidak memunculkan kontrol. Error sumber memulihkan visual pengganti dan menghentikan pemuatan sumber tersebut. Heading/deskripsi tetap terlihat tanpa pesan player.
- `NotAllowedError` tetap menjadi penolakan kebijakan browser. `AbortError` akibat interupsi loading berbeda: controller boleh pulih maksimal sekali ketika data media siap (event canplay), dengan tetap memeriksa viewport/tab/reduced motion. Tidak ada polling, timer retry, atau retry tanpa batas. Callback controller yang sudah dilepas tidak dapat menjeda controller baru.
- Layer: poster/fallback dan video sebagai background, overlay navy 70%, kemudian heading/deskripsi bilingual sebagai konten HTML yang tetap dapat dibaca assistive technology. Video memakai object-fit cover dan konfigurasi object-position yang sama.
- Section full-width menjadi frame background secara langsung, tanpa container luar, border samping, radius atau shadow. Container hanya membatasi teks agar sejajar navbar. Video/poster/fallback dan overlay absolut memakai inset 0 dan ukuran 100%, dengan object-fit cover untuk crop proporsional. Tidak memakai margin negatif atau width 100vw pada wrapper.
- Tinggi minimum section memakai clamp(24rem, 48vw, 48rem); konten dapat tumbuh pada layar sempit agar teks tidak terpotong. Ruang konten sudah dipesan sebelum video dimuat. Hanya border atas/bawah section dipertahankan; tidak ada animasi dekorasi atau pergeseran layout akibat pergantian fallback/video.

## Struktur dan pengujian

- `cinematic-section.tsx`: Server Component untuk heading, frame, poster/fallback, pemeriksaan aset.
- `cinematic-video.tsx`: Client Component terbatas untuk elemen video dan kontrol.
- `cinematic-video.module.css`: styling terisolasi.
- `src/lib/cinematic-playback.ts`: lifecycle playback dan cleanup listener.
- `scripts/verify-home-video.mjs`: controller aktual dengan mock media, resolver dengan mock filesystem, markup React aktual. Tidak membuat video uji sintetis.
- `scripts/verify-home-video-browser.mjs`: ID/EN enam viewport, urutan section, perbandingan DOM/geometri ketiga kartu dengan baseline, fallback, language switcher, keyboard tautan, dan error console/hydration. Baseline ditangkap sebelum implementasi dengan `VIDEO_STAGE=before`. CDP default port 9333; URL dev default localhost:3000.

## Verifikasi media resmi — 20 Oktober 2026

Pemilik telah mengganti MP4 dengan versi aktif 18.892.571 byte (durasi decoder 14,279002 detik pada audit terbaru). Berkas baru tidak diubah atau dikonversi. Poster belum tersedia sehingga fallback CSS tetap menjadi lapisan bawah sebelum playback atau jika pemuatan gagal.

Akar masalah pemuatan adalah matcher proxy locale yang juga menangkap `/videos/home/batam-cinematic.mp4` dan mengembalikan HTML 404. Dengan persetujuan khusus pemilik, hanya path MP4 tersebut dikecualikan dari matcher di `src/proxy.ts`. Path video lain tetap 404. Tidak perlu mengubah resolver, state playback, CSS, atau memaksa halaman menjadi dynamic. File yang tersedia saat build tetap harus diikutkan dalam build ulang production.

Masalah HMR terpisah: Next.js menolak origin development LAN. `next.config.ts` mengizinkan hanya `192.168.88.189` pada `allowedDevOrigins`, tanpa wildcard. Jika alamat jaringan berubah, sesuaikan host yang memang digunakan lalu restart development server. Ini bukan konfigurasi domain production.

`node scripts/verify-home-video-playback-browser.mjs` menguji MP4 asli lewat Chrome CDP (port default 9333), HTTP 200/206, currentSrc, readyState, error, muted/loop/playsInline, currentTime, viewport, ketiadaan kontrol/fokus, urutan layer, overlay, loop setelah seek mendekati akhir, reduced motion, tab browser sungguhan, dan fallback saat URL diblokir oleh automation. Penolakan kebijakan autoplay disimulasikan secara terpisah agar fallback tanpa tombol dan tanpa retry paksa dapat diverifikasi. Gunakan `TEST_BASE_URL` untuk localhost, LAN, atau server production lokal. Test tidak mengubah file media. Hasil di `artifacts/home-video-real/`.

Pengujian browser memakai viewport mobile/tablet/desktop di Chrome, bukan perangkat fisik atau Safari. Loop decoder telah diverifikasi; kelancaran artistik sambungan awal/akhir dan crop poster perlu ditinjau pemilik. Pengujian unit tetap memakai mock dan dibedakan dari pengujian MP4 asli.

## Diagnosis lifecycle dan sesi browser

Untuk kondisi event playing/readyState 4 tetapi tidak bergambar, gunakan [panduan rendering dan HEVC](CINEMATIC_RENDERING.md). `playing` saja tidak membuktikan adanya track video; diagnostik development juga menyertakan ukuran intrinsik dan jumlah decoded frames.

`scripts/verify-home-video-lifecycle-browser.mjs` membandingkan localhost/LAN pada ID/EN dan mobile/desktop, termasuk reload yang menunggu load event, navigasi client-side, bahasa, back/forward, cache aktif/nonaktif, jaringan lambat 512 KB/s + 150 ms latency, dan interupsi native play/load yang dikendalikan. Test memeriksa pertambahan currentTime **dan** decoded/rendered frame count, opacity/display/visibility serta respons media. Tidak mengganti atau memodifikasi MP4. TEST_ORIGINS dapat menunjuk daftar origin lokal yang akan diuji, dipisahkan koma.

Pada development saja, controller menyimpan snapshot event terakhir pada `video.dataset.cinematicDiagnostic`, tanpa kontrol, UI, polling atau log console berulang. Snapshot mencakup nama interupsi, jumlah recovery, viewport, tab visibility, reduced motion, readyState, networkState, dan blocked/failed. Tidak menyimpan data pribadi. Untuk membaca kondisi sesi yang gagal dari Console:

```js
JSON.parse(document.querySelector('[data-cinematic-video]')?.dataset.cinematicDiagnostic || 'null')
```

Snapshot tidak tersedia di production. Pesan `[HMR] connected` saja adalah status koneksi development; diagnosis memisahkannya dari error media/penolakan autoplay. Tidak ada bukti yang memastikan secure-context LAN atau stale cache sebagai penyebab kegagalan sesi pemilik. Pada pengujian cache CDP, Chrome dapat mencatat ERR_CACHE_OPERATION_NOT_SUPPORTED saat cache byte-range sedang diganti; laporan tetap menyimpan peristiwa tersebut dan memastikan playback berikutnya pulih.


Diagnosis dimensi video 0?0: lihat [CINEMATIC_RENDERING.md](CINEMATIC_RENDERING.md), bagian diagnosis lanjutan 20 Oktober 2026. Instrumentasi development-only dan pengujian preload/metadata ditambahkan; perilaku playback dan MP4 dipertahankan. Konfirmasi pada sesi Chrome pemilik masih diperlukan.


## Versi web H.264 (20 Oktober 2026)

Sumber aktif: `/videos/home/batam-cinematic-h264.mp4`. Resolver hanya menerima path H.264 yang ditentukan; proxy mengecualikan dua path media spesifik (HEVC asli dan H.264), bukan seluruh folder videos. MP4 asli tidak ditimpa. Tidak ada perubahan komponen, overlay, styling atau lifecycle.

Konversi memakai FFmpeg 9.0.2, libx264, CRF 21, preset medium, Main profile, yuv420p, avc1, tanpa audio dan faststart. Tidak memakai scale, trim atau penggantian frame rate. Video asli dan output sama-sama 1920?1080, 30 fps nominal, 428 frame, durasi track video 14.266667 detik. Durasi container asli 14.279002 detik karena audio sedikit lebih panjang; output tanpa audio 14.266667 detik. Ini tidak memotong frame video.

```powershell
ffmpeg -hide_banner -nostdin -n -i public/videos/home/batam-cinematic.mp4 -map 0:v:0 -c:v libx264 -preset medium -crf 21 -profile:v main -pix_fmt yuv420p -tag:v avc1 -an -movflags +faststart public/videos/home/batam-cinematic-h264.mp4
ffprobe -v error -show_streams -show_format -of json public/videos/home/batam-cinematic-h264.mp4
```

Ukuran asli 18,892,571 byte; output 10,907,407 byte (turun sekitar 42.27%). moov di offset 32, sebelum mdat: faststart terverifikasi. Untuk mengganti video berikutnya, siapkan MP4 H.264 yuv420p tanpa audio pada path aktif yang sama. Jangan menimpa sumber asli. Opsi `-n` menolak menimpa output existing; arsipkan output lama secara manual sebelum konversi pengganti. Poster tetap `public/images/home/batam-cinematic-poster.webp` dan fallback CSS tetap tersedia.

Bukti ffprobe, log konversi dan hash perlindungan disimpan di `artifacts/home-video-h264/`. Script playback kini mengharuskan dimensi 1920?1080 dan pertambahan decodedFrames, bukan hanya status playing/currentTime. Ini menguji berkas proyek saat ini; sesuaikan dimensi assertion bila media resmi kelak memiliki resolusi berbeda.
