import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { availableImage } from "@/lib/tour-packages";
import type { PackageImage } from "@/types/tour-package";
import type { Locale } from "@/i18n/config";

export async function PackagePhoto({ image, locale, label, main = false }: { image: PackageImage; locale: Locale; label: string; main?: boolean }) {
  const src = await availableImage(image.src);
  return <div data-package-photo className={`relative overflow-hidden bg-navy ${main ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
    {src ? <Image src={src} alt={image.alt[locale]} fill sizes={main ? "(min-width: 1024px) 70vw, 100vw" : "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"} style={{ objectPosition: image.position }} className="object-cover" />
      : <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linear-to-br from-navy to-ocean p-4 text-center text-white"><ImageIcon size={28} strokeWidth={1} aria-hidden="true" /><span className="text-xs leading-5">{label}</span></div>}
  </div>;
}
