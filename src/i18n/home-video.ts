import type { Locale } from "./config";

const id = {
  eyebrow: "Batam dalam gerak",
  title: "Jelajahi Batam dalam Setiap Momen",
  description: "Pesisir, pulau, dan suasana Batam sebagai inspirasi untuk perjalanan berikutnya.",
};
export type HomeVideoDictionary = typeof id;
const en: HomeVideoDictionary = {
  eyebrow: "Batam in motion",
  title: "Experience Batam in Motion",
  description: "Coastlines, islands, and glimpses of Batam to inspire your next journey.",
};
export function getHomeVideoDictionary(locale: Locale): HomeVideoDictionary { return locale === "id" ? id : en; }
