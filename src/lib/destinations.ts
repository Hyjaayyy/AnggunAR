import "server-only";
import { destinations } from "@/data/destinations";
import { getPackages } from "@/lib/tour-packages";
import type { Locale } from "@/i18n/config";
import type { Destination } from "@/types/destination";

export type ContentQuery = Record<string, string | string[] | undefined>;
export function getDestinations() { return destinations.filter((item) => item.status === "published" && item.sources.length > 0); }
export function getDestination(slug: string) { return getDestinations().find((item) => item.slug === slug); }
export function filterDestinations(items: readonly Destination[], query: ContentQuery, locale: Locale) {
  const q = typeof query.q === "string" ? query.q.trim().slice(0,200).toLocaleLowerCase(locale) : "";
  return items.filter((item) => (!q || item.content[locale].name.toLocaleLowerCase(locale).includes(q)) && (!query.category || item.category === query.category));
}
// Package identifiers are stable slugs in Phase 3; no inferred geographic relationships.
export function getRelatedPackages(destination: Destination) { return getPackages().filter((item) => destination.relatedPackageIds.includes(item.slug)); }
