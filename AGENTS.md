# Instruksi pengembangan

- Gunakan Bahasa Indonesia untuk komunikasi dengan pemilik proyek.
- Kembangkan secara bertahap. Phase 2 (UI/UX dan homepage) sudah disetujui. Jangan lanjut Phase 3 tanpa persetujuan.
- Audit kode, Git, dan konfigurasi sebelum mengubah. Jangan menghapus pekerjaan pengguna atau mengubah file di luar workspace.
- Jelaskan perubahan penting sebelum implementasi. Utamakan perubahan kecil, aman, dapat ditinjau, serta arsitektur yang sudah tersedia.
- Gunakan Next.js App Router, TypeScript strict, Tailwind CSS, dan Server Components jika sesuai. Hindari `any` dan dependency yang tidak diperlukan.
- Pisahkan konfigurasi bisnis, terjemahan, presentasi, dan business logic. Gunakan nama Anggun AR Sukses Abadi secara konsisten dari konfigurasi.
- Pertahankan `/id` dan `/en`, validasi locale, fallback `/` ke `/id`, 404 untuk URL tak dikenal, dan perpindahan bahasa yang mempertahankan halaman.
- Gunakan semantic HTML, navigasi keyboard, focus indicator, kontras yang terbaca, dan layout responsif.
- Jangan mengarang kontak, harga, fasilitas, testimoni, legalitas, maupun informasi resmi. Data yang belum dikonfirmasi tetap `null` atau placeholder jelas.
- Jangan membuat backend atau keberhasilan booking palsu. Jangan mengumpulkan data pribadi sebelum alur penyimpanan, keamanan, dan privasi disetujui.
- Jangan menambah database, Prisma, autentikasi, pembayaran, dashboard, deployment, atau layanan eksternal dalam Phase 1.
- Jangan menaruh secret di source code; abaikan file `.env` dan artefak lokal melalui `.gitignore`.
- Jalankan lint dan production build setelah implementasi; jalankan pemeriksaan tipe dan routing bila relevan. Laporkan error serta batas verifikasi secara transparan.
- Perbarui dokumentasi jika arsitektur, konfigurasi, routing, atau perintah berubah. Jangan membuat folder kosong sekadar memenuhi struktur rencana.
