import type { Locale } from "./config";
import type { HeroSlideId } from "@/data/hero-slides";

export type HeroSlideCopy = {
  eyebrow: string;
  title: string;
  description: string;
  cta: string;
  /** Ubah alt agar sesuai foto sebenarnya ketika src diaktifkan. */
  imageAlt: string;
};
export type HeroDictionary = {
  label: string;
  slide: string;
  previous: string;
  next: string;
  pause: string;
  play: string;
  indicator: string;
  fallback: string;
  reducedMotion: string;
  slides: Record<HeroSlideId, HeroSlideCopy>;
};

const dictionaries: Record<Locale, HeroDictionary> = {
  id: {
    label: "Inspirasi perjalanan Batam", slide: "slide", previous: "Slide sebelumnya", next: "Slide berikutnya",
    pause: "Jeda pergantian otomatis", play: "Aktifkan pergantian otomatis", indicator: "Tampilkan slide",
    fallback: "Visual konsep · foto segera dilengkapi", reducedMotion: "Pergantian otomatis dinonaktifkan mengikuti preferensi gerakan Anda.",
    slides: {
      explore: { eyebrow: "Explore Batam · Kepulauan Riau", title: "Temukan Keindahan Batam", description: "Kenali pesisir, ikon kota, dan sudut kepulauan sebagai inspirasi cerita perjalanan Anda berikutnya.", cta: "Jelajahi Destinasi", imageAlt: "" },
      experience: { eyebrow: "Travel Experiences · Batam", title: "Perjalananmu, Pengalamanmu", description: "Temukan konsep perjalanan yang sesuai dengan minat Anda. Rincian paket dan layanan resmi sedang dipersiapkan.", cta: "Lihat Paket Wisata", imageAlt: "" },
      escape: { eyebrow: "Plan Your Trip · Batam", title: "Rencanakan Liburan Berikutnya", description: "Mulai dari ide kecil untuk liburan berikutnya. Kunjungi halaman kontak untuk pembaruan kanal komunikasi resmi.", cta: "Hubungi Kami", imageAlt: "" },
    },
  },
  en: {
    label: "Batam travel inspiration", slide: "slide", previous: "Previous slide", next: "Next slide",
    pause: "Pause automatic slides", play: "Enable automatic slides", indicator: "Show slide",
    fallback: "Concept visual · photography to follow", reducedMotion: "Automatic slides are disabled to respect your motion preference.",
    slides: {
      explore: { eyebrow: "Explore Batam · Riau Islands", title: "Discover the Beauty of Batam", description: "Explore coastlines, city landmarks, and island perspectives as inspiration for your next travel story.", cta: "Explore Destinations", imageAlt: "" },
      experience: { eyebrow: "Travel Experiences · Batam", title: "Your Journey, Your Experience", description: "Find travel concepts that reflect your interests. Official package and service details are being prepared.", cta: "View Tour Packages", imageAlt: "" },
      escape: { eyebrow: "Plan Your Trip · Batam", title: "Plan Your Next Escape", description: "Start with a little inspiration for your next escape. Visit the contact page for updates to official communication channels.", cta: "Contact Us", imageAlt: "" },
    },
  },
};

export function getHeroDictionary(locale: Locale): HeroDictionary { return dictionaries[locale]; }
