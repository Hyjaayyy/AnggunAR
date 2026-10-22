import { ShieldCheck, BriefcaseBusiness, HeartHandshake, TrendingUp, Check } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ButtonLink } from "@/components/ui/button-link";
import type { AboutDictionary } from "@/i18n/about";
import type { Locale } from "@/i18n/config";
import styles from "./about.module.css";

export function PhilosophySection({ copy, locale }: { copy: AboutDictionary["philosophy"]; locale: Locale }) {
  return (
    <section aria-labelledby="company-philosophy" className={`${styles.philosophy} section-space border-y border-line ocean-mist`}>
      <Container>
        <p className="eyebrow">{copy.eyebrow}</p>
        <p lang={locale === "id" ? "en" : undefined} className="mt-7 max-w-2xl text-sm leading-7 font-medium text-ocean">{copy.title}</p>
        <h2 id="company-philosophy" className="mt-5 max-w-4xl text-[clamp(2rem,4vw,3.75rem)] leading-[1.2] font-medium tracking-tight text-navy">{copy.statement}</h2>
        <div className="mt-10 grid gap-6 lg:grid-cols-[.8fr_1.4fr] lg:gap-24">
          <div aria-hidden="true" className="h-px w-20 bg-ocean lg:mt-4 lg:w-32" />
          <p className="max-w-2xl text-base leading-8 text-muted">{copy.description}</p>
        </div>
      </Container>
    </section>
  );
}

const valueIcons = [ShieldCheck, BriefcaseBusiness, HeartHandshake, TrendingUp] as const;

export function CoreValuesSection({ copy }: { copy: AboutDictionary["values"] }) {
  return (
    <section aria-labelledby="company-values" className="section-space ocean-light">
      <Container>
        <SectionHeading id="company-values" eyebrow={copy.eyebrow} title={copy.title} />
        <div data-about-values className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {copy.items.map((item, index) => {
            const Icon = valueIcons[index];
            return (
              <article key={item.title} className="ocean-card min-w-0 p-6 transition-colors sm:p-7">
                <Icon size={29} strokeWidth={1.4} aria-hidden="true" className="text-ocean" />
                <h3 className="mt-6 text-lg leading-7 font-semibold">{item.title}</h3>
                <p className="mt-4 text-sm leading-7 text-muted">{item.description}</p>
              </article>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

export function CommitmentSection({ copy }: { copy: AboutDictionary["commitment"] }) {
  return (
    <section aria-labelledby="company-commitment" className="section-space border-y border-line ocean-mist">
      <Container className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-24">
        <div>
          <SectionHeading id="company-commitment" eyebrow={copy.eyebrow} title={copy.title} />
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted">{copy.description}</p>
        </div>
        <ul className="ocean-panel self-center px-6 sm:px-8">
          {copy.points.map((point) => (
            <li key={point} className="flex items-start gap-4 border-b border-line py-6 text-base leading-7 font-medium">
              <Check size={20} strokeWidth={1.5} aria-hidden="true" className="mt-1 shrink-0 text-ocean" /><span>{point}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function AboutCTA({ copy, locale }: { copy: AboutDictionary["cta"]; locale: Locale }) {
  return (
    <section aria-labelledby="about-cta" className="ocean-secondary ocean-dark-copy dark-surface section-space">
      <Container className="grid items-center gap-8 lg:grid-cols-[1.3fr_1fr] lg:gap-16">
        <div>
          <SectionHeading id="about-cta" eyebrow={copy.eyebrow} title={copy.title} />
          <p className="mt-5 max-w-xl text-base leading-8 text-muted">{copy.description}</p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          <ButtonLink href={`/${locale}/packages`}>{copy.primary}</ButtonLink>
          <ButtonLink href={`/${locale}/contact`} variant="secondary">{copy.secondary}</ButtonLink>
        </div>
      </Container>
    </section>
  );
}
