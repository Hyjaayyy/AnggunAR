import Link from "next/link";
import { Compass, MapPin } from "lucide-react";
import { business } from "@/lib/business";
import { getDictionary, type PageSlug } from "@/i18n/dictionaries";
import { getHomeDictionary } from "@/i18n/home";
import type { Locale } from "@/i18n/config";
import { Container } from "@/components/ui/container";

export function Footer({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const copy = getHomeDictionary(locale).navigation;
  const groups: { label: string; slugs: PageSlug[] }[] = [
    { label: copy.explore, slugs: ["destinations", "packages", "gallery"] },
    { label: copy.company, slugs: ["about", "contact", "booking"] },
    { label: copy.legal, slugs: ["faq", "privacy", "terms"] },
  ];
  return (
    <footer className="border-t border-line bg-white">
      <Container>
        <div className="grid gap-10 py-12 lg:grid-cols-[1.2fr_2fr] lg:gap-20 lg:py-16">
          <div><Link href={`/${locale}`} className="inline-flex items-center gap-3 font-heading text-base font-bold text-navy"><Compass size={28} strokeWidth={1.4} className="shrink-0 text-ocean" aria-hidden="true" /><span>{business.name}</span></Link><p className="mt-5 max-w-xs text-sm leading-7 text-muted">{copy.footer}</p><p className="mt-5 flex items-start gap-2 text-xs leading-6 text-muted"><MapPin size={15} aria-hidden="true" className="mt-1 shrink-0 text-ocean" />{copy.location}</p></div>
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">{groups.map((group) => <nav key={group.label} aria-label={group.label}><h2 className="text-sm font-semibold">{group.label}</h2><ul className="mt-3 space-y-1">{group.slugs.map((slug) => <li key={slug}><Link href={`/${locale}/${slug}`} className="inline-flex min-h-11 items-center text-sm text-muted hover:text-ocean">{t.pages[slug].title}</Link></li>)}</ul></nav>)}</div>
        </div>
        <div className="flex flex-wrap justify-between gap-3 border-t border-line py-6 text-[11px] leading-6 text-muted"><span>{business.name}</span><span>{copy.availability}</span></div>
      </Container>
    </footer>
  );
}
