import Image from "next/image";
import { MapPin } from "lucide-react";
import { Container } from "@/components/ui/container";
import { aboutVisual } from "@/data/about-visual";
import type { AboutDictionary } from "@/i18n/about";
import type { Locale } from "@/i18n/config";
import styles from "./about.module.css";

export function AboutHero({ copy, locale }: { copy: AboutDictionary["hero"]; locale: Locale }) {
  return (
    <section aria-labelledby="about-title" className="ocean-hero dark-surface bg-navy text-white">
      <Container className="grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-[1.2fr_1fr] lg:gap-20 lg:py-20">
        <div className="min-w-0">
          <p className="eyebrow !text-aqua">{copy.eyebrow}</p>
          <h1 id="about-title" className="mt-6 max-w-2xl text-[clamp(2.1rem,4.5vw,4rem)] leading-[1.16] font-semibold tracking-tight">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-slate-200">{copy.subtitle}</p>
          <p className="mt-8 flex items-start gap-2 text-xs leading-6 text-slate-300">
            <MapPin size={15} aria-hidden="true" className="mt-1 shrink-0 text-aqua" />{copy.location}
          </p>
        </div>
        <figure className="min-w-0">
          <div className={`${styles.heroVisual} aspect-[5/4] sm:aspect-[4/3] lg:aspect-[5/4]`}>
            <div className={styles.coast} aria-hidden="true" />
            {aboutVisual.src && <Image
              src={aboutVisual.src}
              alt={aboutVisual.alt[locale]}
              fill
              priority
              sizes="(max-width: 1023px) 100vw, 45vw"
              className="object-cover"
              style={{ objectPosition: aboutVisual.position }}
            />}
            {!aboutVisual.src && <span className="absolute right-4 bottom-4 left-4 z-10 w-fit max-w-[calc(100%-2rem)] rounded bg-navy/90 px-3 py-2 text-[10px] leading-5 text-white">{copy.imageLabel}</span>}
          </div>
          <figcaption className="sr-only">{aboutVisual.src ? aboutVisual.alt[locale] : copy.imageLabel}</figcaption>
        </figure>
      </Container>
    </section>
  );
}
