import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getPackagesDictionary } from "@/i18n/packages";
import { filterPackages, getPackages, type PackageQuery } from "@/lib/tour-packages";
import { ownerReviewEnabled, packageReviewAccess } from "@/lib/owner-review";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { TourPackageCard } from "@/components/packages/tour-package-card";
import { EmptyState } from "@/components/ui/empty-state";
import { PackageFilters } from "@/components/packages/package-filters";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<PackageQuery> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const t = getPackagesDictionary(locale); return { title: t.title, description: t.description };
}
export default async function PackagesPage({ params, searchParams }: Props) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const query = await searchParams; const access = await packageReviewAccess(query); const preview = !!access;
  const items = getPackages(access); const results = filterPackages(items, query, locale); const t = getPackagesDictionary(locale);
  return <div className="ocean-page">
    <section className="ocean-hero dark-surface bg-navy py-14 text-white sm:py-20"><Container>
      <nav aria-label="Breadcrumb" className="mb-8 text-sm"><Link href={`/${locale}`} className="underline underline-offset-4">{t.home}</Link><span aria-hidden="true"> / </span><span aria-current="page">{t.title}</span></nav>
      <h1 className="text-4xl font-semibold sm:text-6xl">{t.title}</h1><p className="mt-5 max-w-2xl text-lg leading-8">{preview ? t.previewDescription : t.description}</p>
    </Container></section>
    <section className="section-space ocean-mist" aria-label={t.title}><Container>
      {preview && <p className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">{t.preview}</p>}
      {items.length > 0 && <PackageFilters items={items} query={query} locale={locale} preview={preview} />}
      {results.length > 0 ? <><h2 className="sr-only">{t.title}</h2><p className="mt-8 text-sm text-muted" role="status">{results.length} {t.results}</p><div className="mt-5 grid gap-6 md:grid-cols-2 xl:grid-cols-3">{results.map((item) => <TourPackageCard key={item.slug} item={item} locale={locale} preview={preview} />)}</div></>
        : <div className="mt-6"><EmptyState title={items.length ? t.noResults : t.empty} description={items.length ? t.noResultsDescription : t.emptyDescription}><ButtonLink href={items.length ? `/${locale}/packages${preview ? "?preview=draft" : ""}` : `/${locale}/contact`}>{items.length ? t.reset : t.contact}</ButtonLink></EmptyState></div>}
      {ownerReviewEnabled() && !preview && <Link href={`/${locale}/packages?preview=draft`} className="mt-6 inline-flex min-h-11 items-center text-sm text-ocean underline">{t.previewLink}</Link>}
    </Container></section>
  </div>;
}
