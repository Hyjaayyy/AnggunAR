import type { Locale } from "./config";
import type { DestinationCategory } from "@/types/destination";

const id = {
  title: "Destinasi", headline: "Jelajahi Destinasi Menarik di Batam", eyebrow: "Perspektif kepulauan",
  description: "Temukan berbagai tempat menarik, keindahan pesisir, dan pengalaman wisata yang dapat menjadi inspirasi perjalanan Anda.",
  home: "Beranda", breadcrumb: "Jejak navigasi", search: "Cari nama destinasi", category: "Kategori", all: "Semua destinasi", apply: "Terapkan filter", reset: "Reset filter", explore: "Jelajahi Destinasi",
  photo: "Foto destinasi sedang dipersiapkan", visual: "Ilustrasi pesisir — bukan foto lokasi", about: "Tentang destinasi", highlights: "Daya tarik destinasi", gallery: "Tiga perspektif destinasi",
  note: "Informasi destinasi sebagai inspirasi; bukan konfirmasi rute atau layanan perusahaan.",
  empty: "Informasi destinasi sedang dipersiapkan", noResults: "Tidak ada destinasi yang cocok", tryAgain: "Coba kata kunci lain atau reset filter.",
  related: "Paket wisata terkait", noPackages: "Belum ada paket resmi terkait yang diterbitkan. Jelajahi katalog untuk pembaruan informasi.", packages: "Jelajahi Paket Wisata", contact: "Hubungi Kami", sources: "Sumber informasi", results: "destinasi",
};
export type DestinationsDictionary = typeof id;
const en: DestinationsDictionary = {
  title: "Destinations", headline: "Explore Beautiful Destinations in Batam", eyebrow: "Island perspectives",
  description: "Discover fascinating places, coastal scenery, and travel experiences to inspire your next journey.",
  home: "Home", breadcrumb: "Breadcrumb", search: "Search destination name", category: "Category", all: "All Destinations", apply: "Apply filters", reset: "Reset filters", explore: "Explore Destination",
  photo: "Destination photography being prepared", visual: "Coastal illustration — not a location photograph", about: "About the destination", highlights: "Destination highlights", gallery: "Three destination perspectives",
  note: "Destination information for inspiration; not confirmation of company routes or services.",
  empty: "Destination information is being prepared", noResults: "No matching destinations", tryAgain: "Try another search or reset the filters.",
  related: "Related tour packages", noPackages: "No official related packages have been published yet. Explore the catalogue for updates.", packages: "Explore Tour Packages", contact: "Contact Us", sources: "Information sources", results: "destinations",
};
export const categoryLabels: Record<Locale, Record<DestinationCategory, string>> = {
  id: { "beaches-islands": "Pantai & pulau", landmarks: "Ikon destinasi", nature: "Alam", "culture-heritage": "Budaya & warisan", "city-attractions": "Atraksi kota" },
  en: { "beaches-islands": "Beaches & Islands", landmarks: "Landmarks", nature: "Nature", "culture-heritage": "Culture & Heritage", "city-attractions": "City Attractions" },
};
export function getDestinationsDictionary(locale: Locale) { return locale === "id" ? id : en; }
