# Phase 6.2 — Owner Review Preparation

Tanggal: 22 Oktober 2026. Lingkup: persiapan lokal, bukan izin deployment.

## Ringkasan

Branch lokal aktif: `preview/owner-review`, dibuat dari HEAD `8f8c0155489569286b7f607795beb1316b599b18`. Snapshot status sebelum dan sesudah perpindahan branch identik. Seluruh pekerjaan sebelumnya dipertahankan. `master` dan `origin/master` tetap menunjuk HEAD yang sama; tidak ada commit baru atau perubahan remote. Branch baru belum memiliki upstream.

Implementasi owner-review tersedia tetapi **default OFF dan belum diaktifkan di Vercel**. Pengujian HTTPS lokal membuktikan penolakan anonim dan pembatasan lingkungan, bukan bukti konfigurasi keamanan hosting sebenarnya. Status bisnis tetap **NOT READY**; paket belum disetujui dan legal/domain/pengujian deployment belum selesai.

## Mekanisme perlindungan

`src/lib/owner-review.ts` adalah modul `server-only`. Konfigurasi wajib lengkap: `OWNER_REVIEW_ENABLED=true`, username 3–64 karakter alfanumerik/underscore/hyphen, password 32–256 karakter tanpa CR/LF/colon. Kredensial sebenarnya tidak dibuat atau disimpan dalam source, `.env.example`, laporan, maupun log pengujian.

Pada build production fitur hanya memenuhi syarat bila `VERCEL=1` dan `VERCEL_ENV=preview`. `NODE_ENV` tidak diubah. `VERCEL_ENV=production`, konfigurasi hilang/tidak valid, atau flag OFF menutup akses meskipun kredensial benar. Development lokal boleh memakai konfigurasi server yang sama; akses draft development anonim sebelumnya sengaja ditutup sebagai bagian kebutuhan otorisasi ini.

Setiap request review memerlukan HTTP Basic Authorization yang diverifikasi server menggunakan digest SHA-256 dan `timingSafeEqual`. Header izin buatan klien tidak dipercaya. Query `?preview=draft` hanya memilih mode tampilan, bukan autentikasi. Hosted review memerlukan HTTPS; proxy menolak HTTP dengan 403 tanpa menawarkan challenge kredensial. HTTPS anonim dengan mode review aktif mendapat 401 dan challenge Basic.

Halaman dan metadata memverifikasi ulang request, lalu resolver menerima capability objek yang diterbitkan modul server dan dicatat dalam WeakMap. Boolean `true`, objek tiruan, capability modul lain, dan capability setelah rotasi kredensial ditolak. Tidak ada endpoint login/data draft anonim yang ditambahkan. Informasi draft tidak ditemukan pada bundle browser `.next/static` melalui pencarian nama/slug sampel; pemeriksaan ini bersifat sampel, bukan audit seluruh kemungkinan transformasi bundle.

Listing, detail, proxy, resolver, dan metadata ID/EN memakai gate yang konsisten. Dengan akses valid, enam draft pasar dan tiga demo existing dapat ditinjau; status data tetap draft. Resolver default tetap hanya memberikan paket published non-demo. Halaman booking tidak memperoleh capability, termasuk ketika query draft dan Authorization dikirim. CTA draft tetap inquiry/permintaan penawaran melalui konfigurasi kontak, tanpa konfirmasi booking.

Respons review memakai `Cache-Control: private, no-store, max-age=0` dan noindex. Proxy juga meminta `Vary: Authorization`; Next menulis ulang Vary pada HTML menjadi varian RSC/encoding. Karena itu keamanan cache tidak diasumsikan dari Vary: pengujian HTTPS memeriksa no-store dan request anonim sesudah respons berotorisasi tetap 401. Perilaku CDN Vercel masih harus diverifikasi. Noindex tetap dipertahankan tetapi bukan pengamanan akses.

Basic Auth menggunakan cache kredensial browser, tanpa sesi atau tombol logout aplikasi. Gunakan profil/private window terpisah, tutup sesi browser setelah review, dan rotasi/cabut kredensial melalui konfigurasi Preview serta redeploy setelah review selesai. Kredensial kuat tidak menggantikan pembatasan percobaan pada ingress.

## Berkas perubahan Phase 6.2

- Baru: `src/lib/owner-review.ts`, `scripts/lib/ts-module.mjs`, `scripts/verify-owner-review.mjs`, `scripts/verify-owner-review-https.mjs`, laporan ini.
- Diperbarui: `src/lib/tour-packages.ts`, `src/app/[locale]/packages/page.tsx`, `src/app/[locale]/packages/[slug]/page.tsx`, `src/proxy.ts`.
- Konfigurasi contoh dan tes: `.env.example`, `scripts/verify-packages.mjs`, `scripts/verify-market-catalog.mjs`, `scripts/run-production-checks.mjs`.
- Artefak bukti hanya di `artifacts/phase6-2/` yang diabaikan Git. Tidak ada dependency baru, perubahan media, CSS, Hero, Cinematic Video, konten bisnis, atau noindex.

## Prasyarat Vercel sebelum aktivasi

Belum ada akun/project Vercel yang diperiksa atau diubah. Semua item berikut masih wajib diverifikasi sebelum mengaktifkan flag:

1. Deployment Protection benar-benar aktif untuk deployment/alias Preview yang dipakai owner; uji tanpa login dari browser lain. Basic Auth aplikasi tidak bergantung pada header identitas Vercel, tetapi perlindungan platform tetap menjadi syarat operasional review ini.
2. Kredensial acak kuat hanya disimpan sebagai server environment **Preview**; tidak pada Production, `NEXT_PUBLIC_*`, URL, Git, screenshot, atau pesan/log publik. Batasi akses pengelola konfigurasi.
3. System environment Vercel tersedia dan menunjukkan Preview. Jika tidak tersedia fitur sengaja tertutup. Jangan memalsukan `NODE_ENV` atau mengisi `VERCEL_ENV=preview` pada production publik.
4. HTTPS dan trusted ingress/proxy meneruskan protokol dengan benar; blok akses langsung origin yang melewati perlindungan. Proxy memeriksa URL protokol dan halaman memeriksa `x-forwarded-proto` disertai kredensial valid.
5. Verifikasi CDN tidak menyimpan respons berotorisasi; ulangi tes anonim setelah respons berotorisasi, HTML/RSC/navigation/metadata pada URL hosted sebenarnya. Pastikan Authorization tidak dicatat dalam observability.
6. Konfigurasikan pembatasan percobaan/rate limiting pada ingress sesuai kemampuan platform, tanpa menambahkan layanan otomatis dari audit ini.
7. Periksa Production Branch dan integrasi Git sebelum impor/push. Branch lokal bukan jaminan push tidak men-deploy: project yang telah terhubung dapat otomatis membuat deployment. Jangan mempromosikan branch review ke production.
8. Setelah ada izin deployment terpisah: uji kredensial benar/salah, URL langsung ID/EN, booking guard, noindex, asset/video Range dan perangkat fisik melalui HTTPS. Flag tetap OFF sampai perlindungan diverifikasi.

Rujukan resmi: [Deployment Protection](https://vercel.com/docs/deployment-protection), [integrasi Git](https://vercel.com/docs/git), [system environment variables](https://vercel.com/docs/environment-variables/system-environment-variables). Rujukan menjelaskan kemampuan platform, bukan bukti pengaturan akun proyek ini.

## Audit berkas untuk commit mendatang

**Belum menjalankan git add. Index kosong.** Manifest lokal terperinci tersedia di `artifacts/phase6-2/commit-candidates.txt` dan `file-review.json`; manifest adalah bahan review, bukan instruksi staging otomatis. Kandidat mencakup berkas existing yang diperlukan snapshot lengkap, bukan hanya diff fase ini. Jangan memakai `git add .` tanpa meninjau daftar.

Yang perlu masuk snapshot commit setelah persetujuan:

- Source `src/` lengkap termasuk konfigurasi bisnis/i18n/data, resolver, route, proxy, dan modul otorisasi baru; pertahankan perbaikan fase sebelumnya.
- `src/pages/_error.tsx` dan infrastruktur 404 existing untuk perbaikan Range, `next.config.ts`, `package.json`, lockfile, konfigurasi TypeScript/ESLint/PostCSS, `.gitignore` dan `.env.example` tanpa kredensial.
- Skrip `scripts/` beserta helper yang diimpor, termasuk seluruh regression gates dan tes owner-review.
- Aset `public/` yang digunakan: **`public/videos/home/batam-cinematic-h264.mp4`** (10.907.407 byte), video asli HEVC dan README media existing tetap dipertahankan; jangan menghapus file asli. Seluruh aset lain yang direferensikan juga harus ikut ditinjau.
- README publik setelah pemeriksaan isi. Dokumen arsitektur/pengoperasian hanya setelah review informasi internal.

H.264 masih untracked sehingga wajib dipilih secara eksplisit sebelum commit mendatang. SHA-256 tetap `ebb88925a87f2bcfe491a73117597f2010384edfd831d1bafd7e5c05f947b4a1`. Poster yang dikonfigurasi belum tersedia dari fase sebelumnya; fallback visual tetap tersedia, tidak membuat media pengganti dalam fase ini.

Yang harus dikecualikan:

- `.env.local` dan semua `.env*` selain template `.env.example` yang kosong untuk kredensial.
- `.next`, `node_modules`, `.npm-cache`, profil browser, coverage, log, `.vercel`, `.aws`, `.ssh`, build/cache dan seluruh `artifacts/`.
- Private key/sertifikat tes lokal `artifacts/phase6-2/tls/`, token, password, credential/service-account JSON.
- Dokumen audit internal `docs/PHASE_*`, laporan diagnostik dan `PROJECT.md` ditahan untuk review/redaksi sebelum staging ke repository yang mungkin publik. Daftar lengkap dokumen ditahan ada pada `file-review.json`. Berkas tracked tidak dihapus atau dikeluarkan dari riwayat; keputusan publikasi dokumentasi terpisah diperlukan.

Pemindaian pola private key, GitHub token, AWS access key, dan assignment public owner-review secret tidak menemukan temuan pada kandidat teks. Pemeriksaan nama/path sensitif juga kosong, dan `git check-ignore` mengonfirmasi pengecualian `.env.local`, key tes, build, dependency, dan `.vercel`. Ini bukan jaminan pemindaian secret historis menyeluruh. Tidak ada nilai secret ditampilkan. Review lisensi/hak distribusi media dan isi README tetap diperlukan sebelum repository dibuat publik.

Gate aplikasi melindungi akses HTTP, bukan isi repository: data draft memang berada pada source server yang akan dikirim ke GitHub. Jika owner menghendaki draft bersifat rahasia, repository harus private dengan akses terbatas. Visibilitas repository dan izin kolaborator belum diverifikasi melalui akun GitHub; jangan menganggap autentikasi halaman menyembunyikan source pada repository publik.

## Hasil validasi

| Pemeriksaan | Hasil / bukti |
|---|---|
| ESLint | PASS, `artifacts/phase6-2/lint-final.log` |
| Production build | PASS, `build-final.log` |
| TypeScript | PASS, `typecheck-final.log` |
| Unit video existing | PASS, `unit-final.log` |
| Unit owner-review | PASS; 18 kasus kebijakan/anonim serta credential, HTTPS, capability, metadata, booking, rotasi; `owner-unit-final.log` |
| HTTPS integration lokal | PASS pada build production nyata; ID/EN, seluruh enam detail draft, 401 anonim/header palsu, 200 terotorisasi, no-store/cache isolation, booking guard; `owner-https-final.log`, `https-results.json` |
| Production publik dan default OFF | PASS pada server production lokal terpisah dengan konfigurasi lingkungan disimulasikan; draft tersembunyi walaupun kredensial dikirim |
| Production gates | **21/21 PASS**, `artifacts/phase6-2/suite.json` dan `production-gates.log`; localhost:3100 dan LAN aktif 192.168.88.189:3100 |
| Proteksi berkas existing | 34 hash sama dengan baseline fase sebelumnya, termasuk Hero/video/media/config |
| Vercel sebenarnya, CDN/Deployment Protection | NOT TESTED; belum deployment/akses akun |
| Perangkat fisik untuk owner-review HTTPS | NOT TESTED; automation/HTTP client lokal bukan bukti perangkat fisik |

Harness HTTPS membuat sertifikat khusus fixture localhost di folder ignored, memverifikasi CA saat request, dan menggunakan password acak sementara di memori proses. Tidak memasang sertifikat sistem, membuat akun, atau mengirim data ke pihak ketiga. Pemeriksaan awal Vary gagal karena Next mengganti header tersebut; assertion diperbaiki untuk menguji no-store dan isolasi anonim nyata, tanpa melonggarkan pemeriksaan otorisasi.

Suite lengkap mencakup routing ID/EN, gate owner-review default OFF, paket/katalog/booking, kontak/CTA, destinasi, homepage/Hero/About, 66 kasus HTTP Range dengan pemeriksaan byte, 54 pemeriksaan lifecycle video, rendering/frame nyata melalui browser automation, panel diagnostik, production smoke dan recovery. Rendering membedakan frame bergerak dari fallback navy; tidak mengubah overlay atau playback. Tampilan mobile yang diuji adalah emulasi viewport, bukan perangkat fisik. Browser automation menggunakan browser CDP lokal; tidak mengklaim Safari/iPhone/Android fisik atau browser owner telah diuji untuk mekanisme autentikasi baru.

Manifest akhir memuat 161 berkas tracked/untracked non-ignored: 140 kandidat non-dokumen internal dan 21 dokumen ditahan untuk review. Git status berisi 127 entri (direktori untracked dapat teragregasi), index kosong; `HEAD`, `master`, dan local tracking `origin/master` tetap pada hash awal. Tidak melakukan fetch atau mengubah referensi remote. `git diff --check` lulus; pesan konversi LF/CRLF Git tidak mengubah working tree. Semua 34 berkas terlindungi tetap cocok hash baseline, dan H.264 tidak berubah.

## Status dan langkah berikutnya

Implementasi siap ditinjau untuk commit selektif **setelah persetujuan pengguna dan review daftar berkas**. Push juga membutuhkan izin terpisah dan pemeriksaan integrasi Git/Vercel agar tidak memicu deployment yang belum disetujui. Belum aman mengaktifkan owner-review hosted sampai prasyarat platform di atas terbukti. Ini bukan status READY production.

Tidak menjalankan staging, commit, push, reset, clean, stash, atau deployment. Seluruh perubahan lokal tetap berada di working tree pada branch review. Master dan remote tidak berubah.
