import Link from "next/link";
import { ArrowDown, MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { TravelVisual } from "./travel-visual";
import type { HomeDictionary } from "@/i18n/home";
import type { Locale } from "@/i18n/config";

export function HeroSection({ copy, locale }: { copy: HomeDictionary["hero"]; locale: Locale }) {
  return <section aria-labelledby="hero-title" className="overflow-hidden border-b border-line bg-white">
    <Container className="grid gap-10 pt-10 pb-10 sm:pt-14 lg:grid-cols-[1.08fr_1fr] lg:items-center lg:gap-12 lg:py-16">
      <div className="min-w-0 py-2 lg:py-8">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h1 id="hero-title" className="mt-6 text-[clamp(2.1rem,4.5vw,4.25rem)] leading-[1.15] font-semibold tracking-[-.045em]">{copy.title}<span className="mt-2 block text-ocean">{copy.accent}</span></h1>
        <p className="mt-6 max-w-lg text-base leading-8 text-muted">{copy.description}</p>
        <div className="mt-8 flex flex-wrap gap-3"><ButtonLink href={`/${locale}/destinations`}>{copy.primary}</ButtonLink><ButtonLink href={`/${locale}/packages`} variant="secondary">{copy.secondary}</ButtonLink></div>
        <Link href="#introduction" className="mt-10 inline-flex min-h-11 items-center gap-3 text-xs font-medium text-muted"><ArrowDown size={16} className="text-ocean" aria-hidden="true" />{copy.scroll}</Link>
      </div>
      <figure className="relative min-w-0">
        <TravelVisual kind="coast" label={copy.visualLabel} priority sizes="(max-width: 1023px) 100vw, 50vw" className="aspect-[6/5] rounded-t-[5rem] rounded-b-xl lg:aspect-[5/6] lg:rounded-t-[7rem]" />
        <figcaption className="mt-4 flex flex-wrap items-center justify-between gap-x-5 gap-y-2 text-[11px] leading-5 text-muted"><span className="flex items-center gap-1.5 font-semibold text-navy"><MapPin size={13} aria-hidden="true" />{copy.location}</span><span>{copy.caption}</span></figcaption>
      </figure>
    </Container>
  </section>;
}
