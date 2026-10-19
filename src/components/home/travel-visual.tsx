import Image from "next/image";

export type VisualKind = "coast" | "bridge" | "islands";
const visuals: Record<VisualKind, string> = {
  coast: "/images/placeholders/batam-coast.svg",
  bridge: "/images/placeholders/barelang.svg",
  islands: "/images/placeholders/islands.svg",
};

export function TravelVisual({ kind, label, priority = false, className = "", sizes = "(max-width: 767px) 100vw, 33vw" }: {
  kind: VisualKind; label: string; priority?: boolean; className?: string; sizes?: string;
}) {
  return <div className={`relative isolate overflow-hidden bg-[#d7eceb] ${className}`}>
    <Image src={visuals[kind]} alt="" fill sizes={sizes} priority={priority} className="object-cover" />
    <span className="absolute right-3 bottom-3 left-3 w-fit max-w-[calc(100%-1.5rem)] rounded bg-white/95 px-2.5 py-1.5 text-[10px] leading-4 font-medium text-navy">{label}</span>
  </div>;
}
