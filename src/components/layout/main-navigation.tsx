"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, ArrowUpRight } from "lucide-react";

type NavigationItem = { href: string; label: string };
export function MainNavigation({ items, label, menuLabel, closeLabel, cta }: {
  items: NavigationItem[]; label: string; menuLabel: string; closeLabel: string; cta: NavigationItem;
}) {
  const pathname = usePathname() ?? "";
  const details = useRef<HTMLDetailsElement>(null);
  function closeMenu() { if (details.current) details.current.open = false; }
  function renderLinks(mobile = false) {
    return items.map((item) => {
      const active = pathname.replace(/\/$/, "") === item.href;
      return <li key={item.href}><Link href={item.href} aria-current={active ? "page" : undefined} onClick={closeMenu} className={`flex min-h-11 items-center border-b-2 px-1 text-sm font-medium transition-colors ${mobile ? "px-3 py-3" : "py-4"} ${active ? "border-ocean text-ocean" : "border-transparent text-muted hover:text-ocean"}`}>{item.label}</Link></li>;
    });
  }
  return <>
    <nav aria-label={label} className="hidden xl:block"><ul className="flex items-center gap-5">{renderLinks()}</ul></nav>
    <details ref={details} className="group xl:hidden" onKeyDown={(event) => {
      if (event.key === "Escape" && details.current?.open) {
        closeMenu();
        details.current.querySelector("summary")?.focus();
      }
    }}>
      <summary aria-label={menuLabel} aria-controls="mobile-navigation" className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-lg border border-line text-navy marker:hidden [&::-webkit-details-marker]:hidden"><Menu size={21} aria-hidden="true" /></summary>
      <nav id="mobile-navigation" aria-label={`${label} (mobile)`} className="absolute top-full right-0 left-0 max-h-[calc(100dvh-5.5rem)] overflow-y-auto border-y border-line bg-white px-5 py-4 shadow-lg">
        <ul className="mx-auto max-w-3xl">{renderLinks(true)}</ul>
        <div className="mx-auto mt-4 flex max-w-3xl flex-wrap items-center justify-between gap-4 border-t border-line pt-4"><Link href={cta.href} onClick={closeMenu} className="inline-flex min-h-12 items-center gap-3 rounded-lg bg-ocean px-4 py-3 text-sm font-semibold text-white">{cta.label}<ArrowUpRight size={17} aria-hidden="true" /></Link><button type="button" onClick={() => { closeMenu(); details.current?.querySelector("summary")?.focus(); }} className="min-h-11 px-3 text-sm font-medium text-muted">{closeLabel}</button></div>
      </nav>
    </details>
  </>;
}
