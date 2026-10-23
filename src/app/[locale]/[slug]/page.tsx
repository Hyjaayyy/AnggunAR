import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileClock } from "lucide-react";
import { notFound } from "next/navigation";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary, isPageSlug, pageSlugs } from "@/i18n/dictionaries";
import { getBookingPackage, type PackageQuery } from "@/lib/tour-packages";
import { getPackagesDictionary } from "@/i18n/packages";
import { getContactDictionary } from "@/i18n/contact";
import { whatsappHref } from "@/lib/contact";
import { ButtonLink } from "@/components/ui/button-link";

type Props = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<PackageQuery> };

export function generateStaticParams() {
  // About memiliki route statis khusus; jangan prerender versi placeholder-nya.
  return locales.flatMap((locale) => pageSlugs.filter((slug) => !["about", "packages", "destinations", "gallery", "contact"].includes(slug)).map((slug) => ({ locale, slug })));
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
  const selectedPackage = packageSlug ? getBookingPackage(packageSlug) : null;
  const packagesCopy = getPackagesDictionary(locale);
  const contactCopy = getContactDictionary(locale);
  const notice = slug === "booking" ? contactCopy.bookingNote : slug === "privacy" || slug === "terms" ? t.legalPending : t.placeholder;
  return (
    <section className="ocean-placeholder ocean-mist">
      <div className="container"><div className="ocean-panel grid overflow-hidden lg:grid-cols-[1.15fr_1fr]">
        <div className="dark-surface ocean-secondary p-6 text-white sm:p-10">
          <p className="text-xs font-semibold tracking-widest text-white/80 uppercase">{t.stage}</p>
          <h1 className="mt-5 text-4xl leading-tight font-semibold tracking-tight sm:text-5xl">{page.title}</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/85">{page.description}</p>
        </div>
        <div className="p-6 sm:p-10">
          {packageSlug && <p className="mb-6 text-sm text-muted">{selectedPackage ? `${packagesCopy.bookingContext}: ${selectedPackage.content[locale].name}` : packagesCopy.bookingUnavailable}</p>}
          <div className="flex max-w-2xl items-start gap-4">
            <FileClock size={24} aria-hidden="true" className="mt-1 shrink-0 text-ocean" />
            <p className="leading-7 text-muted">{notice}</p>
          </div>
          {slug === "booking" && (!packageSlug || selectedPackage) && <div className="mt-6"><ButtonLink href={whatsappHref(locale, selectedPackage ? { packageName: selectedPackage.content[locale].name } : { booking: true })}>{contactCopy.bookingAction}</ButtonLink><p className="mt-4 text-sm leading-7 text-muted">{contactCopy.note}</p></div>}
          <Link href={`/${locale}`} className="mt-8 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ocean"><ArrowLeft size={17} aria-hidden="true" />{t.backHome}</Link>
        </div>
      </div></div>
    </section>
  );
}
