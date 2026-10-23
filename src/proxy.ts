import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/i18n/config";
import { isPageSlug } from "@/i18n/dictionaries";
import { business } from "@/lib/business";
import { destinations } from "@/data/destinations";
import { tourPackages } from "@/data/tour-packages";
import { homeVideo } from "@/data/home-video";
import { normalizeVideoSuffix } from "@/lib/video-range";
import { authorizeOwnerReview, ownerReviewEnabled } from "@/lib/owner-review";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === homeVideo.src) {
    const headers = request.method === "GET" ? await normalizeVideoSuffix(request.headers) : undefined;
    return NextResponse.next(headers ? { request: { headers } } : undefined);
  }
  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
    return NextResponse.redirect(url);
  }
  const segments = pathname.split("/").filter(Boolean);
  const [locale, slug] = segments;
  const reviewRequested = isLocale(locale) && slug === "packages" && (segments.length === 2 || segments.length === 3) && request.nextUrl.searchParams.get("preview") === "draft";
  const reviewAccess = reviewRequested ? authorizeOwnerReview(request.headers, request.nextUrl.protocol) : null;
  if (reviewRequested && ownerReviewEnabled() && process.env.NODE_ENV === "production" && request.nextUrl.protocol !== "https:") {
    return new NextResponse("HTTPS is required for owner review.", { status: 403, headers: { "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow" } });
  }
  if (reviewRequested && ownerReviewEnabled() && !reviewAccess) {
    return new NextResponse("Owner review authorization required.", { status: 401, headers: { "WWW-Authenticate": 'Basic realm="Owner review", charset="UTF-8"', "Cache-Control": "private, no-store", "X-Robots-Tag": "noindex, nofollow", "Vary": "Authorization" } });
  }
  const packageDetail = segments.length === 3 && slug === "packages" && tourPackages.some((item) => item.slug === segments[2] && (((item.status === "published" || item.status === "offered") && !item.demo) || !!reviewAccess));
  const destinationDetail = segments.length === 3 && slug === "destinations" && destinations.some((item) => item.slug === segments[2] && item.status === "published" && item.sources.length > 0);
  const available = isLocale(locale) && (segments.length === 1 || (segments.length === 2 && isPageSlug(slug)) || packageDetail || destinationDetail);
  if (!available) {
    return new NextResponse(
      `<!doctype html><html lang="id"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>404 | ${business.name}</title><style>body{margin:0;background:#f8fafb;color:#134e4a;font-family:Arial,Helvetica,sans-serif}main{max-width:56rem;margin:12vh auto;padding:1.5rem}h1{font-size:clamp(1.6rem,4vw,2.5rem);line-height:1.3}p{color:#475569;line-height:1.8}nav{display:flex;flex-wrap:wrap;gap:1.5rem;margin-top:2rem}a{color:#115e59;text-underline-offset:4px;padding:.5rem 0}a:focus-visible{outline:3px solid #0f766e;outline-offset:5px}</style></head><body><main><p>${business.name}</p><p>404</p><h1>Halaman tidak ditemukan / <span lang="en">Page not found</span></h1><p>Bahasa atau alamat tidak tersedia. / <span lang="en">Language or URL unavailable.</span></p><nav aria-label="Pilih beranda / Choose home"><a href="/id" lang="id">Beranda Indonesia</a><a href="/en" lang="en">English home</a></nav></main></body></html>`,
      { status: 404, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  }
  const response = NextResponse.next();
  if (reviewAccess) {
    response.headers.set("Cache-Control", "private, no-store, max-age=0");
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    response.headers.append("Vary", "Authorization");
  }
  return response;
}

export const config = { matcher: ["/((?!_next|favicon.ico|images|robots.txt|videos/home/batam-cinematic[.]mp4$).*)"] };
