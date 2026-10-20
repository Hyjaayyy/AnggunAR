import type { PackageImage, TourPackage } from "@/types/tour-package";

function image(slug: string, name: string, slot: "cover" | "detail-01" | "detail-02"): PackageImage {
  return { src: `/images/packages/${slug}/${slot}.webp`, position: "50% 50%", alt: { id: `${name} - foto ${slot}`, en: `${name} - ${slot} photo` } };
}

// Editorial concepts only. No official itinerary, duration, price or facilities supplied.
const draftPackages: readonly TourPackage[] = [
  { slug: "batam-city-escape", name: "Batam City Escape", category: "city", id: "Kota & ikon", en: "City & landmarks" },
  { slug: "coastal-slow-days", name: "Coastal Slow Days", category: "coast", id: "Pantai & suasana", en: "Coast & atmosphere" },
  { slug: "island-perspectives", name: "Island Perspectives", category: "islands", id: "Pulau & bahari", en: "Islands & sea" },
].map((item): TourPackage => ({
  slug: item.slug, status: "draft", demo: true, price: null, durationDays: null, location: null,
  category: { id: item.category, label: { id: item.id, en: item.en } },
  images: [image(item.slug, item.name, "cover"), image(item.slug, item.name, "detail-01"), image(item.slug, item.name, "detail-02")],
  content: {
    id: { name: item.name, description: "Konsep editorial untuk pratinjau desain. Rincian perjalanan resmi belum dikonfirmasi. Contoh ini bukan penawaran dan belum dapat dipesan." },
    en: { name: item.name, description: "An editorial concept for design preview. Official travel details have not been confirmed. This example is not an offer and cannot be booked." },
  },
  itinerary: null, included: null, excluded: null, information: [],
}));

// Add confirmed package objects here. Keep editorial demo entries in draftPackages.
export const tourPackages: readonly TourPackage[] = [...draftPackages];
