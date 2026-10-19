import { Compass, ListChecks, CalendarDays } from "lucide-react";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import type { HomeDictionary } from "@/i18n/home";

const icons = [Compass, ListChecks, CalendarDays];
export function WhyChooseUs({ copy }: { copy: HomeDictionary["benefits"] }) {
  return <section aria-labelledby="benefits-title" className="section-space border-y border-line bg-[#edf5f5]"><Container>
    <SectionHeading id="benefits-title" {...copy} />
    <div className="mt-10 grid gap-8 md:grid-cols-3 md:gap-10">{copy.items.map((item, index) => {
      const Icon = icons[index] ?? Compass;
      return <article key={item.title} className="border-t border-[#bad3d5] pt-6"><Icon size={27} strokeWidth={1.5} aria-hidden="true" className="text-ocean" /><h3 className="mt-5 text-lg font-semibold">{item.title}</h3><p className="mt-3 max-w-sm text-sm leading-7 text-muted">{item.description}</p></article>;
    })}</div>
  </Container></section>;
}
