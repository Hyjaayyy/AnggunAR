# Sitemap aplikasi

`/` mengarah ke `/id`. Ganti `{locale}` dengan `id` atau `en`.

| URL | Fungsi saat ini |
| --- | --- |
| `/{locale}` | Homepage Phase 2, tujuh section bilingual |
| `/{locale}/destinations` | Placeholder destinasi |
| `/{locale}/packages` | Katalog published; pencarian/filter query dan empty state |
| `/{locale}/packages/{slug}` | Detail published non-demo; galeri tepat tiga foto dan itinerary |
| `/{locale}/gallery` | Placeholder galeri |
| `/{locale}/booking` | Placeholder inquiry/booking tanpa form/backend |
| `/{locale}/about` | About Us khusus: delapan section, visi/misi/filosofi/nilai resmi bilingual |
| `/{locale}/contact` | Kontak belum dikonfirmasi |
| `/{locale}/faq` | Placeholder FAQ |
| `/{locale}/privacy` | Dokumen privasi belum diterbitkan |
| `/{locale}/terms` | Dokumen ketentuan belum diterbitkan |

Locale/slug tidak dikenal, draft publik, serta URL bertingkat di luar detail paket menghasilkan 404. Prefix locale case-sensitive. Pemilih bahasa mempertahankan halaman, query filter yang dikenal dan konteks paket inquiry. Preview `?preview=draft` hanya dapat membuka draft di development, bukan production.

## Rencana setelah Phase 2 (memerlukan ruang lingkup berikutnya)

- `/{locale}/destinations/{slug}`: detail destinasi, kategori, dan paket terkait.
- Detail paket telah diimplementasikan dalam Phase 3; data resmi dan foto menunggu pemilik. Booking tetap placeholder tanpa backend.
- Dashboard admin: struktur route belum ditentukan; perlu desain akses sebelum implementasi.

Dokumen ini merupakan peta route pengembangan, bukan sitemap XML untuk mesin pencari.
