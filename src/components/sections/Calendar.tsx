import { Reveal } from "../Reveal";
import { longVi, monthGrid, parseDate } from "@/lib/date";
import { lunarLine } from "@/lib/lunar";
import type { InviteView, Section } from "@/lib/types";

const DAYS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

export function Calendar({ view: { info }, section }: { view: InviteView; section: Section }) {
  const date = info.mainDateTime.slice(0, 10);
  const { year, month, day } = parseDate(date);
  const cells = monthGrid(year, month);

  return (
    <Reveal>
      <div className="rounded-3xl bg-paper/70 px-5 py-8 shadow-[0_10px_30px_rgba(120,90,60,.08)]">
        <p className="text-center font-serif text-2xl">
          Tháng {month}, {year}
        </p>
        {section.eyebrow && <p className="eyebrow mt-3 text-center">{section.eyebrow}</p>}
        <div className="mt-6 grid grid-cols-7 gap-y-3 text-center">
          {DAYS.map((d) => (
            <span key={d} className="text-xs font-medium text-muted">
              {d}
            </span>
          ))}
          {cells.map((n, i) => (
            <span key={i} className="relative flex h-9 items-center justify-center font-serif text-lg">
              {n === day ? (
                <>
                  <svg viewBox="0 0 40 36" className="heart-beat absolute size-11 text-accent" aria-hidden>
                    <path
                      className="heart-draw"
                      pathLength={1}
                      d="M20 33S3 23 3 12.5C3 7 7.2 3 12 3c3.4 0 6 1.8 8 4.6C22 4.8 24.6 3 28 3c4.8 0 9 4 9 9.5C37 23 20 33 20 33Z"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    />
                  </svg>
                  <span className="relative text-accent">{n}</span>
                </>
              ) : (
                n
              )}
            </span>
          ))}
        </div>
        <p className="mt-6 text-center text-sm text-muted">
          {info.mainDateTime.slice(11)} · {longVi(date)}
        </p>
        <p className="mt-1 text-center text-xs text-muted/80 italic">({lunarLine(date)})</p>
      </div>
    </Reveal>
  );
}
