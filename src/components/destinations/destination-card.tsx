import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { TravelVisual, type VisualKind } from "@/components/home/travel-visual";
import type { DestinationCopy } from "@/i18n/home";
import type { Locale } from "@/i18n/config";

export function DestinationCard({ item, visual, locale, imageLabel, linkLabel, index }: {
  item: DestinationCopy; visual: VisualKind; locale: Locale; imageLabel: string; linkLabel: string; index: number;
}) {
  return <article className="min-w-0">
    <TravelVisual kind={visual} label={imageLabel} className="aspect-[4/3] rounded-xl" />
    <div className="mt-5 flex items-center gap-3 text-[11px] font-semibold tracking-wider text-ocean uppercase"><span>0{index + 1}</span><span className="h-px w-5 bg-line" /><span>{item.category}</span></div>
    <h3 className="mt-3 text-xl font-semibold tracking-tight">{item.name}</h3>
    <p className="mt-3 text-sm leading-6 text-muted">{item.description}</p>
    <Link href={`/${locale}/destinations`} className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-ocean hover:text-navy" aria-label={`${linkLabel}: ${item.name}`}>{linkLabel}<ArrowUpRight size={16} aria-hidden="true" /></Link>
  </article>;
}
