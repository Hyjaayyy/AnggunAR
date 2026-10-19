import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container py-20">
      <p className="text-sm text-teal-700">404</p>
      <h1 className="mt-4 text-3xl font-semibold">Halaman tidak ditemukan / Page not found</h1>
      <p className="mt-4 text-slate-600">Periksa alamat URL. / Please check the URL.</p>
      <div className="mt-8 flex gap-6"><Link href="/id">Beranda Indonesia</Link><Link href="/en">English home</Link></div>
    </section>
  );
}
