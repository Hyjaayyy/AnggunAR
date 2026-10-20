export const heroSlideIds = ["explore", "experience", "escape"] as const;
export type HeroSlideId = (typeof heroSlideIds)[number];

export type HeroImage = {
  /** Path relatif public, contoh /images/hero/explore-batam.webp. null = fallback. */
  src: `/images/hero/${string}` | null;
  desktopPosition: string;
  mobilePosition: string;
};

export type HeroSlideConfig = {
  id: HeroSlideId;
  href: "destinations" | "packages" | "contact";
  image: HeroImage;
  fallback: "coast" | "islands" | "horizon";
};

export const heroSlides: readonly HeroSlideConfig[] = [
  { id: "explore", href: "destinations", image: { src: null, desktopPosition: "65% 50%", mobilePosition: "70% 50%" }, fallback: "coast" },
  { id: "experience", href: "packages", image: { src: null, desktopPosition: "60% 50%", mobilePosition: "75% 50%" }, fallback: "islands" },
  { id: "escape", href: "contact", image: { src: null, desktopPosition: "60% 45%", mobilePosition: "70% 45%" }, fallback: "horizon" },
];

export const HERO_AUTOPLAY_MS = 7000;
