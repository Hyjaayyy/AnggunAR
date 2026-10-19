import Link from "next/link";
import { ArrowUpRight, Map } from "lucide-react";
import type { PackageCopy } from "@/i18n/home";
import type { Locale } from "@/i18n/config";

export function TourPackageCard({ item, locale, status, price, linkLabel, index }: {
  item: PackageCopy; locale: Locale; status: string; price: string; linkLabel: string; index: number;
}) {
  return <article className="flex min-w-0 flex-col rounded-xl border border-line bg-white p-6 sm:p-7">
    <div className="flex items-center justify-between gap-3"><Map className="text-ocean" size={24} strokeWidth={1.5} aria-hidden="true" /><span className="rounded-full bg-canvas px-3 py-1.5 text-[10px] font-semibold tracking-wide text-muted uppercase">{status}</span></div>
    <p className="mt-8 text-[11px] font-semibold tracking-wider text-ocean uppercase">0{index + 1} / {item.category}</p>
    <h3 className="mt-3 text-xl font-semibold tracking-tight">{item.name}</h3>
    <p className="mt-3 flex-1 text-sm leading-6 text-muted">{item.description}</p>
    <p className="mt-7 border-t border-line pt-5 text-xs text-muted">{price}</p>
    <Link href={`/${locale}/packages`} className="mt-2 inline-flex min-h-11 items-center justify-between gap-3 text-sm font-semibold text-ocean hover:text-navy" aria-label={`${linkLabel}: ${item.name}`}>{linkLabel}<ArrowUpRight size={17} aria-hidden="true" /></Link>
  </article>;
}
