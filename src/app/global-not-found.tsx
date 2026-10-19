import Link from "next/link";
import "@/styles/globals.css";

export default function GlobalNotFound() {
  return (
    <html lang="id"><body><main className="container py-20">
      <p className="text-sm text-teal-700">404</p>
      <h1 className="mt-4 text-3xl font-semibold">Halaman tidak ditemukan / Page not found</h1>
      <p className="mt-4 text-slate-600">Bahasa atau alamat tidak tersedia. / Language or URL unavailable.</p>
      <div className="mt-8 flex gap-6"><Link href="/id">Beranda Indonesia</Link><Link href="/en">English home</Link></div>
    </main></body></html>
  );
}
