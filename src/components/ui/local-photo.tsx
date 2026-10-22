import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { resolveLocalPhoto } from "@/lib/local-photos";
import type { LocalPhoto as Photo } from "@/types/destination";
import type { Locale } from "@/i18n/config";

export async function LocalPhoto({ photo, locale, fallback, wide = false, sizes = "(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" }: { photo: Photo; locale: Locale; fallback: string; wide?: boolean; sizes?: string }) {
  const src = await resolveLocalPhoto(photo.src);
  return <div data-local-photo className={`relative isolate overflow-hidden rounded-xl bg-[#dcebea] ${wide ? "aspect-[16/9]" : "aspect-[4/3]"}`}>
    {src ? <Image src={src} alt={photo.alt[locale]} fill sizes={sizes} style={{ objectPosition: photo.position }} className="object-cover" /> : <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden bg-[#e4eeed] p-5 text-center text-navy"><div aria-hidden="true" className="absolute -bottom-12 -left-10 h-1/2 w-[140%] rotate-[-8deg] rounded-[50%] bg-ocean/10" /><ImageIcon size={30} strokeWidth={1} aria-hidden="true" /><span className="relative max-w-64 text-xs leading-5">{fallback}</span></div>}
  </div>;
}
