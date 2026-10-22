import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { isLocale, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/dictionaries";
import { business } from "@/lib/business";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", display: "swap" });

export const metadata: Metadata = {
  title: { default: business.name, template: `%s | ${business.name}` },
  robots: { index: false, follow: false },
  // No approved favicon yet; do not request an absent /favicon.ico.
  icons: { icon: "data:," },
};

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const t = getDictionary(locale);
  return (
    <html lang={locale} data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${jakarta.variable} flex min-h-screen flex-col antialiased`}>
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-white focus:p-3">{t.skip}</a>
        <Header locale={locale} />
        <main id="main-content" className="flex-1" tabIndex={-1}>{children}</main>
        <Footer locale={locale} />
      </body>
    </html>
  );
}
