import Link from "next/link";
import { ArrowUpRight, Compass } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomeDictionary } from "@/i18n/home";
import type { Locale } from "@/i18n/config";

export function IntroductionSection({ copy, locale }: { copy: HomeDictionary["introduction"]; locale: Locale }) {
  return <section id="introduction" aria-labelledby="intro-title" className="section-space">
    <Container className="grid gap-10 lg:grid-cols-[1.5fr_1fr] lg:gap-24">
      <div><SectionHeading id="intro-title" {...copy} /><Link href={`/${locale}/about`} className="mt-5 inline-flex min-h-11 items-center gap-3 text-sm font-semibold text-ocean hover:text-navy">{copy.link}<ArrowUpRight size={17} aria-hidden="true" /></Link><p className="mt-3 max-w-lg text-xs leading-6 text-muted">{copy.note}</p></div>
      <aside className="flex flex-col justify-center border-l-2 border-aqua py-2 pl-7 lg:pl-10"><Compass size={40} strokeWidth={1} aria-hidden="true" className="text-ocean" /><h3 className="mt-6 max-w-xs text-2xl leading-snug font-medium">{copy.sideTitle}</h3><p className="mt-4 max-w-sm text-sm leading-7 text-muted">{copy.sideDescription}</p></aside>
    </Container>
  </section>;
}
