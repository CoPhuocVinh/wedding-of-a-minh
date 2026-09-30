"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";

// Fixed values (not random) so server and client render the same petals.
// x: start (% of width), s: size px, t: fall seconds, d: delay s (negative =
// already falling), drift: sideways px, spin: deg, o: opacity.
const PETALS = [
  { x: 6, s: 11, t: 15, d: -2, drift: 40, spin: 220, o: 0.85 },
  { x: 19, s: 8, t: 19, d: -9, drift: -30, spin: -180, o: 0.6 },
  { x: 33, s: 13, t: 13, d: -6, drift: 55, spin: 300, o: 0.9 },
  { x: 47, s: 9, t: 21, d: -14, drift: -45, spin: -260, o: 0.65 },
  { x: 58, s: 12, t: 16, d: -4, drift: 25, spin: 200, o: 0.8 },
  { x: 70, s: 8, t: 23, d: -17, drift: -20, spin: -150, o: 0.55 },
  { x: 81, s: 12, t: 14, d: -10, drift: 35, spin: 280, o: 0.85 },
  { x: 92, s: 9, t: 18, d: -1, drift: -50, spin: -220, o: 0.7 },
  { x: 26, s: 7, t: 25, d: -20, drift: 20, spin: 160, o: 0.5 },
];

/** A few baby's-breath florets drifting down; only animates while on screen. */
export function Petals({ tone = "white" }: { tone?: "white" | "cream" }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [fill, stroke] = tone === "white" ? ["#fffdf8", "rgba(210,190,150,.6)"] : ["#f5ead6", "#d8c4a0"];

  return (
    <div ref={ref} data-active={active} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden [container-type:size]">
      {PETALS.map((p, i) => (
        <span
          key={i}
          className="petal"
          style={
            {
              "--x": `${p.x}%`,
              "--s": `${p.s}px`,
              "--t": `${p.t}s`,
              "--d": `${p.d}s`,
              "--drift": `${p.drift}px`,
              "--spin": `${p.spin}deg`,
              "--o": p.o,
            } as CSSProperties
          }
        >
          <svg viewBox="-6 -6 12 12">
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} cx="0" cy="-2.7" rx="2" ry="2.6" transform={`rotate(${r})`} fill={fill} stroke={stroke} strokeWidth=".35" />
            ))}
            <circle r="1.1" fill="#e4cf9c" />
          </svg>
        </span>
      ))}
    </div>
  );
}
