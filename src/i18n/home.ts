import type { Locale } from "./config";

type SectionCopy = { eyebrow: string; title: string; description: string };
type DestinationCopy = { name: string; category: string; description: string };
type PackageCopy = { name: string; category: string; description: string };
type HomeDictionary = {
  metaDescription: string;
  hero: { eyebrow: string; title: string; accent: string; description: string; primary: string; secondary: string; location: string; visualLabel: string; caption: string; scroll: string };
  introduction: SectionCopy & { link: string; note: string; sideTitle: string; sideDescription: string };
  destinations: SectionCopy & { all: string; link: string; items: [DestinationCopy, DestinationCopy, DestinationCopy] };
  packages: SectionCopy & { all: string; status: string; price: string; link: string; items: [PackageCopy, PackageCopy, PackageCopy] };
  benefits: SectionCopy & { items: { title: string; description: string }[] };
  inspiration: SectionCopy & { label: string; visualLabel: string; link: string; caption: string };
  final: SectionCopy & { primary: string; secondary: string; note: string };
  navigation: { menu: string; close: string; cta: string; explore: string; company: string; legal: string; footer: string; location: string; availability: string };
};

const homeDictionaries: Record<Locale, HomeDictionary> = {
  id: {
    metaDescription: "Temukan inspirasi perjalanan Batam bersama Anggun AR Sukses Abadi. Jelajahi destinasi pesisir, ikon kota, dan konsep wisata Kepulauan Riau.",
    hero: {
      eyebrow: "Batam & Kepulauan Riau",
      title: "Jeda dari rutinitas.", accent: "Dekat dengan cerita baru.",
      description: "Dari pesisir yang tenang hingga ikon kepulauan. Temukan inspirasi untuk menikmati sisi lain Batam, dengan ritme perjalanan Anda sendiri.",
      primary: "Jelajahi destinasi", secondary: "Lihat konsep paket",
      location: "Batam, Indonesia", visualLabel: "Ilustrasi konsep · foto destinasi belum tersedia",
      caption: "Pesisir, pulau, dan ruang untuk menjelajah.", scroll: "Kenali perjalanan Anda",
    },
    introduction: {
      eyebrow: "Tentang Anggun AR", title: "Perjalanan yang berawal dari rasa ingin tahu.",
      description: "Anggun AR Sukses Abadi berfokus pada wisata dan perjalanan di Batam, Kepulauan Riau. Website ini menjadi ruang untuk mengenal destinasi dan menemukan ide perjalanan, baik bagi wisatawan domestik maupun internasional.",
      link: "Kenali kami lebih dekat", note: "Profil dan informasi layanan resmi sedang dipersiapkan.",
      sideTitle: "Satu kawasan. Banyak cara menikmati.", sideDescription: "Ikon kota, suasana pantai, atau perspektif baru dari kepulauan. Mulai dari hal yang paling ingin Anda temukan.",
    },
    destinations: {
      eyebrow: "Pilihan inspirasi", title: "Tiga sudut Batam untuk cerita Anda.",
      description: "Kenali beberapa tujuan wisata Batam. Pilihan ini adalah inspirasi destinasi, bukan konfirmasi rute atau layanan yang tersedia.",
      all: "Semua destinasi", link: "Lihat halaman destinasi",
      items: [
        { name: "Jembatan Barelang", category: "Ikon Batam", description: "Perspektif kepulauan dari salah satu ikon Batam." },
        { name: "Pantai Nongsa", category: "Pesisir & pantai", description: "Inspirasi jeda di kawasan pantai Batam." },
        { name: "Pulau Abang", category: "Jelajah pulau", description: "Kenali sisi bahari dalam rencana perjalanan Anda." },
      ],
    },
    packages: {
      eyebrow: "Rencana perjalanan", title: "Temukan gaya liburan Anda.",
      description: "Koleksi konsep untuk membantu membayangkan perjalanan berikutnya. Paket resmi, durasi, fasilitas, dan ketersediaan masih menunggu konfirmasi.",
      all: "Lihat halaman paket", status: "Konsep paket", price: "Harga belum ditetapkan", link: "Tentang paket wisata",
      items: [
        { name: "Batam City Escape", category: "Kota & ikon", description: "Ide perjalanan untuk mengenal sisi kota dan ikon Batam." },
        { name: "Coastal Slow Days", category: "Pantai & suasana", description: "Inspirasi menikmati pesisir dengan tempo yang lebih santai." },
        { name: "Island Perspectives", category: "Pulau & bahari", description: "Gambaran perjalanan dengan kepulauan sebagai titik awal." },
      ],
    },
    benefits: {
      eyebrow: "Why choose us", title: "Rencana yang jelas. Pilihan yang terasa pas.",
      description: "Hal-hal yang layak Anda pertimbangkan saat memilih perjalanan. Detail layanan Anggun AR akan dilengkapi setelah dikonfirmasi.",
      items: [
        { title: "Mulai dari minat Anda", description: "Pilih suasana kota, pantai, atau pulau sebagai arah awal perjalanan." },
        { title: "Kenali detailnya", description: "Periksa itinerary, fasilitas, dan biaya resmi sebelum menentukan pilihan." },
        { title: "Ruang untuk merencanakan", description: "Pertimbangkan waktu, peserta, dan kebutuhan perjalanan sejak awal." },
      ],
    },
    inspiration: {
      eyebrow: "Catatan kepulauan", title: "Kadang, yang Anda perlukan hanya sudut pandang baru.",
      description: "Bayangkan pagi yang lebih pelan, garis pesisir, dan waktu untuk memperhatikan sekitar. Simpan ide kecil itu sebagai awal cerita perjalanan Anda.",
      label: "01 / Pesisir & kepulauan", visualLabel: "Ilustrasi editorial · bukan foto lokasi", link: "Temukan inspirasi destinasi",
      caption: "Ruang untuk berhenti sejenak, lalu menjelajah lagi.",
    },
    final: {
      eyebrow: "Cerita berikutnya", title: "Mulai bayangkan perjalanan Anda.",
      description: "Jelajahi konsep wisata Batam atau kunjungi halaman kontak untuk melihat pembaruan informasi resmi.",
      primary: "Lihat konsep paket", secondary: "Halaman kontak", note: "Paket dan kanal kontak resmi sedang dipersiapkan. Pemesanan belum tersedia.",
    },
    navigation: { menu: "Buka menu", close: "Tutup menu", cta: "Jelajahi paket", explore: "Jelajahi", company: "Perusahaan", legal: "Informasi", footer: "Inspirasi wisata dan perjalanan di Batam, Kepulauan Riau, untuk cerita berikutnya.", location: "Fokus perjalanan · Batam, Indonesia", availability: "Website sedang dikembangkan · Informasi layanan menunggu konfirmasi" },
  },
  en: {
    metaDescription: "Find Batam travel inspiration with Anggun AR Sukses Abadi. Explore coastal destinations, island landmarks, and Riau Islands travel concepts.",
    hero: {
      eyebrow: "Batam & Riau Islands", title: "A pause from the everyday.", accent: "A little closer to discovery.",
      description: "From quiet coastlines to island landmarks. Find inspiration to experience another side of Batam, at a pace that feels like you.",
      primary: "Explore destinations", secondary: "View trip concepts", location: "Batam, Indonesia",
      visualLabel: "Concept illustration · destination photography pending", caption: "Coastlines, islands, and room to explore.", scroll: "Find your way to explore",
    },
    introduction: {
      eyebrow: "About Anggun AR", title: "Every journey starts with curiosity.",
      description: "Anggun AR Sukses Abadi focuses on travel and tourism in Batam, Riau Islands. This website is a space to discover destinations and explore travel ideas for domestic and international visitors.",
      link: "Get to know us", note: "The official company profile and service information are being prepared.",
      sideTitle: "One region. Different ways to experience it.", sideDescription: "City landmarks, coastal moments, or a new island perspective. Start with what you would most like to discover.",
    },
    destinations: {
      eyebrow: "Places to imagine", title: "Three sides of Batam. Your own story.",
      description: "Discover a few of Batam's destinations. These are travel inspirations, rather than confirmation of available routes or services.", all: "All destinations", link: "View destinations page",
      items: [
        { name: "Barelang Bridge", category: "Batam landmark", description: "An island perspective from one of Batam's landmarks." },
        { name: "Nongsa Beach", category: "Coast & beach", description: "Inspiration for a pause along Batam's coast." },
        { name: "Abang Island", category: "Island discovery", description: "Explore a maritime perspective for your travel plans." },
      ],
    },
    packages: {
      eyebrow: "Travel concepts", title: "Find your kind of getaway.",
      description: "A collection of ideas for imagining your next journey. Official packages, duration, inclusions, and availability are awaiting confirmation.", all: "View packages page", status: "Trip concept", price: "Pricing to be confirmed", link: "About tour packages",
      items: [
        { name: "Batam City Escape", category: "City & landmarks", description: "A travel idea for discovering Batam's city side and landmarks." },
        { name: "Coastal Slow Days", category: "Beach & atmosphere", description: "Inspiration for experiencing the coast at a slower pace." },
        { name: "Island Perspectives", category: "Islands & sea", description: "An imagined journey with the islands as its starting point." },
      ],
    },
    benefits: {
      eyebrow: "Why choose us", title: "Clear plans. Choices that feel right.",
      description: "Things worth considering when choosing a journey. Anggun AR service details will be added once confirmed.",
      items: [
        { title: "Start with your interests", description: "Let the city, the coast, or the islands shape your first travel ideas." },
        { title: "Know the details", description: "Review the official itinerary, inclusions, and costs before choosing." },
        { title: "Make room to plan", description: "Consider dates, participants, and travel needs from the beginning." },
      ],
    },
    inspiration: {
      eyebrow: "Island notes", title: "Sometimes, all you need is a different perspective.",
      description: "Imagine a slower morning, a stretch of coastline, and time to notice what surrounds you. Let that small idea become the start of your next travel story.",
      label: "01 / Coast & islands", visualLabel: "Editorial illustration · not a location photograph", link: "Find destination inspiration", caption: "A little room to pause, before exploring again.",
    },
    final: {
      eyebrow: "Your next chapter", title: "Start imagining your next journey.",
      description: "Explore Batam travel concepts or visit the contact page for updates to official information.",
      primary: "View trip concepts", secondary: "Contact page", note: "Official packages and contact channels are being prepared. Booking is not available yet.",
    },
    navigation: { menu: "Open menu", close: "Close menu", cta: "Explore packages", explore: "Explore", company: "Company", legal: "Information", footer: "Travel inspiration in Batam, Riau Islands, for your next chapter.", location: "Travel focus · Batam, Indonesia", availability: "Website in development · Service information awaiting confirmation" },
  },
};

export function getHomeDictionary(locale: Locale): HomeDictionary { return homeDictionaries[locale]; }
export type { HomeDictionary, DestinationCopy, PackageCopy };
