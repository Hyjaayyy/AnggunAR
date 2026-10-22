import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/images/brand/anggun-ar-logo.png";
import { business } from "@/lib/business";
import { getDictionary } from "@/i18n/dictionaries";
import type { Locale } from "@/i18n/config";
import { LanguageSwitcher } from "./language-switcher";
import { MainNavigation } from "./main-navigation";
import { getHomeDictionary } from "@/i18n/home";
import { Container } from "@/components/ui/container";

export function Header({ locale }: { locale: Locale }) {
  const t = getDictionary(locale);
  const navigation = ["destinations", "packages", "gallery", "about", "contact"] as const;
  const copy = getHomeDictionary(locale).navigation;
  const items = [{ href: `/${locale}`, label: t.home }, ...navigation.map((slug) => ({ href: `/${locale}/${slug}`, label: t.pages[slug].title }))];
  return (
    <header className="ocean-header sticky top-0 z-40 border-b border-line bg-white">
      <Container className="relative flex min-h-22 items-center justify-between gap-3 py-3 sm:gap-6">
        <Link href={`/${locale}`} aria-label={business.name} className="flex min-w-0 max-w-58 items-center gap-2.5 text-navy sm:gap-3">
          <Image src={logo} alt="Anggun AR Travel & Tour" sizes="(min-width: 640px) 64px, 48px" className="size-12 shrink-0 object-contain sm:size-16" priority />
          <span className="min-w-0"><span className="block font-heading text-[15px] leading-snug font-bold tracking-tight sm:text-lg">Anggun AR</span><span className="block text-[9px] leading-5 font-medium tracking-[.12em] text-muted uppercase sm:text-[10px]">Travel &amp; Tour</span></span>
        </Link>
        <div className="flex shrink-0 items-center gap-2 sm:gap-5">
          <div className="order-2 xl:order-0"><MainNavigation items={items} label={t.navigation} menuLabel={copy.menu} closeLabel={copy.close} cta={{ href: `/${locale}/packages`, label: copy.cta }} /></div>
          <LanguageSwitcher locale={locale} label={t.language} />
          <Link href={`/${locale}/packages`} className="hidden min-h-11 items-center rounded-lg bg-ocean px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-navy xl:inline-flex">{copy.cta}</Link>
        </div>
      </Container>
    </header>
  );
}
