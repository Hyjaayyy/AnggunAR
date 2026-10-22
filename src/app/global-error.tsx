"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Root-error recovery must reload the document without relying on the failed router. */

import { getErrorDictionary } from "@/i18n/errors";
import "@/styles/globals.css";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const id = getErrorDictionary("id");
  const en = getErrorDictionary("en");
  return <html lang="id"><body><main className="container py-16" data-global-error>
    <div className="ocean-panel p-6 sm:p-10">
      <h1 className="text-2xl font-semibold">{id.title} / <span lang="en">{en.title}</span></h1>
      <p className="mt-5 leading-7 text-muted">{id.description}</p>
      <p lang="en" className="mt-3 leading-7 text-muted">{en.description}</p>
      <div className="mt-8 flex flex-wrap gap-5">
        <button type="button" onClick={reset} className="min-h-12 rounded-lg bg-ocean px-5 py-3 font-semibold text-white">{id.retry} / <span lang="en">{en.retry}</span></button>
        <a href="/id" className="inline-flex min-h-12 items-center font-semibold text-ocean">Beranda Indonesia</a>
        <a href="/en" lang="en" className="inline-flex min-h-12 items-center font-semibold text-ocean">English home</a>
      </div>
    </div>
  </main></body></html>;
}
