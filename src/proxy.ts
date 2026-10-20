import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { isPageSlug } from "@/i18n/dictionaries";
import { business } from "@/lib/business";
import { tourPackages } from "@/data/tour-packages";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return NextResponse.redirect(url);
  }
  const segments = pathname.split("/").filter(Boolean);
  const [locale, slug] = segments;
  const packageDetail = segments.length === 3 && slug === "packages" && tourPackages.some((item) => item.slug === segments[2] && ((item.status === "published" && !item.demo) || (process.env.NODE_ENV === "development" && request.nextUrl.searchParams.get("preview") === "draft")));
  const available = isLocale(locale) && (segments.length === 1 || (segments.length === 2 && isPageSlug(slug)) || packageDetail);
  if (!available) {
    return new NextResponse(
      `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>404 | ${business.name}</title><style>body{margin:0;background:#f8fafb;color:#134e4a;font-family:Arial,Helvetica,sans-serif}main{max-width:56rem;margin:12vh auto;padding:1.5rem}h1{font-size:clamp(1.6rem,4vw,2.5rem);line-height:1.3}p{color:#475569;line-height:1.8}nav{display:flex;flex-wrap:wrap;gap:1.5rem;margin-top:2rem}a{color:#115e59;text-underline-offset:4px;padding:.5rem 0}a:focus-visible{outline:3px solid #0f766e;outline-offset:5px}</style></head><body><main><p>${business.name}</p><p>404</p><h1>Halaman tidak ditemukan / <span lang="en">Page not found</span></h1><p>Bahasa atau alamat tidak tersedia. / <span lang="en">Language or URL unavailable.</span></p><nav aria-label="Pilih beranda / Choose home"><a href="/id" lang="id">Beranda Indonesia</a><a href="/en" lang="en">English home</a></nav></main></body></html>`,
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
  return NextResponse.next();
}

export const config = { matcher: ["/((?!_next|favicon.ico|images|robots.txt).*)"] };
