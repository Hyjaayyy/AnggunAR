import type { Locale } from "@/i18n/config";

/** Isi src hanya sesudah foto berizin tersedia. null menampilkan fallback CSS. */
export const aboutVisual: {
  src: `/images/about/${string}` | null;
  alt: Record<Locale, string>;
  position: string;
} = {
  src: null,
  alt: { id: "", en: "" },
  position: "center",
};
