import type { Destination, LocalPhoto } from "@/types/destination";

function photos(slug: string, id: string, en: string): Destination["images"] {
  const photo = (slot: string): LocalPhoto => ({ src: `/images/destinations/${slug}/${slot}.webp`, alt: { id: `${id} — ${slot}`, en: `${en} — ${slot}` }, position: "50% 50%" });
  return [photo("cover"), photo("detail-01"), photo("detail-02")];
}

// Published as destination information only, never as confirmation of a tour service.
// Geography checked against the official tourism sources below on 20 October 2026.
export const destinations: readonly Destination[] = [
  {
    id: "barelang", slug: "barelang-bridge", category: "landmarks", status: "published",
    location: { id: "Batam, Kepulauan Riau", en: "Batam, Riau Islands" },
    images: photos("barelang-bridge", "Jembatan Barelang", "Barelang Bridge"),
    content: {
      id: { name: "Jembatan Barelang", shortDescription: "Ikon jembatan Batam dengan latar perairan kepulauan.", description: "Jembatan Barelang merupakan salah satu ikon Batam, Kepulauan Riau. Bentang jembatan dan perairan di sekitarnya menjadi gambaran khas kawasan ini. Informasi ini disajikan sebagai pengenalan destinasi, tanpa menyatakan ketersediaan kunjungan dalam paket perusahaan.", highlights: ["Ikon jembatan Batam", "Lanskap perairan kepulauan"] },
      en: { name: "Barelang Bridge", shortDescription: "A Batam bridge landmark set against island waters.", description: "Barelang Bridge is a landmark of Batam in the Riau Islands. The bridge and surrounding waters form a distinctive island landscape. This introduction provides destination information and does not confirm inclusion in a company tour package.", highlights: ["A Batam bridge landmark", "An island waterscape"] },
    },
    relatedPackageIds: [], sources: [{ title: "Indonesia Travel — Barelang Bridge", url: "https://www.indonesia.travel/my/en/destination/sumatra/riau-islands/batam---barelang-bridge-architectural-icon-of-batam" }],
  },
  {
    id: "nongsa", slug: "nongsa-beach", category: "beaches-islands", status: "published",
    location: { id: "Timur laut Batam, Kepulauan Riau", en: "Northeastern Batam, Riau Islands" },
    images: photos("nongsa-beach", "Pantai Nongsa", "Nongsa Beach"),
    content: {
      id: { name: "Pantai Nongsa", shortDescription: "Kenali pesisir di bagian timur laut Pulau Batam.", description: "Pantai Nongsa berada di pesisir timur laut Pulau Batam. Kawasan pantai ini menjadi salah satu sisi pesisir yang dapat dikenal dalam eksplorasi informasi wisata Batam. Rincian kunjungan dan layanan perusahaan tidak dinyatakan tersedia pada halaman ini.", highlights: ["Pesisir timur laut Batam", "Lanskap pantai"] },
      en: { name: "Nongsa Beach", shortDescription: "Discover a coastal setting in northeastern Batam.", description: "Nongsa Beach lies on the northeastern coast of Batam Island. This coastal setting offers another perspective on Batam's geography. This page introduces the destination without confirming visit arrangements or company services.", highlights: ["Batam's northeastern coast", "A beach landscape"] },
    },
    relatedPackageIds: [], sources: [{ title: "Indonesia Travel — Pantai Nongsa", url: "https://www.indonesia.travel/id/id/destination/sumatra/riau-islands/pantai-nongsa" }],
  },
  {
    id: "abang", slug: "abang-island", category: "beaches-islands", status: "published",
    location: { id: "Selatan Batam, Kepulauan Riau", en: "South of Batam, Riau Islands" },
    images: photos("abang-island", "Pulau Abang", "Abang Island"),
    content: {
      id: { name: "Pulau Abang", shortDescription: "Perspektif bahari dari kepulauan di selatan Batam.", description: "Pulau Abang berada di selatan Batam, Kepulauan Riau. Perairan dan terumbu karang menjadi bagian dari pengenalan destinasi bahari ini. Halaman ini bukan konfirmasi aktivitas, transportasi, atau layanan wisata yang disediakan perusahaan.", highlights: ["Kepulauan di selatan Batam", "Lingkungan bahari dan terumbu karang"] },
      en: { name: "Abang Island", shortDescription: "A maritime perspective from the islands south of Batam.", description: "Abang Island lies south of Batam in the Riau Islands. Its waters and coral reefs are part of this maritime destination's character. This page does not confirm activities, transport, or tour services provided by the company.", highlights: ["Islands south of Batam", "A marine setting with coral reefs"] },
    },
    relatedPackageIds: [], sources: [{ title: "Indonesia Travel — Abang Island", url: "https://www.indonesia.travel/my/en/destination/sumatra/riau-islands/batam---abang-island" }],
  },
];
