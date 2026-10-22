"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { ResolvedGalleryPhoto } from "@/types/gallery";
import type { Locale } from "@/i18n/config";
import type { GalleryDictionary } from "@/i18n/gallery";

export function PhotoGallery({ photos, locale, copy }: { photos: readonly ResolvedGalleryPhoto[]; locale: Locale; copy: GalleryDictionary }) {
  const [index, setIndex] = useState<number | null>(null);
  const [failed, setFailed] = useState<ReadonlySet<string>>(new Set());
  const dialog = useRef<HTMLDialogElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const isOpen = index !== null;
  const selected = index === null ? null : photos[index];
  useEffect(() => {
    if (!isOpen || !dialog.current) return;
    const modal = dialog.current;
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    modal.showModal();
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    return () => { modal.close(); document.body.style.overflow = previousOverflow; if (trigger?.isConnected) trigger.focus({ preventScroll: true }); };
  }, [isOpen]);
  const close = () => setIndex(null);
  const move = (offset: number) => setIndex((current) => current === null ? null : (current + offset + photos.length) % photos.length);
  const markFailed = (src: string) => setFailed((previous) => new Set(previous).add(src));
  return <>
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3" data-gallery-grid>
      {photos.map((photo) => <figure key={photo.id} className="ocean-card min-w-0 overflow-hidden">
        <button type="button" data-gallery-open onClick={() => setIndex(photos.indexOf(photo))} className="group relative block aspect-[4/3] w-full overflow-hidden rounded-xl bg-navy text-white" aria-label={`${copy.open}: ${photo.caption[locale]}`} aria-haspopup="dialog">
          {failed.has(photo.image.src) ? <span className="p-4 text-sm">{copy.unavailable}</span> : <Image src={photo.image.src} alt={photo.image.alt[locale]} fill sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw" className="object-cover transition-transform duration-300 group-hover:scale-[1.02] motion-reduce:transform-none" style={{ objectPosition: photo.image.position }} onError={() => markFailed(photo.image.src)} />}
        </button><figcaption className="px-5 py-4 text-sm leading-6 text-muted">{photo.caption[locale]}</figcaption>
      </figure>)}
    </div>
    <dialog ref={dialog} aria-labelledby="lightbox-caption" aria-describedby="lightbox-counter" aria-modal="true" onClose={close} onCancel={(event) => { event.preventDefault(); close(); }} onClick={(event) => { if (event.target === event.currentTarget) close(); }} onKeyDown={(event) => {
      if (event.key === "ArrowLeft") { event.preventDefault(); move(-1); }
      if (event.key === "ArrowRight") { event.preventDefault(); move(1); }
      if (event.key === "Tab") {
        const controls = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
        const first = controls[0]; const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }
    }} className="dark-surface fixed inset-0 m-auto max-h-[100dvh] w-[min(100%-1.5rem,80rem)] max-w-none overflow-y-auto rounded-xl border border-white/20 bg-navy p-4 text-white shadow-xl backdrop:bg-black/85 sm:p-6">
      {selected && <><div className="mb-4 flex items-center justify-between gap-4"><p id="lightbox-counter" className="text-sm" aria-live="polite">{copy.counter} {(index ?? 0) + 1} {copy.of} {photos.length}</p><button data-gallery-close ref={closeButton} type="button" onClick={close} aria-label={copy.close} className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-white/30 hover:bg-white/10"><X aria-hidden="true" /></button></div>
        <div className="relative h-[min(60dvh,42rem)] min-h-32 overflow-hidden rounded-lg bg-black/20">{failed.has(selected.image.src) ? <p className="flex h-full items-center justify-center p-6">{copy.unavailable}</p> : <Image key={selected.id} src={selected.image.src} alt={selected.image.alt[locale]} fill sizes="(min-width: 1280px) 1200px, 95vw" className="object-contain" onError={() => markFailed(selected.image.src)} />}</div>
        <div className="mt-4 flex items-center justify-between gap-3"><button data-gallery-previous type="button" onClick={() => move(-1)} aria-label={copy.previous} disabled={photos.length < 2} className="inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-lg border border-white/30 disabled:opacity-40"><ChevronLeft aria-hidden="true" /></button><h2 id="lightbox-caption" className="min-w-0 text-center text-sm leading-6">{selected.caption[locale]}</h2><button data-gallery-next type="button" onClick={() => move(1)} aria-label={copy.next} disabled={photos.length < 2} className="inline-flex min-h-12 min-w-12 shrink-0 items-center justify-center rounded-lg border border-white/30 disabled:opacity-40"><ChevronRight aria-hidden="true" /></button></div>
      </>}
    </dialog>
  </>;
}
