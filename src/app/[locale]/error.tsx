"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { defaultLocale, isLocale } from "@/i18n/config";
import { getErrorDictionary } from "@/i18n/errors";

export default function PageError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const params = useParams<{ locale: string }>();
  const requestedLocale = params?.locale ?? defaultLocale;
  const locale = isLocale(requestedLocale) ? requestedLocale : defaultLocale;
  const copy = getErrorDictionary(locale);
  return <section className="container py-16" aria-labelledby="page-error-title" data-page-error>
    <div className="ocean-panel p-6 sm:p-10">
      <h1 id="page-error-title" className="text-3xl font-semibold">{copy.title}</h1>
      <p className="mt-5 max-w-2xl leading-7 text-muted">{copy.description}</p>
      <div className="mt-8 flex flex-wrap gap-5">
        <button type="button" onClick={reset} className="min-h-12 rounded-lg bg-ocean px-5 py-3 font-semibold text-white">{copy.retry}</button>
        <Link className="inline-flex min-h-12 items-center font-semibold text-ocean" href={`/${locale}`}>{copy.home}</Link>
      </div>
    </div>
  </section>;
}
