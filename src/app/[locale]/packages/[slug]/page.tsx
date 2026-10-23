import type { Metadata } from "next";
import Link from "next/link";
import { Check, X } from "lucide-react";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getPackagesDictionary } from "@/i18n/packages";
import { getPackage, isUnverifiedConcept, packageDuration, packagePrice, type PackageQuery } from "@/lib/tour-packages";
import { packageReviewAccess } from "@/lib/owner-review";
import { PackagePhoto } from "@/components/packages/package-photo";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { whatsappHref } from "@/lib/contact";

type Props = { params: Promise<{ locale: string; slug: string }>; searchParams: Promise<PackageQuery> };
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { locale, slug } = await params; if (!isLocale(locale)) notFound();
  const item = getPackage(slug, await packageReviewAccess(await searchParams)); if (!item) notFound();
  return { title: item.content[locale].name, description: item.content[locale].description };
}
export default async function PackageDetail({ params, searchParams }: Props) {
  const { locale, slug } = await params; if (!isLocale(locale)) notFound();
  const access = await packageReviewAccess(await searchParams); const preview = !!access; const item = getPackage(slug, access); if (!item) notFound();
  const t = getPackagesDictionary(locale); const copy = item.content[locale];
  const duration = packageDuration(item, locale, t.pending); const market = isUnverifiedConcept(item);
  const sectionClass = "ocean-panel p-6 sm:p-8";
  return <div className="ocean-mist"><Container><div className="py-10 sm:py-14">
    <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-ocean"><Link href={`/${locale}`}>{t.home}</Link><span aria-hidden="true">/</span><Link href={`/${locale}/packages${preview ? "?preview=draft" : ""}`}>{t.title}</Link><span aria-hidden="true">/</span><span aria-current="page" className="text-muted">{copy.name}</span></nav>
    {preview && <p className="mt-6 rounded-lg bg-amber-50 p-4 text-sm text-amber-950">{t.preview}</p>}
    {market && <div className="mt-6 rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm leading-7 text-amber-950"><p className="font-semibold">{t.marketStatus} · {t.estimate}</p><p>{t.estimateNote}</p></div>}
    <p className="mt-8 text-sm font-semibold text-ocean">{item.category.label[locale]}</p><h1 className="mt-3 text-3xl font-semibold sm:text-5xl">{copy.name}</h1>
    <p className="ocean-detail-heading mt-5 text-muted">{t.destination}: {item.location?.label[locale] ?? t.pending} · {t.duration}: {duration}</p>
    <div className="mt-10 grid items-start gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(16rem,1fr)]">
      <div className="min-w-0 space-y-7">
        <div aria-label={t.photo} className="overflow-hidden rounded-xl"><PackagePhoto image={item.images[0]} locale={locale} label={`${t.photo} · 01`} main /><div className="mt-3 grid grid-cols-2 gap-3">{item.images.slice(1).map((image, index) => <PackagePhoto key={index} image={image} locale={locale} label={`${t.photo} · 0${index + 2}`} />)}</div></div>
        <section className={sectionClass}><h2 className="text-2xl font-semibold">{t.overview}</h2><p className="mt-5 whitespace-pre-line leading-8 text-muted">{copy.description}</p></section>
        <section className={sectionClass}><h2 className="text-2xl font-semibold">{market ? t.conceptItinerary : t.itinerary}</h2>{item.itinerary?.length ? <ol className="mt-6 space-y-6 border-l-2 border-line pl-6">{item.itinerary.map((day) => <li key={day.day}><h3 className="font-semibold">{t.day} {day.day} — {day.title[locale]}</h3><ul className="mt-3 list-disc space-y-2 pl-5 text-muted">{day.activities[locale].map((activity) => <li key={activity}>{activity}</li>)}</ul></li>)}</ol> : <p className="mt-4 leading-7 text-muted">{t.itineraryPending}</p>}</section>
        <div className="grid gap-5 sm:grid-cols-2">{(["included", "excluded"] as const).map((key) => { const Icon = key === "included" ? Check : X; return <section key={key} className={sectionClass}><h2 className="flex items-center gap-3 text-xl font-semibold"><Icon size={20} className="shrink-0 text-ocean" aria-hidden="true" />{t[key]}</h2>{item[key]?.[locale].length ? <ul className="mt-4 list-disc space-y-2 pl-5 leading-7 text-muted">{item[key][locale].map((value) => <li key={value}>{value}</li>)}</ul> : <p className="mt-4 text-muted">{t.pending}</p>}</section>; })}</div>
        {item.information.length > 0 && <section className={sectionClass}><h2 className="text-2xl font-semibold">{t.important}</h2><dl className="mt-5 space-y-5">{item.information.map((info) => <div key={info.label.en}><dt className="font-semibold">{info.label[locale]}</dt><dd className="mt-2 whitespace-pre-line leading-7 text-muted">{info.value[locale]}</dd></div>)}</dl></section>}
      </div>
      <aside className={`${sectionClass} ocean-inquiry lg:sticky lg:top-28`} aria-label={market ? t.quote : t.inquiry}><h2 className="text-xl font-semibold">{copy.name}</h2><p className="mt-4 text-sm text-muted">{t.duration}: {duration}</p>{market && <p className="mt-6 text-sm font-semibold text-ocean">{t.estimate}</p>}<p className="mt-6 text-lg font-semibold">{packagePrice(item, locale, t.price)}{market ? ` ${t.perPerson}` : ""}</p><div className="mt-6">{market && (item.status === "offered" || preview) ? <ButtonLink href={whatsappHref(locale, { packageName: copy.name, quote: true })}>{t.quote}</ButtonLink> : !preview && <ButtonLink href={whatsappHref(locale, { packageName: copy.name })}>{t.inquiry}</ButtonLink>}</div><p className="mt-4 text-sm leading-6 text-muted">{market ? t.quoteNote : preview ? t.preview : t.inquiryNote}</p></aside>
    </div>
  </div></Container></div>;
}
