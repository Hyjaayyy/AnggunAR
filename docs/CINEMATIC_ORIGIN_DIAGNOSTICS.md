# Diagnosis cinematic localhost dan LAN — 21 Oktober 2026

## Status dan bukti perangkat pemilik

IP Wi-Fi aktif saat audit ini adalah **192.168.1.29**, menggantikan 192.168.1.5 pada audit sebelumnya. Pemilik melaporkan video terlihat di localhost tetapi tidak terlihat di Edge/LAN dan perangkat lain. Penyebab awal gejala tersebut belum terbukti.

Setelah panel diagnostik tersedia, pemilik mengirim data dari browser perangkat yang bermasalah pada http://192.168.1.29:3000/id?videoDebug=1:

- Sumber H.264 aktif, dimensi 1920×1080, readyState 4, networkState 1.
- Request **pemutar asli**, initiator `video`, berhasil HTTP 206; transferSize 10.907.707 byte termasuk overhead resource timing. Range probe terpisah juga 206, video/mp4, bytes 0-1023/10907407.
- Play promise berhasil; lastError dan mediaError null; blocked/failed false.
- Frame meningkat dari 104 pada event play-resolved menjadi 220 pada snapshot; currentTime meningkat dari 3,228432 menjadi 5,729093 detik.
- Visibility visible, intersection true (rasio 0,1618), reduced-motion false, opacity 1, display block, visibility visible.
- Pause saat tab hidden lalu resume saat visible tercatat, tanpa source reset atau kegagalan decode setelah source dipasang.
- Secure context false, service worker tidak didukung pada origin HTTP ini, tidak ada pelanggaran CSP yang tercatat.

Pemilik kemudian mengonfirmasi: **“Video sekarang terlihat bergerak”** setelah panel dilipat dan cinematic berada di layar. Ini merupakan konfirmasi visual pada perangkat yang diuji pemilik, bukan bukti bahwa seluruh perangkat atau gejala awal telah teratasi permanen. Tidak menyimpulkan bahwa pembaruan allowlist atau panel memperbaiki akar masalah playback.

## Audit origin dan lifecycle

Kedua origin dari host menghasilkan HTTP 200 untuk /id dan /en; request MP4 full/range menghasilkan 200/206 dengan Content-Type video/mp4 dan Content-Range yang benar. Tidak ada Content-Security-Policy pada respons halaman yang diuji. Proxy sudah mengecualikan path video aktif. Konfigurasi source/resolver cocok dan tidak berbeda berdasarkan hostname/protokol.

Tidak ditemukan registrasi service worker, CSP, atau API secure-context sebagai syarat playback dalam source. Chrome uji menunjukkan localhost secureContext=true dan LAN HTTP secureContext=false, tetapi video terdecode dan bergerak pada keduanya. Clipboard API tidak tersedia pada HTTP LAN; panel menyediakan pemilihan teks manual. Pada localhost uji tidak ada service worker controller/registrasi; pada LAN API service worker tidak tersedia.

allowedDevOrigins sebelumnya hanya berisi 192.168.88.189 dan 192.168.1.5. Ditambahkan IP aktif 192.168.1.29 secara spesifik tanpa wildcard. Pengaturan ini untuk resource development; tidak dianggap penyebab kegagalan video tanpa bukti. Restart development server jika perubahan konfigurasi belum termuat.

Playback controller tetap memiliki keputusan autoplay, pause/resume viewport/tab, reduced-motion, satu recovery AbortError, fallback, cleanup dan penolakan autoplay yang sama. Hanya ditambah event diagnostik development `play-requested`, `play-rejected`, `play-resolved`. Tidak ada retry baru, konversi video, perubahan overlay, heading, Hero atau section lain.

## Menggunakan panel pada Edge atau HP

Jalankan server development yang dapat diakses LAN, lalu buka salah satu URL:

- http://localhost:3000/id?videoDebug=1
- http://localhost:3000/en?videoDebug=1
- http://192.168.1.29:3000/id?videoDebug=1
- http://192.168.1.29:3000/en?videoDebug=1

Scroll hingga cinematic terlihat, tunggu sekitar lima detik, lalu tekan **Copy Diagnostics**. Jika clipboard tidak tersedia atau ditolak, gunakan **Pilih teks** lalu Salin/Ctrl+C. Pembaruan laporan berhenti sementara selama textarea fokus untuk menjaga teks yang dipilih. Lepaskan fokus untuk melanjutkan pembaruan. Lipat panel melalui judulnya untuk memeriksa gambar di belakangnya.

Panel hanya aktif ketika NODE_ENV=development dan parameter videoDebug=1. Perubahan query melalui navigasi client ikut mengaktifkan/menonaktifkan panel tanpa mengganti elemen video. Panel tidak dirender pada production meskipun parameter diberikan. Tidak ada pengiriman diagnostik ke server/layanan lain, pembacaan cookie/storage, token, atau pengumpulan data pribadi; laporan mencakup origin lokal dan path media tanpa query/fragment.

Panel hanya membaca state, event dan resource timing, serta memakai observer diagnostik tersendiri. Tidak memanggil play(), pause(), load(), atau mengganti src. Satu request range 1 KB dengan no-store dilakukan terpisah saat panel aktif, dapat dibatalkan saat cleanup. Probe ini **bukan** status request pemutar; `actualMediaResourceTiming` hanya memuat initiator video. Ketiadaan resource timing tidak otomatis berarti request gagal. Dev Strict Mode dapat membatalkan probe pertama sebelum probe berikutnya berhasil.

## Validasi

- `npm run lint`, `npm run typecheck`, `npm run build`: lulus.
- `node scripts/verify-home-video.mjs`: lulus (controller, cleanup/race, resolver dan markup).
- `node scripts/verify-home-video-playback-browser.mjs`: lulus pada localhost dan IP aktif, ID/EN, lebar 390/768/1440; dimensi positif, frame dan waktu meningkat, loop, viewport/tab pause-resume, reduced-motion, fallback dan autoplay-denied terkontrol; tanpa error console/hydration/HMR.
- `node scripts/verify-video-debug-browser.mjs`: lulus pada localhost dan IP aktif, ID/EN, desktop 1440 dan emulasi mobile 390; panel opt-in, clipboard fallback, frame/waktu meningkat saat panel aktif, range probe, query toggle tanpa remount, pelaporan play rejection dan reduced-motion.
- Production diuji terpisah pada port 3001, kedua origin/bahasa/ukuran; video tetap memutar, panel dan atribut diagnostik tidak muncul sekalipun videoDebug=1.

Skrip browser memakai CDP dengan browser terisolasi yang sudah terpasang; tidak memerlukan dependency baru. Emulasi mobile bukan ponsel fisik. Konfirmasi visual perangkat pemilik dicatat di atas secara terpisah; belum ada konfirmasi terpisah untuk semua HP, OS, kedua bahasa, atau sesi tanpa parameter debug.

Contoh perintah PowerShell untuk origin berbeda:

```powershell
$env:TEST_BASE_URL = 'http://192.168.1.29:3000'
$env:VIDEO_STAGE = 'origin-audit-lan'
node scripts/verify-home-video-playback-browser.mjs

$env:TEST_ORIGINS = 'http://localhost:3000,http://192.168.1.29:3000'
node scripts/verify-video-debug-browser.mjs

# Setelah build, jalankan npm run start -- --port 3001 --hostname 0.0.0.0 di terminal lain.
$env:TEST_ORIGINS = 'http://localhost:3001,http://192.168.1.29:3001'
$env:TEST_EXPECT_PRODUCTION = '1'
node scripts/verify-video-debug-browser.mjs
```

Artefak lokal diabaikan Git: `artifacts/video-debug/development-results.json`, `production-results.json`, screenshot per origin/bahasa/ukuran, serta `artifacts/home-video-real/origin-audit-{localhost,lan}-results.json`.

Jika gejala kembali, ambil laporan ketika video **masih gagal**, sebutkan browser/perangkat dan apakah gambar tetap navy atau berhenti. Jika frame/waktu terus meningkat tetapi gambar tidak terlihat, diagnosis berikutnya perlu membandingkan pixel/frame dan lapisan rendering pada perangkat tersebut. Jangan mengubah playback atau overlay berdasarkan asumsi.

## File dan Git

Perubahan sesi: next.config.ts, cinematic-section.tsx (mount panel development sebagai sibling video dalam Suspense), cinematic-playback.ts (event diagnostik), cinematic-video-debug.tsx dan CSS baru, scripts/verify-video-debug-browser.mjs, serta dokumen ini. Banyak perubahan modified/untracked sudah ada sebelum sesi dan tetap dipertahankan. Tidak melakukan commit, push, reset atau deployment.
