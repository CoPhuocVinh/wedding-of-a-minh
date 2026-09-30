import Image from "next/image";
import { Reveal } from "../Reveal";
import { ClockIcon, MapIcon, PinIcon } from "../icons";
import { dotted, weekday } from "@/lib/date";
import { lunarLine } from "@/lib/lunar";
import type { WeddingEvent } from "@/lib/types";

export function Events({ events }: { events: WeddingEvent[] }) {
  return (
    <div className="space-y-8">
      {events.map((e, i) => (
        <Reveal key={e.id} variant={i % 2 ? "right" : "left"}>
          <article className="overflow-hidden rounded-3xl bg-card shadow-[0_12px_30px_rgba(120,90,60,.1)]">
            {e.photo && (
              <div className="relative aspect-[4/3]">
                <Image src={e.photo} alt={e.title} fill quality={90} sizes="(max-width: 480px) 100vw, 440px" className="object-cover" />
              </div>
            )}
            <div className="space-y-3 p-6">
              <h3 className="font-serif text-2xl uppercase">{e.title}</h3>
              <p className="flex items-center gap-3 text-[0.95rem]">
                <ClockIcon className="shrink-0 text-accent" />
                <span>
                  {e.time} | {weekday(e.date)} | {dotted(e.date)}
                  <span className="block text-xs text-muted italic">({lunarLine(e.date)})</span>
                </span>
              </p>
              <div className="flex gap-3">
                <PinIcon className="mt-0.5 shrink-0 text-accent" />
                <div>
                  <p className="text-[0.95rem] font-medium">{e.venue}</p>
                  <p className="text-sm text-muted">{e.address}</p>
                </div>
              </div>
              {e.mapUrl && (
                <a
                  href={e.mapUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-accent/60 py-2.5 text-sm text-accent-dark transition hover:bg-accent hover:text-white"
                >
                  <MapIcon width={16} height={16} /> Chỉ đường
                </a>
              )}
            </div>
          </article>
        </Reveal>
      ))}
    </div>
  );
}
