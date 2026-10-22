import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getDestinationsDictionary } from "@/i18n/destinations";
import { getDestinations, filterDestinations, type ContentQuery } from "@/lib/destinations";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { EditorialHero } from "@/components/destinations/editorial-hero";
import { DestinationFilters } from "@/components/destinations/destination-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { DestinationCard } from "@/components/destinations/destination-card";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<ContentQuery> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const t = getDestinationsDictionary(locale); return { title: t.headline, description: t.description };
}
export default async function DestinationsPage({ params, searchParams }: Props) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const query = await searchParams; const t = getDestinationsDictionary(locale);
  const published = getDestinations(); const items = filterDestinations(published, query, locale);
  return <div className="ocean-page"><EditorialHero locale={locale} {...t} /><section className="section-space ocean-mist" aria-label={t.title}><Container>
    <DestinationFilters locale={locale} query={query} /><p className="mt-6 text-sm leading-6 text-muted">{t.note}</p>
    {items.length ? <><h2 className="sr-only">{t.title}</h2><p className="mt-8 text-sm text-muted" role="status">{items.length} {t.results}</p><div className="mt-5 grid gap-x-6 gap-y-12 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <DestinationCard key={item.id} item={item} locale={locale} />)}</div></> : <div className="mt-8"><EmptyState kind="destination" title={published.length ? t.noResults : t.empty} description={t.tryAgain}><ButtonLink variant="secondary" href={`/${locale}/destinations`}>{t.reset}</ButtonLink></EmptyState></div>}
  </Container></section></div>;
}
