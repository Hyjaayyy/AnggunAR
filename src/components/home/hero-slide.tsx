import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { CSSProperties } from "react";
import type { HeroSlideConfig } from "@/data/hero-slides";
import type { HeroSlideCopy } from "@/i18n/hero";
import type { Locale } from "@/i18n/config";

export function HeroSlide({ config, copy, locale, active, index, total, slideLabel, fallbackLabel, imageFailed, onImageError }: {
  config: HeroSlideConfig; copy: HeroSlideCopy; locale: Locale; active: boolean;
  index: number; total: number; slideLabel: string; fallbackLabel: string;
  imageFailed: boolean; onImageError: () => void;
}) {
  const Heading = active ? "h1" : "h2";
  const hasImage = config.image.src !== null && !imageFailed;
  const style = {
    "--hero-focus-desktop": config.image.desktopPosition,
    "--hero-focus-mobile": config.image.mobilePosition,
  } as CSSProperties;

  return (
    <div
      id={`hero-slide-${config.id}`}
      role="group"
      aria-roledescription={slideLabel}
      aria-label={`${index + 1} / ${total}: ${copy.title}`}
      aria-hidden={!active}
      inert={!active}
      className={`hero-slide ${active ? "hero-slide-active" : ""}`}
      style={style}
    >
      <div className={`hero-backdrop hero-backdrop-${config.fallback}`} aria-hidden="true" />
      {hasImage && <Image
        src={config.image.src!}
        alt={copy.imageAlt}
        fill
        sizes="100vw"
        priority={index === 0}
        className="hero-photo object-cover"
        onError={onImageError}
      />}
      <div className="hero-overlay" aria-hidden="true" />
      <div className="container hero-slide-content">
        <p className="eyebrow !text-aqua">{copy.eyebrow}</p>
        <Heading className="mt-5 max-w-3xl text-[clamp(2rem,4.6vw,4.5rem)] leading-[1.13] font-semibold tracking-[-.04em] text-white">{copy.title}</Heading>
        <p className="mt-6 max-w-lg text-sm leading-7 text-slate-200 sm:text-base sm:leading-8">{copy.description}</p>
        <Link href={`/${locale}/${config.href}`} className="mt-7 inline-flex min-h-12 max-w-full items-center justify-center gap-4 rounded-lg bg-white px-5 py-3 text-sm leading-6 font-semibold text-navy transition-colors hover:bg-slate-100">{copy.cta}<ArrowUpRight size={19} aria-hidden="true" className="shrink-0" /></Link>
      </div>
      {!hasImage && <p className="hero-fallback-label text-[10px] leading-5 text-slate-300">{fallbackLabel}</p>}
    </div>
  );
}
