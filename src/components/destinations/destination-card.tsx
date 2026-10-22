import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { LocalPhoto } from "@/components/ui/local-photo";
import { categoryLabels, getDestinationsDictionary } from "@/i18n/destinations";
import type { Destination } from "@/types/destination";
import type { Locale } from "@/i18n/config";

export function DestinationCard({ item, locale }: { item: Destination; locale: Locale }) {
  const t = getDestinationsDictionary(locale); const copy = item.content[locale];
  return <article className="ocean-card flex min-w-0 flex-col overflow-hidden transition-shadow" data-destination-card>
    <LocalPhoto photo={item.images[0]} locale={locale} fallback={t.photo} />
    <div className="flex flex-1 flex-col p-6"><p className="text-xs font-semibold tracking-wider text-ocean uppercase">{categoryLabels[locale][item.category]}</p>
    <h3 className="mt-3 text-xl font-semibold">{copy.name}</h3><p className="mt-2 text-xs leading-5 text-muted">{item.location[locale]}</p>
    <p className="mt-3 flex-1 text-sm leading-6 text-muted">{copy.shortDescription}</p>
    <Link href={`/${locale}/destinations/${item.slug}`} className="mt-4 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ocean hover:text-navy" aria-label={`${t.explore}: ${copy.name}`}>{t.explore}<ArrowUpRight size={16} aria-hidden="true" /></Link></div>
  </article>;
}
