import type { Locale } from "./config";
import type { GalleryCategory } from "@/types/gallery";

const id = {
  title: "Galeri", headline: "Galeri Perjalanan & Destinasi", eyebrow: "Cerita dalam gambar",
  description: "Ruang visual destinasi dan dokumentasi perjalanan. Setiap foto akan diberi keterangan sesuai konteksnya.",
  empty: "Cerita visual sedang dipersiapkan", emptyDescription: "Foto berizin belum tersedia. Sementara itu, kenali destinasi melalui informasi yang telah diterbitkan.",
  all: "Semua foto", category: "Kategori foto", apply: "Tampilkan", reset: "Reset filter", noResults: "Belum ada foto untuk kategori ini.",
  open: "Perbesar foto", close: "Tutup galeri foto", previous: "Foto sebelumnya", next: "Foto berikutnya", counter: "Foto", of: "dari", unavailable: "Foto tidak tersedia", preview: "Pratinjau pengujian development — bukan dokumentasi perjalanan",
};
export type GalleryDictionary = typeof id;
const en: GalleryDictionary = {
  title: "Gallery", headline: "Travel & Destination Gallery", eyebrow: "Stories in pictures",
  description: "A space for destination visuals and travel photography. Each photograph is captioned to reflect its context.",
  empty: "Visual stories are being prepared", emptyDescription: "Licensed photography is not available yet. In the meantime, explore our published destination information.",
  all: "All photos", category: "Photo category", apply: "Show photos", reset: "Reset filters", noResults: "No photos in this category yet.",
  open: "Enlarge photo", close: "Close photo gallery", previous: "Previous photo", next: "Next photo", counter: "Photo", of: "of", unavailable: "Photo unavailable", preview: "Development test preview — not travel documentation",
};
export const galleryCategoryLabels: Record<Locale, Record<GalleryCategory, string>> = {
  id: { destinations: "Destinasi", "beaches-islands": "Pantai & pulau", landmarks: "Ikon destinasi", "travel-moments": "Momen perjalanan" },
  en: { destinations: "Destinations", "beaches-islands": "Beaches & Islands", landmarks: "Landmarks", "travel-moments": "Travel Moments" },
};
export function getGalleryDictionary(locale: Locale) { return locale === "id" ? id : en; }
