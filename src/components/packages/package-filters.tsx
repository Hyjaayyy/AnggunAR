import type { Locale } from "@/i18n/config";
import type { TourPackage } from "@/types/tour-package";
import type { PackageQuery } from "@/lib/tour-packages";
import { getPackagesDictionary } from "@/i18n/packages";

export function PackageFilters({ items, query, locale, preview }: { items: readonly TourPackage[]; query: PackageQuery; locale: Locale; preview: boolean }) {
  const t = getPackagesDictionary(locale);
  const destinations = new Map(items.flatMap((p) => p.location ? [[p.location.id, p.location.label[locale]] as const] : []));
  const categories = new Map(items.map((p) => [p.category.id, p.category.label[locale]]));
  const durations = new Map(items.flatMap((p) => p.durationDays ? [[String(p.durationDays), `${p.durationDays} ${t.days}`] as const] : []));
  const select = (name: string, label: string, options: Map<string, string>) => options.size > 0 && <label className="flex min-w-0 flex-col gap-2 text-sm font-semibold">{label}<select name={name} defaultValue={typeof query[name] === "string" ? query[name] : ""} className="min-h-12 rounded-lg border border-line bg-white px-3"><option value="">{t.all}</option>{[...options].map(([value, text]) => <option key={value} value={value}>{text}</option>)}</select></label>;
  return <form action={`/${locale}/packages`} method="get" className="flex flex-wrap items-end gap-4 rounded-xl border border-line bg-white p-5 shadow-sm">
    {preview && <input type="hidden" name="preview" value="draft" />}
    <label className="flex min-w-0 flex-1 basis-56 flex-col gap-2 text-sm font-semibold">{t.search}<input type="search" name="q" maxLength={200} defaultValue={typeof query.q === "string" ? query.q : ""} className="min-h-12 w-full rounded-lg border border-line px-3" /></label>
    {select("destination", t.destination, destinations)}{select("category", t.category, categories)}{select("duration", t.duration, durations)}
    <button className="min-h-12 rounded-lg bg-ocean px-5 text-sm font-semibold text-white hover:bg-navy" type="submit">{t.apply}</button>
    <a href={`/${locale}/packages${preview ? "?preview=draft" : ""}`} className="inline-flex min-h-12 items-center px-2 text-sm font-semibold text-ocean">{t.reset}</a>
  </form>;
}
