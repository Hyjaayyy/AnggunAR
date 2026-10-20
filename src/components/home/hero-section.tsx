import { getHeroDictionary } from "@/i18n/hero";
import type { Locale } from "@/i18n/config";
import { HeroCarousel } from "./hero-carousel";

export function HeroSection({ locale }: { locale: Locale }) {
  return <HeroCarousel copy={getHeroDictionary(locale)} locale={locale} />;
}
