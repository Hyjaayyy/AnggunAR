import type { Locale } from "./config";

export const pageSlugs = [
  "destinations", "packages", "gallery", "booking", "about", "contact",
  "faq", "privacy", "terms",
] as const;
export type PageSlug = (typeof pageSlugs)[number];

type Dictionary = {
  home: string;
  skip: string;
  navigation: string;
  language: string;
  stage: string;
  title: string;
  intro: string;
  explore: string;
  aboutIntro: string;
  focusTitle: string;
  focusDescription: string;
  preparation: string;
  preparationDescription: string;
  placeholder: string;
  contactPending: string;
  bookingPending: string;
  legalPending: string;
  backHome: string;
  footer: string;
  pages: Record<PageSlug, { title: string; description: string }>;
};

const dictionaries: Record<Locale, Dictionary> = {
  id: {
    home: "Beranda", skip: "Lewati ke konten", navigation: "Navigasi utama",
    language: "Pilih bahasa", stage: "Website dalam pengembangan",
    title: "Langkah awal untuk menjelajahi Batam.",
    intro: "Selamat datang di Anggun AR Sukses Abadi. Kami sedang menyiapkan website informasi wisata dan perjalanan di Batam, Kepulauan Riau.",
    explore: "Lihat rencana destinasi", aboutIntro: "Tentang perusahaan",
    focusTitle: "Berfokus pada Batam",
    focusDescription: "Informasi destinasi dan perjalanan untuk wisatawan domestik serta internasional sedang dipersiapkan.",
    preparation: "Persiapan perjalanan, dimulai di sini",
    preparationDescription: "Jelajahi bagian website yang akan dikembangkan secara bertahap.",
    placeholder: "Halaman ini sedang dipersiapkan. Konten akan ditambahkan setelah informasi resmi tersedia dan disetujui.",
    contactPending: "Email, nomor WhatsApp, alamat, dan peta belum tersedia. Kanal kontak akan ditampilkan setelah dikonfirmasi.",
    bookingPending: "Pemesanan online belum tersedia. Halaman ini belum menerima atau memproses data maupun pembayaran.",
    legalPending: "Dokumen ini belum diterbitkan. Ketentuan resmi akan ditambahkan setelah ditinjau dan disetujui.",
    backHome: "Kembali ke beranda",
    footer: "Fondasi website sedang dipersiapkan. Informasi layanan belum diterbitkan.",
    pages: {
      destinations: { title: "Destinasi", description: "Ruang untuk mengenal tujuan wisata di Batam dan sekitarnya." },
      packages: { title: "Paket Wisata", description: "Informasi paket, durasi, itinerary, dan harga akan tersedia setelah dikonfirmasi." },
      gallery: { title: "Galeri", description: "Dokumentasi perjalanan akan ditampilkan setelah foto dan izin penggunaannya tersedia." },
      booking: { title: "Inquiry & Booking", description: "Ruang untuk merencanakan kebutuhan perjalanan Anda di tahap berikutnya." },
      about: { title: "Tentang Kami", description: "Anggun AR Sukses Abadi menyiapkan website dengan fokus pada wisata dan perjalanan di Batam, Kepulauan Riau, Indonesia." },
      contact: { title: "Kontak", description: "Informasi kontak resmi perusahaan akan disediakan di halaman ini." },
      faq: { title: "Pertanyaan Umum", description: "Jawaban mengenai layanan dan perjalanan akan ditambahkan sesuai informasi resmi." },
      privacy: { title: "Kebijakan Privasi", description: "Ruang untuk kebijakan pengelolaan data pribadi." },
      terms: { title: "Syarat & Ketentuan", description: "Ruang untuk ketentuan penggunaan website dan layanan." },
    },
  },
  en: {
    home: "Home", skip: "Skip to content", navigation: "Main navigation",
    language: "Choose language", stage: "Website under development",
    title: "Your first step to exploring Batam.",
    intro: "Welcome to Anggun AR Sukses Abadi. We are preparing a website for travel and tourism information in Batam, Riau Islands.",
    explore: "Explore planned destinations", aboutIntro: "About the company",
    focusTitle: "Focused on Batam",
    focusDescription: "Destination and travel information for domestic and international visitors is being prepared.",
    preparation: "Travel planning starts here",
    preparationDescription: "Explore the sections we will develop step by step.",
    placeholder: "This page is being prepared. Content will be added once official information is available and approved.",
    contactPending: "Email, WhatsApp number, address, and map are not available yet. Contact channels will appear once confirmed.",
    bookingPending: "Online booking is not available yet. This page does not collect or process data or payments.",
    legalPending: "This document has not been published. Official terms will be added after review and approval.",
    backHome: "Back to home",
    footer: "The website foundation is being prepared. Service information has not been published yet.",
    pages: {
      destinations: { title: "Destinations", description: "A space to discover destinations in and around Batam." },
      packages: { title: "Tour Packages", description: "Packages, duration, itineraries, and pricing will be added once confirmed." },
      gallery: { title: "Gallery", description: "Travel photography will appear once images and usage permissions are available." },
      booking: { title: "Inquiry & Booking", description: "A space to plan your travel needs in a future phase." },
      about: { title: "About Us", description: "Anggun AR Sukses Abadi is preparing a website focused on travel and tourism in Batam, Riau Islands, Indonesia." },
      contact: { title: "Contact", description: "Official company contact information will be provided here." },
      faq: { title: "Frequently Asked Questions", description: "Answers about services and travel will be added based on official information." },
      privacy: { title: "Privacy Policy", description: "A space for the personal data management policy." },
      terms: { title: "Terms & Conditions", description: "A space for website and service terms." },
    },
  },
};

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export function isPageSlug(value: string): value is PageSlug {
  return pageSlugs.some((slug) => slug === value);
}
