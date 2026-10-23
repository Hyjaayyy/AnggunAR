import { PackageList } from "@/components/packages/package-list";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button-link";
import { TourPackageCard } from "@/components/packages/tour-package-card";
import type { HomeDictionary } from "@/i18n/home";
import type { Locale } from "@/i18n/config";
import { getPackages } from "@/lib/tour-packages";
import { getPackagesDictionary } from "@/i18n/packages";

export function PopularPackages({ copy, locale }: { copy: HomeDictionary["packages"]; locale: Locale }) {
  const items = getPackages().slice(0, 3); const t = getPackagesDictionary(locale);
  return <section aria-labelledby="packages-title" className="section-space ocean-light"><Container>
    <div className="flex flex-wrap items-end justify-between gap-6"><SectionHeading id="packages-title" eyebrow={copy.eyebrow} title={copy.title} description={items.length ? t.description : t.emptyDescription} /><ButtonLink variant="secondary" href={`/${locale}/packages`}>{t.title}</ButtonLink></div>
    {items.length ? <PackageList key={items.map((item) => item.slug).join(",")} count={items.length} label={t.title} hint={t.carouselHint} positionLabel={t.carouselPosition} className="mt-10">{items.map((item) => <TourPackageCard key={item.slug} item={item} locale={locale} />)}</PackageList> : <div className="ocean-panel mt-10 p-8"><h3 className="text-xl font-semibold">{t.empty}</h3><div className="mt-6"><ButtonLink variant="secondary" href={`/${locale}/contact`}>{t.contact}</ButtonLink></div></div>}
  </Container></section>;
}
