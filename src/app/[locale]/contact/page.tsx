import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/i18n/config";
import { getContactDictionary } from "@/i18n/contact";
import { business } from "@/lib/business";
import { BusinessContact } from "@/components/ui/business-contact";
import { ButtonLink } from "@/components/ui/button-link";
import { emailHref } from "@/lib/contact";

type Props = { params: Promise<{ locale: string }> };
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const copy = getContactDictionary(locale); return { title: copy.title, description: copy.description };
}
export default async function ContactPage({ params }: Props) {
  const { locale } = await params; if (!isLocale(locale)) notFound();
  const copy = getContactDictionary(locale);
  return <section className="ocean-placeholder ocean-mist"><div className="container"><div className="ocean-panel grid overflow-hidden lg:grid-cols-[1.15fr_1fr]">
    <div className="dark-surface ocean-secondary p-6 text-white sm:p-10"><p className="text-xs font-semibold tracking-widest text-white/80 uppercase">{business.name}</p><h1 className="mt-5 text-4xl font-semibold sm:text-5xl">{copy.title}</h1><p className="mt-6 text-lg leading-8 text-white/85">{copy.description}</p><p className="mt-8 text-sm leading-7 text-white/80">{copy.note}</p></div>
    <div className="min-w-0 p-6 sm:p-10"><BusinessContact locale={locale} /><div className="mt-6"><ButtonLink href={emailHref(locale)} variant="secondary">{copy.emailAction}</ButtonLink></div></div>
  </div></div></section>;
}
