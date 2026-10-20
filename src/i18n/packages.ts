import type { Locale } from "./config";

const id = {
  title: "Paket Wisata", description: "Kenali pilihan perjalanan dan rincian paket yang telah diterbitkan oleh Anggun AR Sukses Abadi.", home: "Beranda",
  search: "Cari nama paket", destination: "Destinasi", category: "Kategori", duration: "Durasi", all: "Semua", apply: "Terapkan filter", reset: "Reset filter",
  empty: "Perjalanan berikutnya sedang dipersiapkan", emptyDescription: "Belum ada paket resmi yang diterbitkan. Silakan kunjungi halaman kontak untuk pembaruan informasi.",
  noResults: "Tidak ada paket yang cocok", noResultsDescription: "Coba kata kunci lain atau reset filter untuk melihat seluruh pilihan.",
  contact: "Halaman kontak", detail: "Lihat Detail", price: "Hubungi untuk harga", pending: "Belum dikonfirmasi", days: "hari", photo: "Foto sedang dipersiapkan",
  overview: "Tentang perjalanan", itinerary: "Itinerary", itineraryPending: "Rincian itinerary akan dikonfirmasi.", day: "Hari", included: "Termasuk", excluded: "Tidak termasuk", important: "Informasi penting",
  inquiry: "Tanyakan Paket Ini", inquiryNote: "Inquiry online belum tersedia. Tautan ini hanya membuka informasi paket, tanpa mengirim data atau memproses booking.",
  preview: "DEMO / DRAFT — Pratinjau pengembangan, bukan penawaran resmi", previewLink: "Pratinjau konsep (pengembangan)", results: "paket", bookingContext: "Konteks paket", bookingUnavailable: "Paket tidak tersedia untuk inquiry.",
};
export type PackagesDictionary = typeof id;
const en: PackagesDictionary = {
  title: "Tour Packages", description: "Explore published journeys and package details from Anggun AR Sukses Abadi.", home: "Home",
  search: "Search package name", destination: "Destination", category: "Category", duration: "Duration", all: "All", apply: "Apply filters", reset: "Reset filters",
  empty: "Your next journey is being prepared", emptyDescription: "No official packages have been published yet. Visit our contact page for information updates.",
  noResults: "No matching packages", noResultsDescription: "Try another search or reset the filters to explore all options.",
  contact: "Contact page", detail: "View Details", price: "Contact for pricing", pending: "To be confirmed", days: "days", photo: "Photography being prepared",
  overview: "About the journey", itinerary: "Itinerary", itineraryPending: "Detailed itinerary will be confirmed.", day: "Day", included: "Included", excluded: "Excluded", important: "Important information",
  inquiry: "Ask About This Package", inquiryNote: "Online inquiry is not available yet. This link only opens package information; no data is sent and no booking is processed.",
  preview: "DEMO / DRAFT — Development preview, not an official offer", previewLink: "Preview concepts (development)", results: "packages", bookingContext: "Package context", bookingUnavailable: "This package is unavailable for inquiry.",
};
export function getPackagesDictionary(locale: Locale): PackagesDictionary { return locale === "id" ? id : en; }
