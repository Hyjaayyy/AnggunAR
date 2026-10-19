# Sitemap aplikasi

`/` mengarah ke `/id`. Ganti `{locale}` dengan `id` atau `en`.

| URL | Fungsi saat ini |
| --- | --- |
| `/{locale}` | Homepage Phase 2, tujuh section bilingual |
| `/{locale}/destinations` | Placeholder destinasi |
| `/{locale}/packages` | Placeholder paket wisata |
| `/{locale}/gallery` | Placeholder galeri |
| `/{locale}/booking` | Placeholder inquiry/booking tanpa form/backend |
| `/{locale}/about` | Pengenalan sementara |
| `/{locale}/contact` | Kontak belum dikonfirmasi |
| `/{locale}/faq` | Placeholder FAQ |
| `/{locale}/privacy` | Dokumen privasi belum diterbitkan |
| `/{locale}/terms` | Dokumen ketentuan belum diterbitkan |

Locale tidak dikenal, slug tidak dikenal, dan detail bertingkat yang belum tersedia menghasilkan 404. Prefix locale bersifat case-sensitive. Pemilih bahasa mempertahankan halaman yang tersedia.

## Rencana setelah Phase 2 (memerlukan ruang lingkup berikutnya)

- `/{locale}/destinations/{slug}`: detail destinasi, kategori, dan paket terkait.
- `/{locale}/packages/{slug}`: detail, harga resmi, fasilitas, itinerary, dan booking CTA.
- Dashboard admin: struktur route belum ditentukan; perlu desain akses sebelum implementasi.

Dokumen ini merupakan peta route pengembangan, bukan sitemap XML untuk mesin pencari.
