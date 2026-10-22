import "server-only";
import { galleryPhotos } from "@/data/gallery";
import { resolveLocalPhoto } from "./local-photos";
import type { ResolvedGalleryPhoto } from "@/types/gallery";

export async function getGalleryPhotos(): Promise<ResolvedGalleryPhoto[]> {
  const resolved = await Promise.all(galleryPhotos.filter((photo) => photo.status === "published" && photo.permission?.trim()).map(async (photo): Promise<ResolvedGalleryPhoto | null> => {
    const src = await resolveLocalPhoto(photo.image.src);
    return src ? { ...photo, image: { ...photo.image, src } } : null;
  }));
  return resolved.filter((photo): photo is ResolvedGalleryPhoto => photo !== null);
}
