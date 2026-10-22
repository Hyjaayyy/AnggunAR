import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { business } from "@/lib/business";
import { getHomeDictionary } from "@/i18n/home";
import { HeroSection } from "@/components/home/hero-section";
import { IntroductionSection } from "@/components/home/introduction-section";
import { FeaturedDestinations } from "@/components/home/featured-destinations";
import { CinematicSection } from "@/components/home/cinematic-section";
import { PopularPackages } from "@/components/home/popular-packages";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { TravelInspiration } from "@/components/home/travel-inspiration";
import { FinalCTA } from "@/components/home/final-cta";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return { title: { absolute: `${t.home} | ${business.name}` }, description: getHomeDictionary(locale).metaDescription };
}

export default async function Home({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getHomeDictionary(locale);
  return (
    <>
      <HeroSection locale={locale} />
      <CinematicSection locale={locale} />
      <IntroductionSection copy={copy.introduction} locale={locale} />
      <FeaturedDestinations copy={copy.destinations} locale={locale} />
      <PopularPackages copy={copy.packages} locale={locale} />
      <WhyChooseUs copy={copy.benefits} />
      <TravelInspiration copy={copy.inspiration} locale={locale} />
      <FinalCTA copy={copy.final} locale={locale} />
    </>
  );
}
