import { business } from "./business";
import { getContactDictionary } from "@/i18n/contact";
import type { Locale } from "@/i18n/config";

export function phoneDisplay(number: string): string {
  return number.replace(/^62(\d{3})(\d{4})(\d{4})$/, "+62 $1-$2-$3");
}
export function telephoneHref(number: string): string { return `tel:+${number}`; }
export function whatsappHref(locale: Locale, options: { alternative?: boolean; packageName?: string; booking?: boolean; quote?: boolean } = {}): string {
  const copy = getContactDictionary(locale);
  const message = options.packageName
    ? `${copy.packageMessage} "${options.packageName}" — ${business.name}.${options.quote ? ` ${copy.quoteMessage}` : ""}`
    : `${options.booking ? copy.bookingMessage : copy.message} ${business.name}.`;
  const number = options.alternative ? business.whatsappAlternative : business.whatsapp;
  return `https://wa.me/${number}?${new URLSearchParams({ text: message })}`;
}
export function emailHref(locale: Locale): string {
  return `mailto:${business.email}?subject=${encodeURIComponent(`${getContactDictionary(locale).subject} — ${business.name}`)}`;
}
