import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button-link";
import { TourPackageCard } from "@/components/packages/tour-package-card";
import type { HomeDictionary } from "@/i18n/home";
import type { Locale } from "@/i18n/config";

// Tidak ada klaim popularitas: sampai paket resmi tersedia, tampilkan konsep secara eksplisit.
export function PopularPackages({ copy, locale }: { copy: HomeDictionary["packages"]; locale: Locale }) {
  return <section aria-labelledby="packages-title" className="section-space"><Container>
    <div className="flex flex-wrap items-end justify-between gap-6"><SectionHeading id="packages-title" {...copy} /><ButtonLink variant="secondary" href={`/${locale}/packages`}>{copy.all}</ButtonLink></div>
    <div className="mt-10 grid gap-5 md:grid-cols-3">{copy.items.map((item, index) => <TourPackageCard key={item.name} item={item} index={index} locale={locale} status={copy.status} price={copy.price} linkLabel={copy.link} />)}</div>
  </Container></section>;
}
