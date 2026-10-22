import { destinationCategories } from "@/types/destination";
import { categoryLabels, getDestinationsDictionary } from "@/i18n/destinations";
import type { Locale } from "@/i18n/config";
import type { ContentQuery } from "@/lib/destinations";

export function DestinationFilters({ locale, query }: { locale: Locale; query: ContentQuery }) {
  const t = getDestinationsDictionary(locale);
  return <form action={`/${locale}/destinations`} method="get" className="ocean-filter flex flex-wrap items-end gap-4 p-5 sm:p-6">
    <label className="flex min-w-0 flex-1 basis-64 flex-col gap-2 text-sm font-semibold">{t.search}<input className="min-h-12 w-full rounded-lg border border-line px-3" name="q" type="search" maxLength={200} defaultValue={typeof query.q === "string" ? query.q : ""} /></label>
    <label className="flex min-w-0 flex-1 basis-56 flex-col gap-2 text-sm font-semibold">{t.category}<select name="category" defaultValue={typeof query.category === "string" ? query.category : ""} className="min-h-12 w-full rounded-lg border border-line bg-white px-3"><option value="">{t.all}</option>{destinationCategories.map((key) => <option key={key} value={key}>{categoryLabels[locale][key]}</option>)}</select></label>
    <button type="submit" className="min-h-12 rounded-lg bg-ocean px-5 text-sm font-semibold text-white hover:bg-navy">{t.apply}</button><a href={`/${locale}/destinations`} className="inline-flex min-h-12 items-center text-sm font-semibold text-ocean">{t.reset}</a>
  </form>;
}
