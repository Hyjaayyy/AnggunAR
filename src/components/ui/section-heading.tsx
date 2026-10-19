export function SectionHeading({ id, eyebrow, title, description }: {
  id: string; eyebrow: string; title: string; description?: string;
}) {
  return <div className="max-w-2xl"><p className="eyebrow">{eyebrow}</p><h2 id={id} className="mt-4 text-3xl leading-tight font-semibold tracking-tight text-navy sm:text-4xl">{title}</h2>{description && <p className="mt-5 max-w-xl text-base leading-7 text-muted">{description}</p>}</div>;
}
