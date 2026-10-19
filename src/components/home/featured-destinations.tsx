import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { DestinationCard } from "@/components/destinations/destination-card";
import type { VisualKind } from "./travel-visual";
import type { HomeDictionary } from "@/i18n/home";
import type { Locale } from "@/i18n/config";

const visuals: VisualKind[] = ["bridge", "coast", "islands"];
export function FeaturedDestinations({ copy, locale, imageLabel }: { copy: HomeDictionary["destinations"]; locale: Locale; imageLabel: string }) {
  return <section aria-labelledby="destinations-title" className="section-space border-y border-line bg-white"><Container>
    <div className="flex flex-wrap items-end justify-between gap-6"><SectionHeading id="destinations-title" {...copy} /><Link href={`/${locale}/destinations`} className="inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-ocean">{copy.all}<ArrowUpRight size={18} aria-hidden="true" /></Link></div>
    <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-6">{copy.items.map((item, index) => <DestinationCard key={item.name} item={item} visual={visuals[index]} locale={locale} imageLabel={imageLabel} linkLabel={copy.link} index={index} />)}</div>
  </Container></section>;
}
