import type { Locale } from "@/i18n/config";

export type LocalizedText = Record<Locale, string>;
export type LocalPhoto = { src: string | null; alt: LocalizedText; position: string };
export const destinationCategories = ["beaches-islands", "landmarks", "nature", "culture-heritage", "city-attractions"] as const;
export type DestinationCategory = (typeof destinationCategories)[number];
export type Destination = {
  id: string;
  slug: string;
  category: DestinationCategory;
  location: LocalizedText;
  status: "draft" | "published";
  images: readonly [LocalPhoto, LocalPhoto, LocalPhoto];
  content: Record<Locale, { name: string; shortDescription: string; description: string; highlights: string[] }>;
  relatedPackageIds: readonly string[];
  sources: readonly { title: string; url: string }[];
};
