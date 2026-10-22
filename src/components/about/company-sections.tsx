import { Compass } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { AboutDictionary } from "@/i18n/about";

export function CompanyIntroduction({ copy }: { copy: AboutDictionary["introduction"] }) {
  return (
    <section aria-labelledby="company-introduction" className="section-space ocean-light">
      <Container className="grid gap-8 lg:grid-cols-[.85fr_1.3fr] lg:gap-24">
        <SectionHeading id="company-introduction" eyebrow={copy.eyebrow} title={copy.title} />
        <div className="ocean-panel max-w-2xl space-y-6 p-6 text-base sm:p-8 leading-8 text-muted">
          {copy.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
      </Container>
    </section>
  );
}

export function VisionSection({ copy }: { copy: AboutDictionary["vision"] }) {
  return (
    <section aria-labelledby="company-vision" className="ocean-secondary ocean-dark-copy section-space border-y border-white/15">
      <Container>
        <div className="flex items-start justify-between gap-8">
          <SectionHeading id="company-vision" eyebrow={copy.eyebrow} title={copy.title} />
          <Compass size={44} strokeWidth={1} className="hidden shrink-0 text-ocean sm:block" aria-hidden="true" />
        </div>
        <p className="mt-8 max-w-5xl border-l-2 border-ocean pl-5 font-heading text-[clamp(1.3rem,2.35vw,2rem)] leading-relaxed tracking-tight text-white sm:pl-8">
          {copy.statement}
        </p>
      </Container>
    </section>
  );
}

export function MissionSection({ copy }: { copy: AboutDictionary["mission"] }) {
  return (
    <section aria-labelledby="company-mission" className="section-space ocean-light">
      <Container className="grid items-start gap-10 lg:grid-cols-[.8fr_1.4fr] lg:gap-24">
        <SectionHeading id="company-mission" eyebrow={copy.eyebrow} title={copy.title} />
        <ol className="ocean-panel min-w-0 px-6 sm:px-8" data-about-missions>
          {copy.items.map((item, index) => (
            <li key={item.title} className="grid grid-cols-[2rem_1fr] gap-4 border-b border-line py-7 sm:grid-cols-[3rem_1fr] sm:gap-6 sm:py-8">
              <span aria-hidden="true" className="pt-1 font-heading text-sm font-semibold tabular-nums text-ocean">0{index + 1}</span>
              <div className="min-w-0">
                <h3 className="text-lg leading-7 font-semibold">{item.title}</h3>
                <p className="mt-3 max-w-xl text-sm leading-7 text-muted sm:text-base sm:leading-8">{item.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
