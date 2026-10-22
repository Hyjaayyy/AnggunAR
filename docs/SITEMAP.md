# Sitemap aplikasi

`/` mengarah ke `/id`. Ganti `{locale}` dengan `id` atau `en`.

| URL | Fungsi saat ini |
| --- | --- |
| `/{locale}` | Homepage Phase 2, tujuh section bilingual |
| `/{locale}/destinations` | Katalog destinasi published, query q/category, empty state |
| `/{locale}/destinations/{slug}` | Detail destinasi, tiga foto, highlights, sumber dan relasi paket published |
| `/{locale}/packages` | Katalog published; pencarian/filter query dan empty state |
| `/{locale}/packages/{slug}` | Detail published non-demo; galeri tepat tiga foto dan itinerary |
| `/{locale}/gallery` | Galeri foto berizin published yang tersedia, kategori GET dan lightbox; saat ini empty state |
| `/{locale}/booking` | Placeholder inquiry/booking tanpa form/backend |
| `/{locale}/about` | About Us khusus: delapan section, visi/misi/filosofi/nilai resmi bilingual |
| `/{locale}/contact` | Kontak belum dikonfirmasi |
| `/{locale}/faq` | Placeholder FAQ |
| `/{locale}/privacy` | Dokumen privasi belum diterbitkan |
| `/{locale}/terms` | Dokumen ketentuan belum diterbitkan |

Locale/slug tidak dikenal, draft publik, serta URL bertingkat di luar detail paket/destinasi menghasilkan 404. Prefix locale case-sensitive. Pemilih bahasa mempertahankan halaman, query filter dikenal (kategori destinasi/galeri divalidasi) dan konteks paket inquiry. Preview `?preview=draft` hanya untuk paket di development, bukan production dan bukan destinasi/galeri.

## Rencana setelah Phase 2 (memerlukan ruang lingkup berikutnya)

- Detail destinasi dan galeri telah diimplementasikan pada Phase 4; foto resmi menunggu pemilik.
- Detail paket telah diimplementasikan dalam Phase 3; data resmi dan foto menunggu pemilik. Booking tetap placeholder tanpa backend.
- Dashboard admin: struktur route belum ditentukan; perlu desain akses sebelum implementasi.

Dokumen ini merupakan peta route pengembangan, bukan sitemap XML untuk mesin pencari.
