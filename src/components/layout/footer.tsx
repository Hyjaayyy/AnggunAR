import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/images/brand/anggun-ar-logo.png";
import { MapPin } from "lucide-react";
import { business } from "@/lib/business";
import { getDictionary, type PageSlug } from "@/i18n/dictionaries";
import { getHomeDictionary } from "@/i18n/home";
import type { Locale } from "@/i18n/config";
import { Container } from "@/components/ui/container";
import { BusinessContact } from "@/components/ui/business-contact";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const copy = getHomeDictionary(locale).navigation;
  const groups: { label: string; slugs: PageSlug[] }[] = [
    { label: copy.explore, slugs: ["destinations", "packages", "gallery"] },
    { label: copy.company, slugs: ["about", "contact", "booking"] },
    { label: copy.legal, slugs: ["faq", "privacy", "terms"] },
  ];
  return (
    <footer className="dark-surface border-t border-white/15 bg-navy text-white">
      <Container>
        <div className="grid gap-10 py-12 lg:grid-cols-[1.2fr_2fr] lg:gap-20 lg:py-16">
          <div><Link href={`/${locale}`} className="inline-flex items-center gap-3 font-heading text-base font-bold text-white"><span className="flex size-18 shrink-0 items-center justify-center rounded-lg bg-white p-2 sm:size-20"><Image src={logo} alt="Anggun AR Travel & Tour" sizes="(min-width: 640px) 64px, 56px" className="size-full object-contain" /></span><span>{business.name}</span></Link><p className="mt-5 max-w-xs text-sm leading-7 text-white/75">{copy.footer}</p><p className="mt-5 flex items-start gap-2 text-xs leading-6 text-white/75"><MapPin size={15} aria-hidden="true" className="mt-1 shrink-0 text-aqua" />{copy.location}</p></div>
          <div className="grid min-w-0 gap-8"><BusinessContact locale={locale} compact /><div className="grid grid-cols-2 gap-8 sm:grid-cols-3">{groups.map((group) => <nav key={group.label} aria-label={group.label}><h2 className="text-sm font-semibold">{group.label}</h2><ul className="mt-3 space-y-1">{group.slugs.map((slug) => <li key={slug}><Link href={`/${locale}/${slug}`} className="inline-flex min-h-11 items-center text-sm text-white/75 hover:text-aqua">{t.pages[slug].title}</Link></li>)}</ul></nav>)}</div></div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-white/15 py-6 text-[11px] leading-6 text-white/75"><span>{business.name}</span><span>{copy.availability}</span></div>
      </Container>
    </footer>
  );
}
