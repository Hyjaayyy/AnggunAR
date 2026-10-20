import Link from "next/link";
import type { TourPackage } from "@/types/tour-package";
import { getPackagesDictionary } from "@/i18n/packages";
import { packagePrice } from "@/lib/tour-packages";
import { PackagePhoto } from "./package-photo";
import type { Locale } from "@/i18n/config";

export function TourPackageCard({ item, locale, preview = false }: {
  item: TourPackage; locale: Locale; preview?: boolean;
}) {
  const t = getPackagesDictionary(locale);
  return <article className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-line bg-white shadow-sm transition-shadow hover:shadow-md">
    <PackagePhoto image={item.images[0]} locale={locale} label={t.photo} />
    <div className="flex flex-1 flex-col p-6"><p className="text-xs font-semibold text-ocean">{item.category.label[locale]}{item.status === "draft" ? " · DEMO / DRAFT" : ""}</p>
    <h3 className="mt-3 text-xl font-semibold">{item.content[locale].name}</h3>
    <p className="mt-4 text-sm text-muted">{t.destination}: {item.location?.label[locale] ?? t.pending}</p>
    <p className="mt-2 text-sm text-muted">{t.duration}: {item.durationDays ? `${item.durationDays} ${t.days}` : t.pending}</p>
    <p className="mt-auto pt-6 text-sm font-semibold">{packagePrice(item, locale, t.price)}</p>
    <Link href={`/${locale}/packages/${item.slug}${preview ? "?preview=draft" : ""}`} className="mt-4 inline-flex min-h-11 items-center border-t border-line pt-3 text-sm font-semibold text-ocean" aria-label={`${t.detail}: ${item.content[locale].name}`}>{t.detail} →</Link></div>
  </article>;
}
