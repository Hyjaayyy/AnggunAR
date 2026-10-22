# Phase 5.2 — Dependency Security Risk Assessment

Tanggal pemeriksaan: 22 Oktober 2026. Proyek: Anggun AR Sukses Abadi. Cakupan: dependency yang terpasang, konfigurasi tooling, dan build lokal saat audit; bukan izin deployment.

## 1. Kesimpulan dan keputusan risiko

Audit terbaru menghasilkan **5 entri High, 0 Critical**, seluruhnya berasal dari **satu advisory `braces`**, GHSA-vfj7-8cjw-p6xm / CVE-2026-93687. `npm audit --omit=dev --json` menghasilkan **0 vulnerability**. Lima entri bukan lima celah independen: empat consumer mewarisi temuan dependency tersebut.

**Rekomendasi: risiko advisory ini dapat diterima sementara secara bersyarat untuk runtime production pada konfigurasi sekarang.** Tidak ditemukan jalur input pengunjung menuju parser rentan, dan paket yang dilaporkan tidak ditemukan pada trace/bundle production yang diperiksa. Temuan ini sendiri tidak terbukti sebagai blocker runtime website. Penerimaan risiko memerlukan pemilik yang bertanggung jawab, batas waktu peninjauan, dan kontrol tooling/CI di bagian 6; rekomendasi ini bukan penerimaan risiko oleh pemilik.

Risiko development belum ditutup. Apabila build/lint menerima pola glob tidak tepercaya atau dijalankan pada runner bersama tanpa isolasi, perlakukan kondisi itu sebagai **blocker alur CI tersebut** sampai diperbaiki. Status website keseluruhan tetap **NOT READY** mengikuti blocker bisnis dan batas pengujian perangkat/hosting dalam laporan sebelumnya. Tidak ada perubahan bisnis, noindex, atau izin release pada fase ini.

## 2. Inventaris dan dependency chain

```text
eslint-config-next@16.4.2              direct devDependency
└─ @next/eslint-plugin-next@16.4.2      transitive dev
   └─ fast-glob@3.3.1                  transitive dev; dipin exact oleh plugin
      └─ micromatch@4.0.8              transitive dev; constraint ^4.0.4
         └─ braces@3.0.3               transitive dev; constraint ^3.0.3
```

| Paket terpasang | Jenis | Severity npm | Penyebab dan penggunaan nyata |
| --- | --- | --- | --- |
| eslint-config-next 16.4.2 | Direct development | High | Konfigurasi lint Next/TypeScript yang benar-benar diimpor `eslint.config.mjs`; mewarisi temuan plugin |
| @next/eslint-plugin-next 16.4.2 | Transitive development | High | Aturan ESLint; utility pencarian root menggunakan fast-glob |
| fast-glob 3.3.1 | Transitive development | High | Mesin glob utility root; mewarisi temuan micromatch |
| micromatch 4.0.8 | Transitive development | High | Ekspansi pola melalui braces; mewarisi temuan braces |
| braces 3.0.3 | Transitive development | High | Parser/AST walker rekursif; lokasi advisory langsung |

Semua lima entri bertanda `dev: true` pada `package-lock.json`. `npm ls` dan `npm explain braces` sesuai dengan lockfile dan paket terpasang. Tidak ada override. Daftar advisory lengkap saat pemeriksaan hanya memuat advisory tersebut; hasil runtime nol bukan jaminan ketiadaan kerentanan yang belum diketahui.

## 3. Advisory resmi dan status patch

[GitHub Reviewed Advisory](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm) menyatakan versi terdampak `<=3.0.3`, dengan **belum ada patched version** saat diperiksa. Rekursi AST pada pola brace sangat dalam dapat menghabiskan stack; exception yang tidak ditangani dapat menghentikan proses Node. Dampak yang dinyatakan adalah availability, bukan pembacaan secret atau modifikasi data. Severity High tetap valid untuk paket; exploitability proyek bergantung asal pola dan pemanggilan parser.

Kode lokal `node_modules/braces/lib/compile.js:50` memanggil `walk(child, node)` secara rekursif. Rujukan upstream tambahan: [issue maintainer](https://github.com/micromatch/braces/issues/70) dan [compile.js 3.0.3](https://github.com/micromatch/braces/blob/3.0.3/lib/compile.js#L49-L53). npm melaporkan CVSS 3.1 7.5; halaman GitHub menggunakan CVSS 4.0 8.7. Keduanya memakai skema berbeda, tidak menunjukkan dua advisory.

| Paket | Latest registry saat audit | Evaluasi remediation |
| --- | --- | --- |
| braces | 3.0.3 | Sama dengan versi terdampak; tidak ada patch yang dapat dipasang |
| micromatch | 4.0.8 | Masih bergantung `braces ^3.0.3` |
| fast-glob | 3.3.3 | Masih bergantung micromatch `^4.0.8`; upgrade minor ini tidak menyelesaikan advisory, dan plugin memin 3.3.1 |
| @next/eslint-plugin-next | 16.4.2 | Masih memin fast-glob 3.3.1 |
| eslint-config-next | 16.4.2 | Sudah latest; consumer belum memutus rantai |

Saran otomatis npm adalah eslint-config-next 14.2.35, ditandai `isSemVerMajor: true`. Ini **downgrade lint config lintas major**, bukan patch kompatibel untuk Next 16/ESLint 9. Tidak dilakukan. Tidak menjalankan `npm audit fix --force`, override, downgrade, atau patch node_modules.

## 4. Bukti exposure per lingkungan

### Production runtime dan browser

- Aplikasi mengimpor dependency runtime Next, React, React DOM, dan lucide-react. Pencarian pada `src` tidak menemukan import braces/micromatch/fast-glob atau jalur pemrosesan glob dari query, form, route, dan media request.
- Setelah production build terbaru, **17 berkas `.nft.json`** diperiksa dengan parsing daftar file: tidak mencantumkan kelima paket pada chain ini. Ini mencakup trace server Next dan route hasil build.
- **146 berkas JavaScript** pada `.next/server` dan `.next/static` tidak memiliki kecocokan nama braces/micromatch/fast-glob. Pemeriksaan sourcemap menemukan kata micromatch hanya pada komentar `next/src/shared/lib/image-loader.ts`, bukan modul micromatch. Pencarian nama saja tidak membuktikan ketiadaan kode minified; kesimpulan dipadukan dengan trace, source import, dan tree dependency.
- Distribusi compiled Next yang diperiksa memiliki glob dan picomatch tersendiri; tidak ditemukan package compiled braces/micromatch yang dinyatakan sebagai paket pada chain audit ini. Tidak mengklaim seluruh vendor telah diaudit manual atau seluruh kerentanan bundled code terdeteksi npm.
- Tidak ditemukan input HTTP yang diteruskan ke `braces`. Mengirim URL dengan brace atau filename yang mengandung brace tidak otomatis sama dengan menyediakan pola pada API parser.

**Penilaian:** exposure advisory chain ini pada runtime/browser tidak ditemukan pada artefak yang diperiksa; risiko langsung terhadap pengunjung rendah berdasarkan bukti saat ini. Folder node_modules lengkap pada host bisa tetap menyimpan devDependency, walaupun tidak dibundel/dipanggil. Lingkungan deployment nyata belum diperiksa; pemisahan dependency deployment masih harus diverifikasi.

### Build-time

`package.json` memisahkan `build: next build` dari `lint: eslint . --max-warnings=0`. Build Next 16.4.2 terbaru lulus. Tracing `Module._load` melalui preload lokal merekam chain tersebut pada ESLint, tetapi tidak mencatat pemuatannya saat build. Tracing ini hanya mengamati CommonJS pada proses Node yang mewarisi preload, bukan seluruh kode native/Turbopack; hasil trace bukan bukti tunggal.

Tidak ditemukan hook build proyek yang mengubah input eksternal menjadi pola braces. Konfigurasi, sumber dan stylesheet berasal dari repository. Bila pipeline menjalankan lint sebelum build, exposure tooling tetap berlaku dalam job yang sama. Menjalankan kode PR tidak tepercaya juga mempunyai risiko eksekusi script/config lebih luas daripada advisory ini; label devDependency tidak membuat CI aman dengan sendirinya.

**Penilaian:** jalur rentan tidak teramati pada build saat ini; DoS job masih mungkin apabila konfigurasi/tooling masa depan menerima pola dari sumber tak tepercaya. Kontrol CI wajib dinilai sebelum release nyata.

### Development / ESLint

`eslint.config.mjs:2` dan `:3` memakai core-web-vitals serta TypeScript config Next, sehingga dependency bukan paket tidak terpakai. Trace lint aktual merekam pemuatan braces → micromatch → fast-glob → plugin. **Dimuat tidak sama dengan parser dipanggil.**

`node_modules/@next/eslint-plugin-next/dist/utils/get-root-dirs.js:11` mengimpor fast-glob; fungsi hanya melakukan `globSync` bila `context.settings.next.rootDir` berisi string/array. Konfigurasi ESLint efektif untuk homepage menghasilkan `rootDir: null`, default root adalah cwd, dan instrumentasi fungsi utility menghasilkan **0 panggilan globSync**. Config proyek tidak mengatur rootDir khusus. Pencarian plugin menemukan import fast-glob pada utility ini.

Jika rootDir diubah menjadi pola tidak tepercaya, jalur yang perlu diperhatikan adalah utility root → fast-glob `out/utils/pattern.js` → micromatch `braces(..., {expand:true})` → parser braces. Saat ini input ini berasal dari konfigurasi developer, bukan konten pengguna website. Nama file sumber yang sedang dilint tidak otomatis menjadi konfigurasi rootDir tersebut.

Probe terbatas pada Phase 5.1 belum mereproduksi stack overflow dengan satu bentuk input sintetis. Tidak dipakai untuk membatalkan advisory: hasil bergantung bentuk input, fungsi, dan batas stack. Tidak melakukan stress/DoS pada server development atau production.

**Penilaian:** paket rentan benar-benar tersedia pada tooling developer, tetapi jalur pola rentan tidak aktif melalui utility tersebut pada konfigurasi saat ini. Risiko residual utama adalah ketersediaan proses lint/CI bila trust boundary atau konfigurasi berubah. Belum ada bukti exploit dari pengunjung website.

## 5. Perubahan dan alternatif yang dievaluasi

Tidak ada perubahan dependency, lockfile, source aplikasi atau konfigurasi lint. Hanya laporan ini ditambahkan sebagai perubahan deliverable; harness dan bukti berada dalam `artifacts/phase5-2/` yang sudah diabaikan Git.

- Menghapus eslint-config-next akan menghilangkan cakupan aturan Next/aksesibilitas/React/TypeScript yang sedang digunakan; tidak layak dianggap cleanup dependency tidak terpakai. Transitive package tidak dapat dihapus terpisah tanpa merusak consumer.
- Mengganti fast-glob dengan glob/picomatch via override bukan substitusi API yang terbukti kompatibel. Mengganti lint config atau menulis fork plugin perlu audit aturan dan regresi terpisah; tidak dilakukan untuk membuat audit hijau.
- Menambahkan `nobrace`, batas panjang, atau catch pada satu API belum membuktikan perlindungan seluruh AST walker dan jalur ekspansi. Jangan memodifikasi vendor atau menambahkan guard spekulatif.
- Menunggu rilis patch upstream lalu memperbarui consumer secara kompatibel merupakan solusi yang disarankan. Evaluasi ulang tree, changelog, audit, lint, build dan gates sebelum menerima patch.
- Instalasi runtime-only atau packaging trace/standalone dapat mengurangi paket tooling pada server, tetapi bukan patch developer dan bukan perubahan deployment yang diterapkan dalam audit ini. Uji pada target hosting sebelum memilihnya; build memerlukan dependency development seperti TypeScript/PostCSS.

## 6. Mitigasi dan syarat penerimaan sementara

Rekomendasi berikut **belum diimplementasikan atau diverifikasi pada CI/hosting nyata**:

1. Tetapkan pemilik exception dan tinjau ulang paling lambat 30 hari, segera setelah patch tersedia, atau saat config/dependency/pipeline berubah. Catat advisory dan versi terpasang; jangan menyembunyikan temuan dari audit.
2. Pertahankan pola glob tooling sebagai konfigurasi repository yang ditinjau. Jangan membentuk rootDir/pola lint dari query, upload, webhook, input job bebas atau metadata PR. Review perubahan eslint config, package scripts dan lockfile sebagai kode yang bisa dieksekusi.
3. Gunakan `npm ci` dengan lockfile yang ditinjau pada runner sementara, akun non-admin, batas waktu/resource, tanpa mount host sensitif. Jangan memasang secret production pada job PR/fork tidak tepercaya. Batasi izin token, pisahkan job validasi PR dari release dan gunakan branch protection.
4. Jangan mengekspos dev server atau layanan lint sebagai endpoint publik. LAN developer hanya untuk jaringan tepercaya; allowedDevOrigins bukan pengganti kontrol akses jaringan.
5. Pisahkan tahap build dan runtime deployment; pastikan artefak/instalasi runtime tidak membawa tooling ESLint yang tidak diperlukan. Jangan melakukan prune pada workspace pengembangan aktif. Jalankan smoke/gates pada hasil packaging yang benar-benar akan dirilis.
6. Jalankan audit full dan omit-dev berkala; pantau advisory dan consumer upstream. Gagalkan release bila muncul jalur input remote menuju parser rentan, runtime inclusion baru, atau kontrol isolasi tidak dapat dipenuhi.

Tanpa kontrol tersebut, belum cukup bukti untuk menerima risiko CI yang memproses kontribusi tidak tepercaya. Untuk repository/config tepercaya saat ini, advisory lebih tepat dicatat sebagai residual development availability risk daripada mengklaim website production dapat diremote-crash oleh pengunjung.

## 7. Validasi dan batas bukti

| Pemeriksaan | Hasil Phase 5.2 |
| --- | --- |
| npm audit --json | Selesai; exit nonzero karena 5 High / 1 advisory |
| npm audit --omit=dev --json | PASS; 0 vulnerability |
| npm ls / explain / metadata registry | PASS; chain dan versi sesuai lockfile |
| ESLint | PASS; exit 0, batas warning 0 |
| Typecheck | PASS; exit 0 |
| Production build | PASS; exit 0, Next 16.4.2 Turbopack |
| Existing unit tests (`npm run test:unit`) | PASS; controller, resolver, markup media dengan mock |
| Effective ESLint root/glob probe | PASS; rootDir null, 0 globSync calls |
| Production trace/bundle inspection | Selesai; 17 trace, 146 JS, tidak ditemukan chain rentan |
| Production gates / browser regression / Range HTTP | **NOT TESTED ulang pada Phase 5.2**; tidak ada perubahan aplikasi/dependency. Bukti Phase 5.1 terpisah: 17/17 gates, 66/66 Range PASS |
| Perangkat fisik, clean CI, deployed packaging | **NOT TESTED** pada fase ini |

Build dan test lokal menggunakan telemetry Next yang dinonaktifkan. Tracing adalah preload lokal untuk observasi; tidak dipasang pada startup aplikasi. Tidak membuat akun/layanan, mengaktifkan monitoring, atau mengirim telemetry. Audit/npm metadata memakai registry npm; advisory dibaca dari GitHub resmi.

Bukti lokal: `artifacts/phase5-2/audit-full.json`, `audit-runtime.json`, `tree.json`, `explain.json`, `registry-*.json`, `exposure.json`, `lint-loads.jsonl`, serta `lint.log`, `build.log`, `typecheck.log`, `unit.log`. Harness `evidence.mjs` memeriksa package/lock, konfigurasi efektif dan artefak build; `trace.cjs` mengamati module load. Tidak ada temuan module load pada build sehingga file event build tidak dibuat. Bukti ini tidak mengaudit seluruh callsite vendor secara exhaustif.

## 8. Status Git dan tindak lanjut

Baseline Git Phase 5.2 berisi 103 entri perubahan yang sudah ada. Manifest dan lockfile dibandingkan dengan SHA-256 baseline setelah audit; keduanya identik. Seluruh perubahan sebelumnya dipertahankan. Laporan ini menambah satu file, sehingga status akhir 104 entri dan tidak ada deleted entry. Tidak melakukan commit, push, reset, deployment, major upgrade atau edit node_modules.

Prioritas berikutnya: pemilik meninjau exception terbatas di atas; verifikasi kontrol runner dan packaging pada rencana hosting nyata; pantau patch upstream. Blocker bisnis dan validasi perangkat/hosting dari [audit production](PRODUCTION_READINESS_AUDIT.md) tetap terpisah dari keputusan advisory ini. Riwayat perbaikan teknis dan hasil regresi tersedia di [Phase 5.1](PHASE_5_1_TECHNICAL_HARDENING.md).
