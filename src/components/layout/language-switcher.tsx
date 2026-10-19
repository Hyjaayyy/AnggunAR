"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

export function LanguageSwitcher({ locale, label }: { locale: Locale; label: string }) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean).slice(1);

  return (
    <nav aria-label={label} className="flex shrink-0 rounded-lg border border-line p-0.5 text-[11px] font-semibold">
      {locales.map((target) => (
        <Link
          key={target}
          href={`/${[target, ...segments].join("/")}`}
          hrefLang={target}
          lang={target}
          aria-current={locale === target ? "true" : undefined}
          className={`flex min-h-10 min-w-8 items-center justify-center rounded-md px-2 ${locale === target ? "bg-navy text-white" : "text-muted hover:bg-canvas"}`}
        >
          {target.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
