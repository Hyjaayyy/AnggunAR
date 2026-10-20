import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getAboutDictionary } from "@/i18n/about";
import { AboutHero } from "@/components/about/about-hero";
import { CompanyIntroduction, VisionSection, MissionSection } from "@/components/about/company-sections";
import { PhilosophySection, CoreValuesSection, CommitmentSection, AboutCTA } from "@/components/about/principle-sections";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return getAboutDictionary(locale).metadata;
}

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const copy = getAboutDictionary(locale);

  return (
    <>
      <AboutHero copy={copy.hero} locale={locale} />
      <CompanyIntroduction copy={copy.introduction} />
      <VisionSection copy={copy.vision} />
      <MissionSection copy={copy.mission} />
      <PhilosophySection copy={copy.philosophy} locale={locale} />
      <CoreValuesSection copy={copy.values} />
      <CommitmentSection copy={copy.commitment} />
      <AboutCTA copy={copy.cta} locale={locale} />
    </>
  );
}
