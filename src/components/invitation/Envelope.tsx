"use client";

import Image from "next/image";
import { useEffect, useEffectEvent, useState, type CSSProperties } from "react";
import seal from "@/assets/seal.png";
import { LINEN, PAPER, Sprig, Twine } from "./card-art";

export type CardInfo = {
  /** Couple names, inviting family's child first */
  names: [string, string];
  /** YYYY-MM-DD */
  date: string;
  inviteLine: string;
  guest: string;
};

type Props = CardInfo & {
  /** Mount open and play the opening backwards (guest scrolled back to the top). */
  closing?: boolean;
  /** Called as the seal cracks; on a real tap, so music may start here. */
  onStart: () => void;
  /** Called once the card has fully slid away. */
  onDone: () => void;
  /** Called once a closing card is shut again. */
  onClosed?: () => void;
};

const EASE = "cubic-bezier(.7,0,.2,1)";
/** Where the linen panel meets the white panel, as % of the card width. */
const SEAM = 64;

// Opening: the seal cracks along a zig-zag -> the halves part -> each half
// rides away with its panel, and the twine splits with them.
// Closing runs the same steps backwards.
const CRACK_MS = 380;
const SPLIT_MS = 320;
const SLIDE_MS = 1200;

/** Zig-zag crack through the seal, in % of the seal image box (top to bottom). */
const CRACK: [number, number][] = [
  [50, 0], [46, 11], [54, 22], [47, 34], [55, 46], [45, 58], [53, 70], [46, 82], [52, 92], [49, 100],
];
const pts = (list: [number, number][]) => list.map(([x, y]) => `${x}% ${y}%`).join(", ");
const LEFT_PIECE = `polygon(0 0, ${pts(CRACK)}, 0 100%)`;
const RIGHT_PIECE = `polygon(${pts(CRACK)}, 100% 100%, 100% 0)`;

type Phase = "idle" | "crack" | "split" | "open";
/** A phase plus how long the move into it takes, so both directions animate right. */
type Step = { phase: Phase; ms: number };

const calm = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function Envelope({ names, date, inviteLine, guest, closing = false, onStart, onDone, onClosed }: Props) {
  const [{ phase, ms }, setStep] = useState<Step>({ phase: closing ? "open" : "idle", ms: 0 });
  const [y, m, d] = date.split("-");

  function open() {
    if (phase !== "idle") return;
    onStart();
    // Reduced motion: no cracking or sliding, the card just gives way.
    if (calm()) {
      setStep({ phase: "open", ms: 0 });
      return void setTimeout(onDone, 250);
    }
    setStep({ phase: "crack", ms: CRACK_MS });
    setTimeout(() => setStep({ phase: "split", ms: SPLIT_MS }), CRACK_MS);
    setTimeout(() => setStep({ phase: "open", ms: SLIDE_MS }), CRACK_MS + SPLIT_MS);
    setTimeout(onDone, CRACK_MS + SPLIT_MS + SLIDE_MS + 100);
  }

  // Closing: panels slide back in, the halves meet, then the crack heals.
  const closed = useEffectEvent(() => onClosed?.());
  useEffect(() => {
    if (!closing) return;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const frame = requestAnimationFrame(() => {
      if (calm()) {
        setStep({ phase: "idle", ms: 0 });
        return closed();
      }
      setStep({ phase: "split", ms: SLIDE_MS });
      timers.push(setTimeout(() => setStep({ phase: "crack", ms: SPLIT_MS }), SLIDE_MS));
      timers.push(
        setTimeout(() => {
          setStep({ phase: "idle", ms: CRACK_MS });
          closed();
        }, SLIDE_MS + SPLIT_MS),
      );
    });
    return () => {
      cancelAnimationFrame(frame);
      timers.forEach(clearTimeout);
    };
  }, [closing]);

  const started = phase !== "idle";
  const parted = phase === "split" || phase === "open";
  const sliding = phase === "open";

  /** Moves something with a panel: left side travels SEAM cqw, right side the rest. */
  const slide = (side: "left" | "right", extra = ""): CSSProperties => ({
    transform: `${sliding ? `translateX(${side === "left" ? -SEAM : 100 - SEAM}cqw)` : ""} ${extra}`.trim() || undefined,
    transition: `transform ${ms}ms ${ms === SLIDE_MS ? EASE : "ease-out"}`,
  });

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-label="Thiệp mời">
      <div className={`absolute inset-0 bg-[#ddd6ca] transition-opacity duration-700 ${sliding ? "opacity-0 delay-200" : ""}`} />

      <button
        type="button"
        onClick={open}
        aria-label="Mở thiệp"
        className={`relative mx-auto block h-full w-full max-w-[min(480px,56svh)] text-left [container-type:size] ${started ? "pointer-events-none" : closing ? "" : "animate-[fade-in_.8s_ease-out]"}`}
      >
        {/* Right: white paper, carrying the date */}
        <div className="absolute inset-y-0 right-0" style={{ ...PAPER, width: `${100 - SEAM}%`, ...slide("right") }}>
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
          className="absolute inset-y-0 left-0 shadow-[2px_0_6px_-1px_rgba(70,50,30,.18)]"
          style={{ ...LINEN, width: `${SEAM}%`, ...slide("left") }}
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

        {/* Twine, cut at the seam so each piece leaves with its panel */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 overflow-hidden" style={{ width: `${SEAM}%`, ...slide("left") }}>
          <Twine className="drop-shadow-[0_1.5px_1px_rgba(70,50,30,.22)]" />
        </div>
        <div className="absolute top-1/2 right-0 -translate-y-1/2 overflow-hidden" style={{ width: `${100 - SEAM}%`, ...slide("right") }}>
          <Twine className="drop-shadow-[0_1.5px_1px_rgba(70,50,30,.22)]" />
        </div>

        {/* Seal cluster, centred on the seam and the twine */}
        <div className="absolute top-1/2 w-[27cqw] -translate-x-1/2 -translate-y-1/2" style={{ left: `${SEAM}%` }}>
          <Sprig
            className="absolute bottom-[30%] left-1/2 w-[160%] -translate-x-[40%] rotate-[4deg] drop-shadow-[0_1.5px_1.2px_rgba(70,50,30,.28)] transition-[transform,opacity] duration-700 ease-in"
            style={parted ? { transform: "translateY(22%) rotate(9deg)", opacity: 0 } : undefined}
          />

          <div className={phase === "crack" ? "animate-[seal-shake_.32s_ease-in-out]" : ""}>
            {/* Whole until tapped: two clipped halves leave a hairline where they meet. */}
            <SealPiece clip={started ? LEFT_PIECE : undefined} style={slide("left", parted ? "translate(-5%, 2%) rotate(-7deg)" : "")} />
            {started && (
              <SealPiece clip={RIGHT_PIECE} className="absolute inset-0" style={slide("right", parted ? "translate(5%, 3%) rotate(8deg)" : "")} />
            )}

            {/* The crack drawing itself, clipped to the wax disc */}
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden className={`absolute inset-0 size-full transition-opacity duration-150 ${parted ? "opacity-0" : ""}`}>
              <defs>
                <clipPath id="seal-disc">
                  <circle cx="50" cy="50" r="46" />
                </clipPath>
              </defs>
              <g clipPath="url(#seal-disc)" fill="none" strokeLinejoin="bevel" pathLength={1}>
                {[
                  { stroke: "rgba(255,248,230,.7)", width: 2.2, dx: 0.6 },
                  { stroke: "rgba(80,60,35,.75)", width: 1.4, dx: 0 },
                ].map((l) => (
                  <polyline
                    key={l.stroke}
                    points={CRACK.map(([x, y]) => `${x + l.dx},${y}`).join(" ")}
                    stroke={l.stroke}
                    strokeWidth={l.width}
                    vectorEffect="non-scaling-stroke"
                    pathLength={1}
                    strokeDasharray="1"
                    strokeDashoffset={started ? 0 : 1}
                    style={{ transition: `stroke-dashoffset ${CRACK_MS - 60}ms ease-in` }}
                  />
                ))}
              </g>
            </svg>
          </div>

          <SealHint hidden={started} />
        </div>
      </button>
    </div>
  );
}

/** One half of the seal: the full image clipped along the crack. */
function SealPiece({ clip, className = "relative", style }: { clip?: string; className?: string; style: CSSProperties }) {
  return (
    // The shadow sits on the wrapper so it follows the clipped outline.
    <div className={`${className} drop-shadow-[0_3px_4px_rgba(70,50,30,.3)]`} style={style}>
      <Image src={seal} alt="" priority sizes="140px" className="h-auto w-full contrast-[1.06] sepia-[.14]" style={{ clipPath: clip }} />
    </div>
  );
}

/** Curved "Chạm để mở thiệp" + tap hand, in a square twice the seal's size. */
function SealHint({ hidden }: { hidden: boolean }) {
  return (
    <svg
      viewBox="0 0 200 200"
      aria-hidden
      className={`pointer-events-none absolute -inset-1/2 h-[200%] w-[200%] overflow-visible transition-opacity duration-200 ${hidden ? "opacity-0" : ""}`}
    >
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
