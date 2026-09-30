import Image from "next/image";
import type { CSSProperties } from "react";
import { dotted } from "@/lib/date";
import type { InviteView } from "@/lib/types";
import { Petals } from "../Petals";
import { ChevronIcon } from "../icons";

/** Delay (after the tap that opens the card) before a hero line rises in. */
const at = (seconds: number) => ({ "--d": `${seconds}s` }) as CSSProperties;

// The entrance is driven by `data-revealed` on <main> (see InvitationShell),
// timed so the lines appear as the card's panels slide away.
export function Hero({ view: { content, info, names } }: { view: InviteView }) {
  return (
    <div className="relative h-svh min-h-[560px] overflow-hidden">
      <div className="hero-photo absolute inset-0">
        <Image
          src={content.heroPhoto}
          alt={`${names[0]} & ${names[1]}`}
          fill
          priority
          // Portrait photo filling a full-height box: width follows the height.
          sizes="(max-width: 480px) max(100vw, 72vh), max(480px, 72vh)"
          quality={90}
          className="object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55" />
      <Petals />
      <div className="absolute inset-x-0 bottom-24 px-6 text-center text-white">
        <h1 className="font-serif text-[2.6rem] leading-tight italic drop-shadow">
          <span className="hero-rise block" style={at(1.0)}>
            {names[0]}
          </span>
          <span className="hero-rise block" style={at(1.25)}>
            <span className="text-3xl">&amp;</span> {names[1]}
          </span>
        </h1>
        <p className="hero-rise mt-5 font-serif text-2xl tracking-[0.15em]" style={at(1.6)}>
          {dotted(info.mainDateTime.slice(0, 10))}
        </p>
        <p className="hero-rise mt-2 text-[0.7rem] tracking-[0.35em] uppercase opacity-85" style={at(1.8)}>
          {info.location}
        </p>
      </div>
      <div className="hero-rise absolute inset-x-0 bottom-7 flex justify-center text-white/80" style={at(2.6)} aria-hidden>
        <ChevronIcon width={22} height={22} className="rotate-90 animate-[float_1.8s_ease-in-out_infinite]" />
      </div>
    </div>
  );
}
