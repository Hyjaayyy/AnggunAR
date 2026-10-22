import type { LocalizedText, LocalPhoto } from "./destination";

export const galleryCategories = ["destinations", "beaches-islands", "landmarks", "travel-moments"] as const;
export type GalleryCategory = (typeof galleryCategories)[number];
export type GalleryPhoto = {
  id: string;
  status: "draft" | "published";
  category: GalleryCategory;
  image: LocalPhoto;
  caption: LocalizedText;
  // Record confirmed permission before publication; null keeps the item private.
  permission: string | null;
};
export type ResolvedGalleryPhoto = Omit<GalleryPhoto, "image"> & { image: LocalPhoto & { src: string } };
