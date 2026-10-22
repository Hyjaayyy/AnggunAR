import { Compass, ImageIcon, Map } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ title, description, children, kind = "travel" }: { title: string; description: string; children: ReactNode; kind?: "travel" | "gallery" | "destination" }) {
  const Icon = kind === "gallery" ? ImageIcon : kind === "destination" ? Map : Compass;
  return <div className="ocean-empty ocean-panel grid sm:grid-cols-[.32fr_1fr]">
    <div className="ocean-empty-mark flex min-h-28 items-center justify-center p-8 sm:min-h-64" aria-hidden="true"><Icon size={52} strokeWidth={1} className="relative z-10" /></div>
    <div className="min-w-0 px-6 py-8 sm:p-10 lg:p-12"><h2 className="max-w-xl text-2xl leading-snug font-semibold tracking-tight sm:text-3xl">{title}</h2><p className="mt-4 max-w-xl leading-7 text-muted">{description}</p><div className="mt-7 flex flex-wrap gap-3">{children}</div></div>
  </div>;
}
