import Link from "next/link";
import { Container } from "@/components/ui/container";
import { getDestinationsDictionary } from "@/i18n/destinations";
import type { Locale } from "@/i18n/config";

export function EditorialHero({ locale, title, headline, eyebrow, description, visual }: { locale: Locale; title: string; headline: string; eyebrow: string; description: string; visual: string }) {
  const t = getDestinationsDictionary(locale);
  return <section className="ocean-hero dark-surface overflow-hidden bg-navy text-white"><Container><div className="ocean-hero-content relative">
    <div aria-hidden="true" className="pointer-events-none absolute -right-40 bottom-[-14rem] hidden h-[28rem] w-[38rem] rotate-[-15deg] rounded-[50%] border border-aqua/25 bg-ocean/25 lg:block" />
    <nav aria-label={t.breadcrumb} className="relative mb-9 flex flex-wrap gap-3 text-sm"><Link href={`/${locale}`} className="underline underline-offset-4">{t.home}</Link><span aria-hidden="true">/</span><span aria-current="page">{title}</span></nav>
    <div className="relative max-w-3xl"><p className="text-xs font-semibold tracking-[.18em] text-aqua uppercase">{eyebrow}</p><h1 className="mt-5 text-4xl leading-[1.15] font-semibold tracking-tight sm:text-5xl lg:text-6xl">{headline}</h1><p className="mt-6 max-w-2xl text-base leading-8 text-white/85 sm:text-lg">{description}</p></div>
    <p className="relative mt-10 text-xs text-white/70">{visual}</p>
  </div></Container></section>;
}
