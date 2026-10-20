import type { Locale } from "./config";

type SectionCopy = { eyebrow: string; title: string };
type Principle = { title: string; description: string };

export type AboutDictionary = {
  metadata: { title: string; description: string };
  hero: SectionCopy & { subtitle: string; imageLabel: string; location: string };
  introduction: SectionCopy & { paragraphs: [string, string] };
  vision: SectionCopy & { statement: string };
  mission: SectionCopy & { items: [Principle, Principle, Principle, Principle, Principle] };
  philosophy: SectionCopy & { statement: string; description: string };
  values: SectionCopy & { items: [Principle, Principle, Principle, Principle] };
  commitment: SectionCopy & { description: string; points: [string, string, string] };
  cta: SectionCopy & { description: string; primary: string; secondary: string };
};

const dictionaries: Record<Locale, AboutDictionary> = {
  id: {
    metadata: { title: "Tentang Kami", description: "Mengenal Anggun AR Sukses Abadi: perusahaan perjalanan dan wisata Batam, visi, misi, filosofi, serta komitmen pelayanan kami." },
    hero: {
      eyebrow: "Tentang Kami", title: "Mengenal Anggun AR Sukses Abadi",
      subtitle: "Perjalanan yang berkesan dimulai dari pelayanan yang penuh perhatian.",
      imageLabel: "Visual konsep · foto resmi belum tersedia", location: "Batam · Kepulauan Riau · Indonesia",
    },
    introduction: {
      eyebrow: "Perkenalan perusahaan", title: "Perhatian yang menyertai perjalanan.",
      paragraphs: [
        "Anggun AR Sukses Abadi merupakan perusahaan yang berfokus pada layanan perjalanan dan wisata di Batam, Kepulauan Riau. Kami hadir dengan semangat untuk membantu wisatawan merencanakan perjalanan yang nyaman, menyenangkan, dan berkesan.",
        "Dengan mengutamakan komunikasi yang terbuka, perhatian terhadap kebutuhan pelanggan, serta komitmen terhadap kualitas pelayanan, kami berupaya menjadi mitra perjalanan yang dapat diandalkan bagi wisatawan domestik maupun internasional.",
      ],
    },
    vision: {
      eyebrow: "Arah yang kami tuju", title: "Visi Kami",
      statement: "Menjadi perusahaan perjalanan wisata yang terpercaya, profesional, dan berorientasi pada kepuasan pelanggan, dengan menghadirkan pengalaman perjalanan yang aman, nyaman, dan berkesan bagi wisatawan domestik maupun internasional.",
    },
    mission: {
      eyebrow: "Langkah yang kami bangun", title: "Lima misi. Satu arah pelayanan.",
      items: [
        { title: "Keselamatan & Kenyamanan", description: "Memberikan layanan perjalanan wisata dengan mengedepankan keselamatan, kenyamanan, serta kebutuhan setiap pelanggan." },
        { title: "Kepercayaan Pelanggan", description: "Menjalin hubungan jangka panjang dengan pelanggan melalui komunikasi yang terbuka, pelayanan yang jujur, dan tanggung jawab dalam setiap proses perjalanan." },
        { title: "Keunggulan Pelayanan", description: "Meningkatkan kompetensi, profesionalisme, dan inovasi layanan secara berkelanjutan untuk memberikan pengalaman perjalanan yang lebih baik." },
        { title: "Pengembangan Pariwisata Lokal", description: "Mendukung pengembangan pariwisata Batam dan sekitarnya dengan memperkenalkan destinasi, budaya, dan pengalaman wisata yang bernilai." },
        { title: "Pengalaman Wisata yang Fleksibel", description: "Mengembangkan pilihan layanan wisata yang dapat disesuaikan dengan kebutuhan perjalanan individu, keluarga, kelompok, maupun perusahaan." },
      ],
    },
    philosophy: {
      eyebrow: "Filosofi perusahaan", title: "Beyond Destinations, Creating Memories",
      statement: "Lebih dari Sekadar Destinasi, Menciptakan Kenangan",
      description: "Setiap perjalanan merupakan kesempatan untuk menemukan pengalaman baru, membangun hubungan, dan menciptakan kenangan berharga. Anggun AR Sukses Abadi meyakini bahwa layanan wisata yang baik tidak hanya mengantarkan pelanggan menuju suatu tempat, tetapi juga menghadirkan pengalaman yang bermakna sepanjang perjalanan.",
    },
    values: {
      eyebrow: "Prinsip yang kami pegang", title: "Nilai-Nilai Utama Kami",
      items: [
        { title: "Kepercayaan", description: "Menjadikan kejujuran, keterbukaan, dan tanggung jawab sebagai dasar dalam membangun hubungan dengan pelanggan." },
        { title: "Profesionalisme", description: "Mengutamakan ketelitian, etika kerja, dan komitmen terhadap kualitas dalam setiap pelayanan." },
        { title: "Kepedulian Pelanggan", description: "Memahami kebutuhan setiap pelanggan dan memberikan perhatian pada setiap tahap perjalanan." },
        { title: "Pengembangan Berkelanjutan", description: "Terus belajar, berinovasi, dan meningkatkan kualitas layanan untuk memberikan pengalaman perjalanan yang semakin baik." },
      ],
    },
    commitment: {
      eyebrow: "Komitmen kami", title: "Komitmen Kami untuk Setiap Perjalanan",
      description: "Kami percaya bahwa pengalaman perjalanan yang baik dibangun melalui perencanaan yang matang, komunikasi yang jelas, dan perhatian terhadap kebutuhan wisatawan. Prinsip-prinsip tersebut menjadi pedoman kami dalam mengembangkan layanan perjalanan yang semakin baik.",
      points: ["Perencanaan yang Matang", "Komunikasi yang Jelas", "Pelayanan Berfokus pada Pelanggan"],
    },
    cta: {
      eyebrow: "Perjalanan berikutnya", title: "Siap Merencanakan Perjalanan Berikutnya?",
      description: "Mari jelajahi pilihan perjalanan dan rencanakan pengalaman wisata Anda bersama Anggun AR Sukses Abadi.",
      primary: "Lihat Paket Wisata", secondary: "Hubungi Kami",
    },
  },
  en: {
    metadata: { title: "About Us", description: "Get to know Anggun AR Sukses Abadi: our Batam travel company, vision, missions, philosophy, values, and commitment to thoughtful service." },
    hero: {
      eyebrow: "About Us", title: "Get to Know Anggun AR Sukses Abadi",
      subtitle: "Memorable journeys begin with thoughtful service.",
      imageLabel: "Concept visual · official photography pending", location: "Batam · Riau Islands · Indonesia",
    },
    introduction: {
      eyebrow: "Company introduction", title: "Thoughtful care along the way.",
      paragraphs: [
        "Anggun AR Sukses Abadi is a travel and tour company focused on tourism services in Batam, Riau Islands, Indonesia. We aim to help travelers plan comfortable, enjoyable, and memorable journeys.",
        "Through open communication, attention to travelers' needs, and a commitment to service quality, we strive to become a reliable travel partner for both domestic and international visitors.",
      ],
    },
    vision: {
      eyebrow: "The direction we aspire to", title: "Our Vision",
      statement: "To become a trusted, professional, and customer-focused travel company by providing safe, comfortable, and memorable travel experiences for domestic and international travelers.",
    },
    mission: {
      eyebrow: "The steps we take", title: "Five missions. One service mindset.",
      items: [
        { title: "Safety & Comfort", description: "To provide travel services that prioritize safety, comfort, and the individual needs of every customer." },
        { title: "Customer Trust", description: "To build long-term customer relationships through open communication, honest service, and responsibility throughout every journey." },
        { title: "Service Excellence", description: "To continuously improve competence, professionalism, and service innovation to deliver better travel experiences." },
        { title: "Local Tourism Development", description: "To support tourism development in Batam and surrounding areas by introducing meaningful destinations, cultural experiences, and local attractions." },
        { title: "Flexible Travel Experiences", description: "To develop flexible travel services tailored to the needs of individuals, families, groups, and corporate travelers." },
      ],
    },
    philosophy: {
      eyebrow: "Company philosophy", title: "Our Philosophy",
      statement: "Beyond Destinations, Creating Memories",
      description: "Every journey is an opportunity to discover new experiences, build meaningful connections, and create lasting memories. Anggun AR Sukses Abadi believes that great travel services go beyond reaching a destination — they are about creating meaningful experiences throughout the journey.",
    },
    values: {
      eyebrow: "The principles we stand by", title: "Our Core Values",
      items: [
        { title: "Trust", description: "Building customer relationships through honesty, transparency, and responsibility." },
        { title: "Professionalism", description: "Prioritizing attention to detail, professional ethics, and a commitment to quality in every service." },
        { title: "Customer Care", description: "Understanding each customer's needs and providing thoughtful support throughout the journey." },
        { title: "Continuous Improvement", description: "Continuously learning, innovating, and improving service quality to create better travel experiences." },
      ],
    },
    commitment: {
      eyebrow: "Our commitment", title: "Our Commitment to Every Journey",
      description: "We believe that a great travel experience is built on thoughtful planning, clear communication, and attention to travelers' needs. These principles guide us as we continue to develop better travel services.",
      points: ["Thoughtful Planning", "Clear Communication", "Customer-Focused Service"],
    },
    cta: {
      eyebrow: "Your next journey", title: "Ready to Plan Your Next Journey?",
      description: "Explore travel possibilities and plan your next experience with Anggun AR Sukses Abadi.",
      primary: "Explore Tour Packages", secondary: "Contact Us",
    },
  },
};

export function getAboutDictionary(locale: Locale): AboutDictionary {
  return dictionaries[locale];
}
