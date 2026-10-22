import { Container } from "@/components/ui/container";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button-link";
import type { HomeDictionary } from "@/i18n/home";
import type { Locale } from "@/i18n/config";

export function FinalCTA({ copy, locale }: { copy: HomeDictionary["final"]; locale: Locale }) {
  return <section aria-labelledby="final-title" className="dark-surface border-b border-white/15 bg-navy text-white"><Container className="grid gap-8 py-14 sm:py-20 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-16">
    <div><p className="eyebrow !text-aqua">{copy.eyebrow}</p><h2 id="final-title" className="mt-5 max-w-xl text-3xl leading-tight font-semibold tracking-tight sm:text-4xl">{copy.title}</h2><p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">{copy.description}</p></div>
    <div><div className="flex flex-wrap gap-3"><ButtonLink href={`/${locale}/packages`} variant="light">{copy.primary}</ButtonLink><LinkToContact href={`/${locale}/contact`} label={copy.secondary} /></div><p className="mt-5 max-w-md text-xs leading-6 text-slate-300">{copy.note}</p></div>
  </Container></section>;
}

function LinkToContact({ href, label }: { href: string; label: string }) {
  return <Link href={href} className="inline-flex min-h-12 items-center justify-center rounded-lg border border-slate-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10">{label}</Link>;
}
