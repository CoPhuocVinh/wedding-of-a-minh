"use client";

import Image from "next/image";
import { useState } from "react";
import seal from "@/assets/seal.png";
import { LINEN, PAPER, Sprig, Twine } from "./card-art";

type Props = {
  /** Couple names, inviting family's child first */
  names: [string, string];
  /** YYYY-MM-DD */
  date: string;
  inviteLine: string;
  guest: string;
  onOpen: () => void;
};

const EASE = "ease-[cubic-bezier(.7,0,.2,1)]";
/** Where the linen panel meets the white panel, as % of the card width. */
const SEAM = 64;

// Two-panel card (linen + white paper) tied with twine and a wax seal.
// Everything is sized in container units, so the card scales like a picture
// and keeps its layout on any screen. Tapping drops the seal, then the two
// panels slide apart.
export function Envelope({ names, date, inviteLine, guest, onOpen }: Props) {
  const [opening, setOpening] = useState(false);
  const [y, m, d] = date.split("-");

  function open() {
    if (opening) return;
    setOpening(true);
    onOpen();
  }

  const panel = `absolute inset-y-0 transition-transform duration-[1200ms] ${EASE} delay-[350ms]`;
  const gone = opening ? "opacity-0" : "";

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-label="Thiệp mời">
      <div className={`absolute inset-0 bg-[#ddd6ca] transition-opacity duration-700 delay-[500ms] ${gone}`} />

      <button
        type="button"
        onClick={open}
        aria-label="Mở thiệp"
        className={`relative mx-auto block h-full w-full max-w-[min(480px,56svh)] text-left [container-type:size] ${opening ? "pointer-events-none" : "animate-[fade-in_.8s_ease-out]"}`}
      >
        {/* Right: white paper, carrying the date */}
        <div className={`${panel} right-0 ${opening ? "translate-x-full" : ""}`} style={{ ...PAPER, width: `${100 - SEAM}%` }}>
          <p className="absolute top-[5.5%] right-[7cqw] text-center font-serif text-[12.5cqw] leading-[1.02] text-[#a8807f] lining-nums tabular-nums">
            {d}
            <br />
            {m}
            <br />
            {y.slice(2)}
          </p>
        </div>

        {/* Left: linen, carrying names and the guest */}
        <div
          className={`${panel} left-0 shadow-[2px_0_6px_-1px_rgba(70,50,30,.18)] ${opening ? "-translate-x-full" : ""}`}
          style={{ ...LINEN, width: `${SEAM}%` }}
        >
          <p className="absolute top-[8.5%] left-[12cqw] font-script text-[8.6cqw] leading-[1.25] text-[#6e5040]">
            {names[0]}
            <span className="block pl-[9cqw] text-[6.4cqw] leading-[1.1]">&amp;</span>
            {names[1]}
          </p>
          <div className="absolute inset-x-0 top-[72%] text-center">
            <p className="text-[2.75cqw] tracking-[0.32em] text-[#8a7462] uppercase">{inviteLine}</p>
            <p className="mt-[2.4cqh] text-[5.6cqw] font-normal text-[#54443a]">{guest}</p>
          </div>
        </div>

        <Twine
          className={`absolute top-1/2 left-0 -translate-y-1/2 drop-shadow-[0_1.5px_1px_rgba(70,50,30,.22)] transition-opacity duration-300 ${gone}`}
        />

        {/* Seal cluster, centred on the seam and the twine */}
        <div
          className={`absolute top-1/2 w-[27cqw] -translate-x-1/2 -translate-y-1/2 transition-[opacity,transform] duration-500 ${opening ? "scale-110 opacity-0" : ""}`}
          style={{ left: `${SEAM}%` }}
        >
          <Sprig className="absolute bottom-[30%] left-1/2 w-[160%] -translate-x-[40%] rotate-[4deg] drop-shadow-[0_1.5px_1.2px_rgba(70,50,30,.28)]" />
          <Image
            src={seal}
            alt=""
            priority
            sizes="140px"
            className="relative h-auto w-full contrast-[1.06] sepia-[.14] drop-shadow-[0_3px_4px_rgba(70,50,30,.3)]"
          />
          <SealHint />
        </div>
      </button>
    </div>
  );
}

/** Curved "Chạm để mở thiệp" + tap hand, in a square twice the seal's size. */
function SealHint() {
  return (
    <svg viewBox="0 0 200 200" aria-hidden className="absolute -inset-1/2 h-[200%] w-[200%] overflow-visible">
      <defs>
        <path id="seal-hint" d="M40 130 A64 64 0 0 0 160 126" />
      </defs>
      <g className="animate-[hint_2.4s_ease-in-out_infinite]">
        <text fontSize="12.5" letterSpacing=".3" fill="#5f4d40" style={{ fontFamily: "var(--font-body), sans-serif" }}>
          <textPath href="#seal-hint" startOffset="50%" textAnchor="middle">
            Chạm để mở thiệp
          </textPath>
        </text>
        <g transform="translate(166 124) rotate(-30) scale(.72)" fill="none" stroke="#5f4d40" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M0 0v-11a2.2 2.2 0 0 1 4.4 0v8M4.4-4v-2.5a2.2 2.2 0 0 1 4.4 0V-3M8.8-4.5a2.2 2.2 0 0 1 4.4 0v4c0 5-3 9-8 9h-1c-3 0-4.5-1.5-6.5-4L-6-.5a2 2 0 0 1 3-2.6L0 0" />
          <path d="M-4-14.5-6.5-17M2.2-17.5V-21M8.5-14.5l2.5-2.5" />
        </g>
      </g>
    </svg>
  );
}
