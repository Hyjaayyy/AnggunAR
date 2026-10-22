import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { DestinationCard } from "@/components/destinations/destination-card";
import { getDestinations } from "@/lib/destinations";
import { getDestinationsDictionary } from "@/i18n/destinations";
import type { HomeDictionary } from "@/i18n/home";
import type { Locale } from "@/i18n/config";

export function FeaturedDestinations({ copy, locale }: { copy: HomeDictionary["destinations"]; locale: Locale }) {
  const items = getDestinations().slice(0,3); const t = getDestinationsDictionary(locale);
  return <section aria-labelledby="destinations-title" className="section-space border-y border-line ocean-mist"><Container>
    <div className="flex flex-wrap items-end justify-between gap-6"><SectionHeading id="destinations-title" {...copy} /><Link href={`/${locale}/destinations`} className="inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-ocean">{copy.all}<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
    {items.length ? <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-6 xl:grid-cols-3">{items.map((item) => <DestinationCard key={item.id} item={item} locale={locale} />)}</div> : <p className="mt-10 rounded-xl border border-line p-8 text-muted">{t.empty}</p>}
  </Container></section>;
}
