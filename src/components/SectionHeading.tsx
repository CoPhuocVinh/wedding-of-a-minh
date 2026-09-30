import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  light = false,
}: {
  eyebrow: string;
  title: string;
  light?: boolean;
}) {
  if (!eyebrow && !title) return null;
  return (
    <Reveal className="mb-10 text-center">
      {eyebrow && <p className={`eyebrow ${light ? "!text-white/80" : ""}`}>{eyebrow}</p>}
      {title && (
        <h2
          className={`mt-3 font-serif text-[2rem] leading-tight ${light ? "text-white" : "text-ink"}`}
        >
          {title}
        </h2>
      )}
      {/* Draws itself once the heading is on screen. */}
      <span className={`heading-rule mx-auto mt-5 block h-px w-16 ${light ? "bg-white/60" : "bg-accent/60"}`} />
    </Reveal>
  );
}
