"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import styles from "./package-list.module.css";

type Props = { children: ReactNode; count: number; label: string; hint: string; positionLabel: string; className: string };

/** Cards stay server-rendered; only the scroll position needs client state. */
export function PackageList({ children, count, label, hint, positionLabel, className }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState(1);

  const updatePosition = useCallback(() => {
    const element = track.current;
    if (!element) return;
    const cards = Array.from(element.children) as HTMLElement[];
    const left = element.getBoundingClientRect().left + element.clientLeft;
    const nearest = cards.reduce((best, card, index) =>
      Math.abs(card.getBoundingClientRect().left - left) < Math.abs(cards[best].getBoundingClientRect().left - left) ? index : best, 0);
    const atEnd = element.scrollWidth > element.clientWidth && element.scrollLeft >= element.scrollWidth - element.clientWidth - 2;
    setPosition(atEnd ? count : nearest + 1);
  }, [count]);

  useEffect(() => {
    const element = track.current;
    if (!element) return;
    const observer = new ResizeObserver(updatePosition);
    observer.observe(element);
    return () => observer.disconnect();
  }, [updatePosition]);

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const element = track.current;
    if (!element || event.target !== element || !window.matchMedia("(max-width: 767px)").matches) return;
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const index = event.key === "Home" ? 0 : event.key === "End" ? count - 1 : Math.max(0, Math.min(count - 1, position - 1 + delta));
    const card = element.children[index] as HTMLElement | undefined;
    if (card) element.scrollTo({ left: element.scrollLeft + card.getBoundingClientRect().left - element.getBoundingClientRect().left - element.clientLeft - 4, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  return <div className={`min-w-0 ${className}`}>
    <div data-package-carousel ref={track} className={`${styles.track} grid gap-6 md:grid-cols-2 xl:grid-cols-3`} role="region" aria-label={label} tabIndex={0} onScroll={updatePosition} onKeyDown={onKeyDown}>
      {children}
    </div>
    <p className={`${styles.indicator} mt-3 flex justify-between gap-3 text-xs text-muted md:hidden`}>
      <span>{hint}</span><span aria-label={positionLabel}>{position} / {count}</span>
    </p>
  </div>;
}
