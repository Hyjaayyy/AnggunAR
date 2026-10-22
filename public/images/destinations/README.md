# Foto destinasi

Tambahkan foto berizin ke `[slug]/cover.webp`, `[slug]/detail-01.webp`, `[slug]/detail-02.webp`. Cover adalah slot pertama; total tepat tiga foto. Belum ada foto destinasi resmi.

Konfigurasi tiga src, alt ID/EN dan focal point berada di `src/data/destinations.ts`. Gunakan lebar 1600–2000 px untuk cover, 1000–1400 px untuk pendukung, kompres WebP sesuai kualitas. Foto hilang menampilkan fallback CSS tanpa request broken image. Lihat `docs/DESTINATIONS.md`.
