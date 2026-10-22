# Diagnosis video playing tetapi tidak bergambar

Audit 20 Oktober 2026. MP4 asli tetap utuh; tidak ada perubahan desain, overlay, CSS, routing, proxy atau section lain.

## Temuan terukur

- File aktif memakai HEVC/H.265 Main, 1920×1080, dengan track audio AAC. Signature MP4 hvc1/hvcC dikonfirmasi, dan Chrome Media melaporkan codec hevc/main. Ekstensi .mp4 tidak berarti codec H.264.
- Chrome 155 default pada mesin audit memakai Intel UHD/ANGLE D3D11 dan D3D11VideoDecoder. Localhost dan LAN menghasilkan gambar pada ID/EN, viewport 390/1440px, timestamp 2 dan 5 detik.
- Saat hanya hardware video decode dinonaktifkan, GPU compositing tetap aktif tetapi videoWidth/videoHeight 0×0 dan totalVideoFrames 0. Elemen tetap readyState 4, paused false, muted true, error null, event playing: audio-only media progression dapat disalahartikan sebagai video yang bergambar.
- Mengaktifkan kembali hardware decoder dan meluncurkan ulang profil uji yang sama mengembalikan 1920×1080, decoded frames dan screenshot video, tanpa perubahan CSS/MP4.
- Mode GPU+decode software awal juga menghasilkan frame kosong. Pengulangan mode software gabungan mengalami hang/timeout pada Chrome uji; hasil isolasi decode-only yang selesai lebih kuat dan disimpan terpisah. Tidak menyatakan software mode sebagai perbaikan untuk HEVC.

Dokumentasi [Chromium Audio/Video](https://www.chromium.org/audio-video/) mencatat HEVC memerlukan hardware support. Temuan ini membuktikan dependensi decoder HEVC dan reproduksi terkontrol, bukan membuktikan driver laptop pemilik rusak. Preferensi akselerasi Chrome utama yang dibaca read-only bernilai true; checkbox itu tidak menjamin runtime Video Decode benar-benar aktif. Nilai intrinsik dan chrome://gpu dari sesi pemilik yang gagal masih diperlukan untuk memastikan sebab persisnya. Incognito pada sesi pemilik juga dilaporkan gagal.

## CSS dan frame aktual

Audit menyimpan display, visibility, opacity, bounding rect, object-fit/position, z-index, filter, transform, clip-path, mask, overflow, isolation dan background pada seluruh ancestor. Semua ancestor terlihat dengan opacity 1, tanpa filter/transform/clip-path yang menyembunyikan video; overlay navy rgba(16,42,67,0.7) berada di atas video, dan konten di atas overlay. Rect full-width normal.

Screenshot compositor dibandingkan dengan frame video dari canvas plus overlay 70%, mengecualikan wilayah teks. Pada mode decoder hardware, mean absolute pixel error maksimum sekitar 1,87 dari skala 255 (perbedaan kecil rasterisasi/subpixel), dan gambar berbeda nyata dari navy polos. Frame pada 2 dan 5 detik berisi konten gambar yang berbeda. Tidak ditemukan bukti layer CSS menutupi video secara salah pada origin mana pun yang diuji.

## Langkah pada Chrome yang bermasalah

1. Simpan pekerjaan browser. Di chrome://settings/system, pastikan Use graphics acceleration when available aktif. Jika baru diubah, gunakan Relaunch; jika sudah aktif, restart Chrome agar proses GPU dibuat ulang. Pengaturan browser pribadi tidak diubah otomatis oleh agent.
2. Buka chrome://gpu, catat status Video Decode dan Problems Detected. Hardware accelerated adalah jalur yang berhasil pada pengujian ini. Software only/Disabled berarti HEVC hardware decoding belum tersedia meskipun checkbox aktif.
3. Pada homepage IP yang gagal, jalankan di Console:

```js
(() => {
  const v = document.querySelector('[data-cinematic-video]');
  return v ? {
    width: v.videoWidth,
    height: v.videoHeight,
    frames: v.getVideoPlaybackQuality?.().totalVideoFrames,
    readyState: v.readyState,
    paused: v.paused,
    error: v.error?.message,
    diagnostic: JSON.parse(v.dataset.cinematicDiagnostic || 'null')
  } : { videoFound: false };
})()
```

4. Jika 0×0/0 frames, periksa player di DevTools Media untuk kVideoTracks/kVideoDecoderName. Driver/policy harus ditinjau berdasarkan Problems Detected, bukan dengan override keamanan/GPU blocklist. Jika 1920×1080 dan frames bertambah tetapi gambar tetap kosong, cabang diagnosis berikutnya adalah compositing pada sesi tersebut; jangan menganggapnya masalah dukungan codec hanya dari status playing.

Jangan menonaktifkan hardware decoding sebagai solusi generik untuk file ini: pada pengujian tindakan itu menghilangkan track video HEVC. Dukungan lintas perangkat dapat ditingkatkan dengan aset H.264 terpisah, tetapi tidak dibuat/dikonversi dalam tugas ini. MP4 pemilik tetap dipertahankan.

## Artefak dan pengujian

`scripts/verify-home-video-rendering-browser.mjs` memakai Chrome CDP tanpa dependency baru. RENDER_MODE memilih label hasil, BROWSER_DEBUG_URL memilih instance Chrome yang diluncurkan dengan konfigurasi uji. EXPECT_VISIBLE=1 mensyaratkan video track nyata dan kecocokan pixel; tanpa flag, ketiadaan track diklasifikasi sebagai no-video-track, bukan dianggap lulus visual playback. Freeze playbackRate sementara dan seek 2/5 detik hanya dilakukan pada tab uji untuk membandingkan pixel, bukan pada aplikasi atau file media.

Hasil lokal di artifacts/home-video-rendering/: default-results.json, no-hardware-decode-results.json dan restored-hardware-results.json. Setiap mode final berisi delapan kombinasi origin/locale/viewport dan dua timestamp. Screenshot final contoh: restored-hardware-192.168.88.189-id-1440-t2.png dan versi t5, serta id-390. PNG decoded/expected adalah artefak pengujian, bukan media yang dipublikasikan.

Diagnostik development kini menyertakan videoWidth, videoHeight dan decodedFrames. Tidak ada pixel polling, UI/kontrol baru, atau perubahan playback aplikasi. Validasi playback alami, loop, pause/resume, fallback dan reduced motion memakai script playback terpisah; pengujian frame tidak menggantikannya. Status pribadi pada laptop pemilik tetap menunggu konfirmasi data runtime, sehingga tidak dinyatakan sudah diperbaiki di sesi tersebut.


## Diagnosis lanjutan: dimensi intrinsik nol (20 Oktober 2026)

Instrumen khusus development di `src/lib/cinematic-playback.ts` kini menyimpan maksimal 60 snapshot dalam `video.dataset.cinematicEvents`. Event: loadedmetadata, loadeddata, canplay, playing, emptied, abort, error, loadstart, resize, stalled, pause serta pemasangan/reset source dan cleanup controller. Snapshot mencatat currentTime, duration, preload, sourceAttribute/currentSrc, error, readyState/networkState, dimensi dan decoded frames. Listener dilepas ketika controller dibersihkan; tidak ada polling, console spam, perubahan UI, atau instrumentasi production. Source error dicatat sebelum source dihapus.

`scripts/verify-home-video-metadata-browser.mjs` membandingkan preload none/metadata/auto di Chrome uji, melalui localhost dan IP. Reduced motion menahan source sebelum pengujian memasang varian preload; kemudian preferensi uji dilepas sehingga controller aplikasi melakukan lazy playback normal. Konfigurasi preload aplikasi tetap none.

Hasil enam kasus decoder aktif: loadedmetadata pada readyState 1 sudah memiliki 1920?1080, kemudian loadeddata ? canplay ? playing dan decoded frames positif. Enam kasus decoder hardware sengaja dinonaktifkan: loadedmetadata tetap terjadi dengan 0?0, kemudian loadeddata ? canplay ? playing dan waktu berjalan tetapi decoded frames nol. Semua kasus hanya memasang source sekali, tanpa source-reset, abort/error/emptied setelah pemasangan. Jadi pada reproduksi ini dimensi nol bukan metadata yang belum tiba, bukan perubahan source, dan bukan race preload/IntersectionObserver. Tidak ada dasar untuk mengubah preload atau menambahkan load/retry spekulatif.

ffprobe/ffmpeg tidak tersedia di PATH. Pemeriksaan read-only box moov/trak/mdia/minf/stbl/stsd menghasilkan sample entry hvc1 1920?1080 dan mp4a; ini melengkapi diagnosis codec/decoder CDP sebelumnya. File MP4 tidak diubah. Artefak: `artifacts/home-video-zero-dimensions/hardware-preload-results.json`, `no-decode-preload-results.json`, `mp4-sample-entries.json`.

Batas: Chrome uji terisolasi bukan tab/profil pribadi pemilik yang gagal. Hasil ini membuktikan satu penyebab yang dapat menghasilkan gejala sama, bukan memastikan runtime decoder Chrome pemilik. Konfirmasi localhost bekerja sedangkan IP gagal pada profil pemilik masih perlu ditelusuri dengan event dan DevTools Media pada kedua origin. Setelah reload dan scroll ke video, salin riwayat Console:

```js
copy(document.querySelector('[data-cinematic-video]')?.dataset.cinematicEvents || 'diagnostik belum tersedia')
```

Bandingkan event loadedmetadata, videoWidth/videoHeight, currentSrc, source-reset/emptied/abort. Pada DevTools Media bandingkan kVideoTracks dan kVideoDecoderName; periksa Video Decode dan Problems Detected di chrome://gpu. Jika metadata 0?0 tanpa reset dan track/decoder video tidak tersedia, masalah berada pada jalur pengenalan/decoding track, bukan CSS. Jangan mengubah driver atau mematikan akselerasi hanya berdasarkan status playing.

Validasi lanjutan: lint, typecheck, production build, unit lifecycle, metadata 12 kasus, playback asli ID/EN 390/768/1440px, dan regresi homepage pada IP. Screenshot frame baru berada di `artifacts/home-video-rendering/metadata-verified-*` (localhost/IP, ID/EN, 390/1440px, timestamp 2/5 detik). Pengujian gambar menilai pixel video plus overlay, bukan hanya status playing. Perbaikan pada browser pribadi belum dinyatakan selesai.


## Peralihan sumber aktif ke H.264

Sumber homepage kini `batam-cinematic-h264.mp4`, hasil konversi resmi dengan FFmpeg instalasi pemilik. Sumber HEVC lama tetap dipertahankan. Temuan HEVC di atas adalah riwayat diagnosis, bukan codec sumber aktif. H.264 menghasilkan dimensi dan frame positif bahkan saat hardware decoding dinonaktifkan. Parameter, metadata, ukuran dan bukti pengujian terbaru tersedia di HOME_VIDEO.md dan VALIDATION.md. Tidak ada perubahan CSS/overlay/lifecycle.
