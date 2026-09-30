import type { CSSProperties } from "react";
import { HeartIcon } from "./icons";

// Where each heart ends up (px from the origin) and how it tumbles.
const HEARTS = [
  { x: -90, y: -150, r: -25, s: 18, d: 0, c: "#d9698a" },
  { x: -55, y: -200, r: 15, s: 14, d: 0.06, c: "#e9a0b4" },
  { x: -20, y: -170, r: -10, s: 22, d: 0.02, c: "#c94f6d" },
  { x: 15, y: -220, r: 20, s: 16, d: 0.1, c: "#e9a0b4" },
  { x: 50, y: -180, r: -18, s: 20, d: 0.04, c: "#d9698a" },
  { x: 88, y: -140, r: 28, s: 14, d: 0.12, c: "#c9a86a" },
  { x: -120, y: -95, r: -30, s: 12, d: 0.15, c: "#c9a86a" },
  { x: 118, y: -90, r: 32, s: 12, d: 0.18, c: "#e9a0b4" },
  { x: -35, y: -120, r: 8, s: 12, d: 0.2, c: "#c94f6d" },
  { x: 38, y: -115, r: -8, s: 13, d: 0.22, c: "#d9698a" },
];

/**
 * A spray of hearts flying up from the centre of its positioned parent.
 * Plays once on mount: give it a new `key` to play again.
 */
export function HeartBurst({ scale = 1 }: { scale?: number }) {
  return (
    <span aria-hidden className="pointer-events-none absolute top-1/2 left-1/2 z-10">
      {HEARTS.map((h, i) => (
        <HeartIcon
          key={i}
          width={h.s}
          height={h.s}
          className="heart-fly"
          style={{ "--x": `${h.x * scale}px`, "--y": `${h.y * scale}px`, "--r": `${h.r}deg`, "--d": `${h.d}s`, color: h.c } as CSSProperties}
        />
      ))}
    </span>
  );
}
