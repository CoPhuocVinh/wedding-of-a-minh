import type { CSSProperties } from "react";
import { Reveal } from "../Reveal";
import { ShirtIcon } from "../icons";
import type { SiteContent } from "@/lib/types";

export function DressCode({ content }: { content: SiteContent }) {
  return (
    <Reveal>
      <div className="rounded-3xl bg-card px-6 py-10 text-center shadow-[0_12px_30px_rgba(120,90,60,.08)]">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-paper text-accent">
          <ShirtIcon width={26} height={26} />
        </span>
        <div className="mt-6 flex justify-center gap-4">
          {content.dressCode.colors.map((c, i) => (
            <span
              key={i}
              className="pop size-11 rounded-full shadow-[0_4px_12px_rgba(0,0,0,.15)] ring-1 ring-black/5"
              style={{ background: c, "--d": `${0.25 + i * 0.12}s` } as CSSProperties}
            />
          ))}
        </div>
        {content.dressCode.note && <p className="mt-6 text-sm leading-relaxed text-muted">{content.dressCode.note}</p>}
      </div>
    </Reveal>
  );
}
