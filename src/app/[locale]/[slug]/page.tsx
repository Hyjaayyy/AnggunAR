import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileClock } from "lucide-react";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary, isPageSlug, pageSlugs } from "@/i18n/dictionaries";
import { getPackage, type PackageQuery } from "@/lib/tour-packages";
import { getPackagesDictionary } from "@/i18n/packages";

type Props = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<PackageQuery> };

export function generateStaticParams() {
  // About memiliki route statis khusus; jangan prerender versi placeholder-nya.
  return locales.flatMap((locale) => pageSlugs.filter((slug) => slug !== "about" && slug !== "packages").map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isPageSlug(slug)) notFound();
  const page = getDictionary(locale).pages[slug];
  return { title: page.title, description: page.description };
}

export default async function PlaceholderPage({ params, searchParams }: Props) {
  const { locale, slug } = await params;
  if (!isLocale(locale) || !isPageSlug(slug)) notFound();
  const t = getDictionary(locale);
  const page = t.pages[slug];
  const query = await searchParams;
  const packageSlug = slug === "booking" && typeof query.package === "string" ? query.package : null;
  const selectedPackage = packageSlug ? getPackage(packageSlug) : null;
  const packagesCopy = getPackagesDictionary(locale);
  const notice = slug === "booking" ? t.bookingPending : slug === "contact" ? t.contactPending : slug === "privacy" || slug === "terms" ? t.legalPending : t.placeholder;
  return (
    <section className="container py-16 sm:py-24">
      <p className="text-xs font-semibold tracking-widest text-teal-700 uppercase">{t.stage}</p>
      <h1 className="mt-5 text-4xl font-semibold tracking-tight text-teal-950 sm:text-5xl">{page.title}</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">{page.description}</p>
      {packageSlug && <p className="mt-6 text-sm text-muted">{selectedPackage ? `${packagesCopy.bookingContext}: ${selectedPackage.content[locale].name}` : packagesCopy.bookingUnavailable}</p>}
      <div className="mt-10 flex max-w-2xl items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        <FileClock size={24} aria-hidden="true" className="mt-1 shrink-0 text-teal-700" />
        <p className="leading-7 text-slate-600">{notice}</p>
      </div>
      <Link href={`/${locale}`} className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-teal-800"><ArrowLeft size={17} aria-hidden="true" />{t.backHome}</Link>
    </section>
  );
}
