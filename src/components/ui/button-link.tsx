import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { ReactNode } from "react";

export function ButtonLink({ href, children, variant = "primary" }: {
  href: string; children: ReactNode; variant?: "primary" | "secondary" | "light";
}) {
  const styles = {
    primary: "border-ocean bg-ocean text-white hover:border-navy hover:bg-navy",
    secondary: "border-line bg-transparent text-navy hover:border-ocean hover:bg-white",
    light: "border-white bg-white text-navy hover:border-aqua hover:bg-aqua",
  };
  return <Link href={href} className={`inline-flex min-h-12 max-w-full items-center justify-center gap-3 rounded-lg border px-5 py-3 text-center text-sm leading-6 font-semibold transition-colors ${styles[variant]}`}>{children}<ArrowUpRight size={18} aria-hidden="true" className="shrink-0" /></Link>;
}
