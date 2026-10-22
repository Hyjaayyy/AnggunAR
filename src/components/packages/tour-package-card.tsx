import Link from "next/link";
import type { TourPackage } from "@/types/tour-package";
import { getPackagesDictionary } from "@/i18n/packages";
import { isMarketDraft, packageDuration, packagePrice } from "@/lib/tour-packages";
import { PackagePhoto } from "./package-photo";
import type { Locale } from "@/i18n/config";

export function TourPackageCard({ item, locale, preview = false }: {
  item: TourPackage; locale: Locale; preview?: boolean;
}) {
  const t = getPackagesDictionary(locale); const market = isMarketDraft(item);
  return <article className="ocean-card flex min-w-0 flex-col overflow-hidden transition-shadow">
    <PackagePhoto image={item.images[0]} locale={locale} label={t.photo} />
    <div className="flex flex-1 flex-col p-6"><p className="text-xs font-semibold text-ocean">{item.category.label[locale]}{market ? ` · ${t.marketStatus}` : item.status === "draft" ? " · DEMO / DRAFT" : ""}</p>
    <h3 className="mt-3 text-xl font-semibold">{item.content[locale].name}</h3>
    <p className="mt-4 text-sm text-muted">{t.destination}: {item.location?.label[locale] ?? t.pending}</p>
    <p className="mt-2 text-sm text-muted">{t.duration}: {packageDuration(item, locale, t.pending)}</p>
    <div className="mt-auto pt-6">{market && <p className="mb-2 text-xs font-semibold text-ocean">{t.estimate}</p>}<p className="text-sm font-semibold">{packagePrice(item, locale, t.price)}{market ? ` ${t.perPerson}` : ""}</p></div>
    <Link href={`/${locale}/packages/${item.slug}${preview ? "?preview=draft" : ""}`} className="mt-4 inline-flex min-h-11 items-center border-t border-line pt-3 text-sm font-semibold text-ocean" aria-label={`${t.detail}: ${item.content[locale].name}`}>{t.detail} →</Link></div>
  </article>;
}
