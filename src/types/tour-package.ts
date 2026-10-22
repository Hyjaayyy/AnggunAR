import type { Locale } from "@/i18n/config";

export type Translated = Record<Locale, string>;
export type PackageImage = { src: string | null; alt: Translated; position: string };
export type TourPackage = {
  slug: string;
  status: "draft" | "published";
  demo: boolean;
  price: { amount: number; currency: "IDR" } | null;
  planning?: {
    verification: "unverified";
    indicativePricePerPerson: number;
    participantBasis: number | null;
    durationNights: number;
    researchedOn: string;
    sourceUrls: readonly string[];
  };
  durationDays: number | null;
  location: { id: string; label: Translated } | null;
  category: { id: string; label: Translated };
  images: readonly [PackageImage, PackageImage, PackageImage];
  content: Record<Locale, { name: string; description: string }>;
  itinerary: { day: number; title: Translated; activities: Record<Locale, string[]> }[] | null;
  included: Record<Locale, string[]> | null;
  excluded: Record<Locale, string[]> | null;
  information: { label: Translated; value: Translated }[];
};
