import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
import type { HeroDictionary } from "@/i18n/hero";
import type { HeroSlideConfig } from "@/data/hero-slides";

export function HeroControls({ copy, slides, activeIndex, enabled, reducedMotion, onSelect, onPrevious, onNext, onToggle }: {
  copy: HeroDictionary; slides: readonly HeroSlideConfig[]; activeIndex: number;
  enabled: boolean; reducedMotion: boolean; onSelect: (index: number) => void;
  onPrevious: () => void; onNext: () => void; onToggle: () => void;
}) {
  const button = "flex size-11 shrink-0 items-center justify-center rounded-full border border-white/40 text-white transition-colors hover:border-white hover:bg-white/10";
  return (
    <div className="container hero-controls">
      <div className="flex flex-wrap items-center gap-2 sm:gap-4">
        <button type="button" className={button} aria-label={copy.previous} onClick={onPrevious}><ArrowLeft size={18} aria-hidden="true" /></button>
        <span aria-hidden="true" className="min-w-12 text-center font-heading text-xs tabular-nums text-white">{String(activeIndex + 1).padStart(2, "0")} <span className="text-slate-400">/ {String(slides.length).padStart(2, "0")}</span></span>
        <button type="button" className={button} aria-label={copy.next} onClick={onNext}><ArrowRight size={18} aria-hidden="true" /></button>
        <button type="button" className={`${button} disabled:cursor-default disabled:opacity-60`} aria-label={enabled ? copy.pause : copy.play} aria-describedby={reducedMotion ? "hero-motion-note" : undefined} disabled={reducedMotion} onClick={onToggle}>{enabled ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}</button>
      </div>
      <div className="flex items-center gap-1 sm:gap-2" role="group" aria-label={copy.label}>
        {slides.map((slide, index) => <button key={slide.id} type="button" onClick={() => onSelect(index)} aria-label={`${copy.indicator} ${index + 1}: ${copy.slides[slide.id].title}`} aria-current={index === activeIndex ? "true" : undefined} aria-controls={`hero-slide-${slide.id}`} className="flex min-h-11 min-w-9 items-center justify-center sm:min-w-11"><span className={`h-0.5 w-6 rounded-full sm:w-8 ${index === activeIndex ? "bg-aqua" : "bg-white/40"}`} aria-hidden="true" /></button>)}
      </div>
    </div>
  );
}
