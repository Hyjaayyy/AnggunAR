"use client";

import { useEffect, useState } from "react";
import { HERO_AUTOPLAY_MS, heroSlides } from "@/data/hero-slides";
import type { HeroDictionary } from "@/i18n/hero";
import type { Locale } from "@/i18n/config";
import { HeroSlide } from "./hero-slide";
import { HeroControls } from "./hero-controls";
import styles from "./hero-carousel.module.css";

export function HeroCarousel({ copy, locale }: { copy: HeroDictionary; locale: Locale }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const running = enabled && !hovered && !focused && visible && !reducedMotion;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setReducedMotion(media.matches);
    const updateVisibility = () => setVisible(document.visibilityState === "visible");
    updateMotion();
    updateVisibility();
    media.addEventListener("change", updateMotion);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      media.removeEventListener("change", updateMotion);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setActiveIndex((current) => (current + 1) % heroSlides.length), HERO_AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [running, activeIndex]);

  const previous = () => setActiveIndex((current) => (current - 1 + heroSlides.length) % heroSlides.length);
  const next = () => setActiveIndex((current) => (current + 1) % heroSlides.length);

  return (
    <section
      className={`${styles.carousel} dark-surface`}
      role="region"
      aria-roledescription="carousel"
      aria-label={copy.label}
      data-active-slide={activeIndex}
      data-autoplay={running ? "running" : "paused"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={(event) => {
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.key === "ArrowLeft") { event.preventDefault(); previous(); }
        if (event.key === "ArrowRight") { event.preventDefault(); next(); }
      }}
    >
      <div className="hero-slides">
        {heroSlides.map((slide, index) => <HeroSlide key={slide.id} config={slide} copy={copy.slides[slide.id]} locale={locale} active={activeIndex === index} index={index} total={heroSlides.length} slideLabel={copy.slide} fallbackLabel={copy.fallback} imageFailed={!!failedImages[slide.id]} onImageError={() => setFailedImages((current) => ({ ...current, [slide.id]: true }))} />)}
      </div>
      <HeroControls copy={copy} slides={heroSlides} activeIndex={activeIndex} enabled={enabled && !reducedMotion} reducedMotion={reducedMotion} onPrevious={previous} onNext={next} onSelect={setActiveIndex} onToggle={() => setEnabled((value) => !value)} />
      <p className="sr-only" aria-live={running ? "off" : "polite"} aria-atomic="true">{activeIndex + 1} / {heroSlides.length}: {copy.slides[heroSlides[activeIndex].id].title}</p>
      <p id="hero-motion-note" className="sr-only">{reducedMotion ? copy.reducedMotion : ""}</p>
    </section>
  );
}
