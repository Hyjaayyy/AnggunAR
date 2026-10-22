"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { locales, type Locale } from "@/i18n/config";
import { destinationCategories } from "@/types/destination";
import { galleryCategories } from "@/types/gallery";

export function LanguageSwitcher(props: { locale: Locale; label: string }) {
  return <Suspense fallback={<LanguageLinks {...props} />}><QueryLanguageLinks {...props} /></Suspense>;
}
function QueryLanguageLinks(props: { locale: Locale; label: string }) {
  const query = useSearchParams();
  return <LanguageLinks {...props} search={query?.toString() ?? ""} />;
}
function LanguageLinks({ locale, label, search = "" }: { locale: Locale; label: string; search?: string }) {
  const pathname = usePathname() ?? `/${locale}`;
  const segments = pathname.split("/").filter(Boolean).slice(1);
  const current = new URLSearchParams(search);
  const kept = new URLSearchParams();
  const allowed = segments[0] === "packages" ? ["q", "destination", "category", "duration", "preview"] : segments[0] === "destinations" ? ["q", "category"] : segments[0] === "gallery" ? ["category"] : segments[0] === "booking" ? ["package"] : [];
  for (const key of allowed) { const value = current.get(key); if (value) kept.set(key, value); }
  const category = kept.get("category");
  if (segments[0] === "destinations" && category && !destinationCategories.some((value) => value === category)) kept.delete("category");
  if (segments[0] === "gallery" && category && !galleryCategories.some((value) => value === category)) kept.delete("category");
  const query = kept.size ? `?${kept}` : "";

  return (
    <nav aria-label={label} className="flex shrink-0 rounded-lg border border-line p-0.5 text-[11px] font-semibold">
      {locales.map((target) => (
        <Link
          key={target}
          href={`/${[target, ...segments].join("/")}${query}`}
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
