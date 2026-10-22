import type { Locale } from "./config";

const errors = {
  id: {
    title: "Halaman belum dapat ditampilkan",
    description: "Terjadi gangguan saat memuat halaman. Silakan coba lagi atau kembali ke beranda.",
    retry: "Coba lagi",
    home: "Kembali ke beranda",
  },
  en: {
    title: "This page could not be displayed",
    description: "Something went wrong while loading this page. Please try again or return home.",
    retry: "Try again",
    home: "Return home",
  },
} as const;

export function getErrorDictionary(locale: Locale) { return errors[locale]; }
