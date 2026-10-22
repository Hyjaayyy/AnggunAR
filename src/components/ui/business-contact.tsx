import { business } from "@/lib/business";
import { emailHref, phoneDisplay, telephoneHref, whatsappHref } from "@/lib/contact";
import { getContactDictionary } from "@/i18n/contact";
import type { Locale } from "@/i18n/config";

export function BusinessContact({ locale, compact = false }: { locale: Locale; compact?: boolean }) {
  const copy = getContactDictionary(locale);
  const link = `inline-flex min-h-11 max-w-full items-center py-2 underline underline-offset-4 ${compact ? "text-white/85 hover:text-aqua" : "text-ocean hover:text-navy"}`;
  return <address className={`min-w-0 space-y-5 text-sm not-italic ${compact ? "text-white/80" : "text-muted"}`}>
    <div><p className="font-semibold">{copy.address}</p><p className="mt-2 leading-7">{business.address}</p>{!compact && <p className="mt-2 text-xs leading-6">{copy.addressNote}</p>}</div>
    <div><p className="font-semibold">{copy.email}</p><a className={`${link} break-all`} href={emailHref(locale)} aria-label={`${copy.emailAction}: ${business.email}`}>{business.email}</a></div>
    {[{ number: business.whatsapp, label: copy.primary, alternative: false }, ...(!compact ? [{ number: business.whatsappAlternative, label: copy.alternative, alternative: true }] : [])].map(({ number, label, alternative }) => <div key={number}>
      <p className="font-semibold">{label}</p><a className={link} href={telephoneHref(number)} aria-label={`${copy.phoneAction}: ${phoneDisplay(number)}`}>{phoneDisplay(number)}</a>
      <div><a className={compact ? link : "mt-2 inline-flex min-h-12 max-w-full items-center justify-center rounded-lg bg-ocean px-5 py-3 text-center text-sm font-semibold text-white hover:bg-navy"} href={whatsappHref(locale, { alternative })} aria-label={`${copy.whatsappAction} — ${label}`}>{copy.whatsappAction}</a></div>
    </div>)}
  </address>;
}
