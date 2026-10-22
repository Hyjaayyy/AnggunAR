import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getGalleryDictionary, galleryCategoryLabels } from "@/i18n/gallery";
import { getDestinationsDictionary } from "@/i18n/destinations";
import { getGalleryPhotos } from "@/lib/gallery";
import type { ContentQuery } from "@/lib/destinations";
import { Container } from "@/components/ui/container";
import { ButtonLink } from "@/components/ui/button-link";
import { EditorialHero } from "@/components/destinations/editorial-hero";
import { EmptyState } from "@/components/ui/empty-state";
import { PhotoGallery } from "@/components/gallery/photo-gallery";

type Props = { params: Promise<{ locale: string }>; searchParams: Promise<ContentQuery> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const t = getGalleryDictionary(locale); return { title: t.headline, description: t.description };
}
export default async function GalleryPage({ params, searchParams }: Props) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const query = await searchParams; const t = getGalleryDictionary(locale); const destinationCopy = getDestinationsDictionary(locale);
  const allPhotos = await getGalleryPhotos();
  const photos = allPhotos.filter((photo) => !query.category || photo.category === query.category);
  const categories = [...new Set(allPhotos.map((photo) => photo.category))];
  return <div className="ocean-page"><EditorialHero locale={locale} {...t} visual={destinationCopy.visual} /><section className="section-space ocean-mist" aria-label={t.title}><Container>
    {allPhotos.length > 0 && <form action={`/${locale}/gallery`} method="get" className="ocean-filter mb-10 flex flex-wrap items-end gap-4 p-5 sm:p-6"><label className="flex max-w-full flex-col gap-2 text-sm font-semibold">{t.category}<select className="min-h-12 rounded-lg border border-line bg-white px-3" name="category" defaultValue={typeof query.category === "string" ? query.category : ""}><option value="">{t.all}</option>{categories.map((key) => <option key={key} value={key}>{galleryCategoryLabels[locale][key]}</option>)}</select></label><button type="submit" className="min-h-12 rounded-lg bg-ocean px-5 text-sm font-semibold text-white hover:bg-navy">{t.apply}</button><Link className="inline-flex min-h-12 items-center text-sm font-semibold text-ocean" href={`/${locale}/gallery`}>{t.reset}</Link></form>}
    {photos.length ? <PhotoGallery key={photos.map((photo) => photo.id).join(",")} photos={photos} locale={locale} copy={t} /> : <EmptyState kind="gallery" title={allPhotos.length ? t.noResults : t.empty} description={t.emptyDescription}><ButtonLink variant="secondary" href={`/${locale}/${allPhotos.length ? "gallery" : "destinations"}`}>{allPhotos.length ? t.reset : destinationCopy.title}</ButtonLink></EmptyState>}
  </Container></section></div>;
}
