import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { categoryLabels, getDestinationsDictionary } from "@/i18n/destinations";
import { getDestination, getRelatedPackages } from "@/lib/destinations";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { LocalPhoto } from "@/components/ui/local-photo";
import { TourPackageCard } from "@/components/packages/tour-package-card";

type Props = { params: Promise<{ locale: string; slug: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params; if (!isLocale(locale)) notFound();
  const item = getDestination(slug); if (!item) notFound();
  return { title: item.content[locale].name, description: item.content[locale].shortDescription };
}
export default async function DestinationDetail({ params }: Props) {
  const { locale, slug } = await params; if (!isLocale(locale)) notFound();
  const item = getDestination(slug); if (!item) notFound();
  const t = getDestinationsDictionary(locale); const copy = item.content[locale]; const related = getRelatedPackages(item);
  return <div className="ocean-light"><Container><div className="py-10 sm:py-16">
    <nav aria-label={t.breadcrumb} className="flex flex-wrap gap-2 text-sm text-ocean"><Link href={`/${locale}`}>{t.home}</Link><span aria-hidden="true">/</span><Link href={`/${locale}/destinations`}>{t.title}</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-muted">{copy.name}</span></nav>
    <header className="ocean-detail-heading my-10 max-w-4xl"><p className="text-xs font-semibold tracking-widest text-ocean uppercase">{categoryLabels[locale][item.category]}</p><h1 className="mt-4 text-4xl font-semibold sm:text-6xl">{copy.name}</h1><p className="mt-4 text-sm text-muted">{item.location[locale]}</p><p className="mt-6 text-lg leading-8 text-muted">{copy.shortDescription}</p></header>
    <LocalPhoto photo={item.images[0]} locale={locale} fallback={`${t.photo} · 01`} wide sizes="(min-width: 1280px) 1200px, 100vw" />
    <div className="my-12 grid gap-10 lg:grid-cols-[2fr_1fr]"><section className="ocean-panel p-6 sm:p-8"><h2 className="text-2xl font-semibold">{t.about}</h2><p className="mt-5 whitespace-pre-line leading-8 text-muted">{copy.description}</p><p className="mt-5 text-sm leading-7 text-muted">{t.note}</p></section><section className="ocean-secondary ocean-dark-copy rounded-2xl p-6 sm:p-8"><h2 className="text-xl font-semibold">{t.highlights}</h2><ul className="mt-5 list-disc space-y-3 pl-5 leading-7 text-muted">{copy.highlights.map((highlight) => <li key={highlight}>{highlight}</li>)}</ul></section></div>
    <section className="ocean-panel p-5 sm:p-8" aria-labelledby="destination-photos"><h2 id="destination-photos" className="text-2xl font-semibold">{t.gallery}</h2><div className="mt-6 grid grid-cols-2 gap-3 sm:gap-6">{item.images.slice(1).map((photo, index) => <LocalPhoto key={index} photo={photo} locale={locale} fallback={`${t.photo} · 0${index + 2}`} sizes="(min-width: 1280px) 600px, 50vw" />)}</div></section>
    <section className="ocean-panel mt-12 p-6 sm:p-8" aria-labelledby="related-packages"><h2 id="related-packages" className="text-2xl font-semibold">{t.related}</h2>{related.length ? <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{related.map((pkg) => <TourPackageCard key={pkg.slug} item={pkg} locale={locale} />)}</div> : <p className="mt-5 leading-7 text-muted">{t.noPackages}</p>}<div className="mt-7 flex flex-wrap gap-4"><ButtonLink href={`/${locale}/packages`}>{t.packages}</ButtonLink><ButtonLink variant="secondary" href={`/${locale}/contact`}>{t.contact}</ButtonLink></div></section>
    <section className="ocean-source mt-10 text-sm"><h2 className="font-semibold">{t.sources}</h2><ul className="mt-3 space-y-2">{item.sources.map((source) => <li key={source.url}><a href={source.url} className="text-ocean underline underline-offset-4">{source.title}</a></li>)}</ul></section>
  </div></Container></div>;
}
