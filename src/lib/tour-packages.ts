import "server-only";
import { access } from "node:fs/promises";
import path from "node:path";
import { tourPackages } from "@/data/tour-packages";
import type { Locale } from "@/i18n/config";
import type { TourPackage } from "@/types/tour-package";

export type PackageQuery = Record<string, string | string[] | undefined>;
export function previewAllowed(query: PackageQuery): boolean { return process.env.NODE_ENV === "development" && query.preview === "draft"; }
export function getPackages(preview = false): readonly TourPackage[] {
  return tourPackages.filter((p) => (p.status === "published" && !p.demo) || (preview && process.env.NODE_ENV === "development"));
}
export function getPackage(slug: string, preview = false) { return getPackages(preview).find((p) => p.slug === slug); }
export function filterPackages(items: readonly TourPackage[], query: PackageQuery, locale: Locale) {
  const q = typeof query.q === "string" ? query.q.trim().toLocaleLowerCase(locale).slice(0, 200) : "";
  return items.filter((p) => (!q || p.content[locale].name.toLocaleLowerCase(locale).includes(q))
    && (!query.destination || query.destination === p.location?.id)
    && (!query.category || query.category === p.category.id)
    && (!query.duration || String(p.durationDays) === query.duration));
}
export function packagePrice(p: TourPackage, locale: Locale, fallback: string) {
  return p.price ? new Intl.NumberFormat(locale === "id" ? "id-ID" : "en-US", { style: "currency", currency: p.price.currency, maximumFractionDigits: 0 }).format(p.price.amount) : fallback;
}
export async function availableImage(src: string | null): Promise<string | null> {
  if (!src || !/^\/images\/packages\/[a-z0-9-]+\/(cover|detail-01|detail-02)\.webp$/.test(src)) return null;
  try { await access(path.join(process.cwd(), "public", src)); return src; } catch { return null; }
}
