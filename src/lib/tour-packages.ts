import "server-only";
import { access } from "node:fs/promises";
import path from "node:path";
import { tourPackages } from "@/data/tour-packages";
import type { Locale } from "@/i18n/config";
import type { TourPackage } from "@/types/tour-package";
import { isOwnerReviewAccess, type OwnerReviewAccess } from "@/lib/owner-review";

export type PackageQuery = Record<string, string | string[] | undefined>;
export function getPackages(access?: OwnerReviewAccess | null): readonly TourPackage[] {
  return tourPackages.filter((p) => (p.status === "published" && !p.demo) || isOwnerReviewAccess(access));
}
export function getPackage(slug: string, access?: OwnerReviewAccess | null) { return getPackages(access).find((p) => p.slug === slug); }
export function filterPackages(items: readonly TourPackage[], query: PackageQuery, locale: Locale) {
  const q = typeof query.q === "string" ? query.q.trim().toLocaleLowerCase(locale).slice(0, 200) : "";
  return items.filter((p) => (!q || p.content[locale].name.toLocaleLowerCase(locale).includes(q))
    && (!query.destination || query.destination === p.location?.id)
    && (!query.category || query.category === p.category.id)
    && (!query.duration || String(p.durationDays) === query.duration));
}
export function packagePrice(p: TourPackage, locale: Locale, fallback: string) {
  const amount = isMarketDraft(p) ? p.planning?.indicativePricePerPerson : p.price?.amount;
  return amount ? new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount) : fallback;
}
export function isMarketDraft(p: TourPackage): boolean { return p.status === "draft" && !p.demo && p.planning?.verification === "unverified"; }
export function packageDuration(p: TourPackage, locale: Locale, fallback: string): string {
  if (!p.durationDays) return fallback;
  const nights = p.planning?.durationNights;
  return `${p.durationDays} ${locale === "id" ? "hari" : p.durationDays === 1 ? "day" : "days"}${nights ? ` ${nights} ${locale === "id" ? "malam" : nights === 1 ? "night" : "nights"}` : ""}`;
}
export async function availableImage(src: string | null): Promise<string | null> {
  if (!src || !/^\/images\/packages\/[a-z0-9-]+\/(cover|detail-01|detail-02)\.webp$/.test(src)) return null;
  try { await access(path.join(process.cwd(), "public", src)); return src; } catch { return null; }
}
