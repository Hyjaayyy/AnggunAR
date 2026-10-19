import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { TravelVisual } from "./travel-visual";
import type { HomeDictionary } from "@/i18n/home";
import type { Locale } from "@/i18n/config";

export function TravelInspiration({ copy, locale }: { copy: HomeDictionary["inspiration"]; locale: Locale }) {
  return <section aria-labelledby="inspiration-title" className="section-space bg-white"><Container className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
    <figure className="min-w-0"><TravelVisual kind="islands" label={copy.visualLabel} sizes="(max-width: 1023px) 100vw, 50vw" className="aspect-[5/4] rounded-xl rounded-tr-[5rem]" /><figcaption className="mt-4 text-xs leading-6 text-muted">{copy.caption}</figcaption></figure>
    <div><p className="mb-7 text-[11px] tracking-wider text-muted uppercase">{copy.label}</p><SectionHeading id="inspiration-title" {...copy} /><Link href={`/${locale}/destinations`} className="mt-6 inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-ocean hover:text-navy">{copy.link}<ArrowUpRight size={17} aria-hidden="true" /></Link></div>
  </Container></section>;
}
