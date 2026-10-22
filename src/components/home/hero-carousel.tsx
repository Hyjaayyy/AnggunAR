"use client";

import { useEffect, useRef, useState } from "react";
import { HERO_AUTOPLAY_MS, heroSlides } from "@/data/hero-slides";
import type { HeroDictionary } from "@/i18n/hero";
import type { Locale } from "@/i18n/config";
import { HeroSlide } from "./hero-slide";
import styles from "./hero-carousel.module.css";

export function HeroCarousel({ copy, locale }: { copy: HeroDictionary; locale: Locale }) {
  const region = useRef<HTMLElement>(null);
  const gesture = useRef<{ id: number; x: number; y: number; horizontal: boolean } | null>(null);
  const suppressClickUntil = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [enabled, setEnabled] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(true);
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
  const running = enabled && !dragging && !hovered && !focused && visible && !reducedMotion;

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

  useEffect(() => {
    const element = region.current;
    if (!element) return;
    let lastWheel = 0;
    let distance = 0;
    let changed = false;
    const wheel = (event: WheelEvent) => {
      if (event.ctrlKey || Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.25 || Math.abs(event.deltaX) < 2) return;
      if (event.target instanceof Element && event.target.closest("a, button, input, textarea, select, [contenteditable]")) return;
      // Only consume an intentional horizontal gesture; vertical scroll stays native.
      event.preventDefault();
      const now = performance.now();
      if (now - lastWheel > 250) { distance = 0; changed = false; }
      lastWheel = now;
      distance += event.deltaX * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1);
      if (!changed && Math.abs(distance) >= 60) {
        changed = true;
        setActiveIndex((current) => (current + (distance > 0 ? 1 : -1) + heroSlides.length) % heroSlides.length);
      }
    };
    element.addEventListener("wheel", wheel, { passive: false });
    return () => element.removeEventListener("wheel", wheel);
  }, []);

  const previous = () => setActiveIndex((current) => (current - 1 + heroSlides.length) % heroSlides.length);
  const next = () => setActiveIndex((current) => (current + 1) % heroSlides.length);

  return (
    <section
      ref={region}
      className={`${styles.carousel} dark-surface`}
      tabIndex={0}
      aria-describedby="hero-gesture-note hero-motion-note"
      aria-keyshortcuts="ArrowLeft ArrowRight Home End Space"
      data-dragging={dragging}
      role="region"
      aria-roledescription="carousel"
      aria-label={copy.label}
      data-active-slide={activeIndex}
      data-autoplay={running ? "running" : "paused"}
      onPointerDown={(event) => {
        if (!event.isPrimary || event.button !== 0) return;
        suppressClickUntil.current = 0;
        if (event.target instanceof Element && event.target.closest("a, button, input, textarea, select, [contenteditable]")) return;
        gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, horizontal: false };
      }}
      onPointerMove={(event) => {
        const start = gesture.current;
        if (!start || start.id !== event.pointerId) return;
        const dx = Math.abs(event.clientX - start.x), dy = Math.abs(event.clientY - start.y);
        if (!start.horizontal && dy > 10 && dy >= dx) { gesture.current = null; return; }
        if (!start.horizontal && dx > 10 && dx > dy * 1.25) {
          start.horizontal = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          setDragging(true);
        }
        if (start.horizontal && event.cancelable) event.preventDefault();
      }}
      onPointerUp={(event) => {
        const start = gesture.current;
        if (!start || start.id !== event.pointerId) return;
        gesture.current = null;
        setDragging(false);
        if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
        const dx = event.clientX - start.x, dy = event.clientY - start.y;
        if (start.horizontal) {
          suppressClickUntil.current = performance.now() + 400;
          if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.25) { if (dx < 0) next(); else previous(); }
        }
      }}
      onPointerCancel={() => { gesture.current = null; setDragging(false); }}
      onLostPointerCapture={(event) => {
        // Touch starts with implicit capture on a child. Its release bubbles when
        // capture moves to this section; that is not cancellation of our drag.
        if (event.target === event.currentTarget) { gesture.current = null; setDragging(false); }
      }}
      onClickCapture={(event) => {
        if (performance.now() < suppressClickUntil.current) { event.preventDefault(); event.stopPropagation(); }
      }}
      onDragStart={(event) => {
        if (!(event.target instanceof Element && event.target.closest("a"))) event.preventDefault();
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)}
      onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) return;
        if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.key === "ArrowLeft") { event.preventDefault(); previous(); }
        if (event.key === "ArrowRight") { event.preventDefault(); next(); }
        if (event.key === "Home") { event.preventDefault(); setActiveIndex(0); }
        if (event.key === "End") { event.preventDefault(); setActiveIndex(heroSlides.length - 1); }
        if (event.key === " ") { event.preventDefault(); setEnabled((value) => !value); }
      }}
    >
      <div className="hero-slides">
        {heroSlides.map((slide, index) => <HeroSlide key={slide.id} config={slide} copy={copy.slides[slide.id]} locale={locale} active={activeIndex === index} index={index} total={heroSlides.length} slideLabel={copy.slide} fallbackLabel={copy.fallback} imageFailed={!!failedImages[slide.id]} onImageError={() => setFailedImages((current) => ({ ...current, [slide.id]: true }))} />)}
      </div>
      <p className="sr-only" aria-live={running ? "off" : "polite"} aria-atomic="true">{activeIndex + 1} / {heroSlides.length}: {copy.slides[heroSlides[activeIndex].id].title}</p>
      <p id="hero-gesture-note" className="sr-only">{copy.gestures} {enabled ? copy.pause : copy.play}</p>
      <p id="hero-motion-note" className="sr-only">{reducedMotion ? copy.reducedMotion : ""}</p>
    </section>
  );
}
