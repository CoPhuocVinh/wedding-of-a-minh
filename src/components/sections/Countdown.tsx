"use client";

import { useEffect, useState } from "react";

const UNITS = [
  ["Ngày", 86_400_000],
  ["Giờ", 3_600_000],
  ["Phút", 60_000],
  ["Giây", 1_000],
] as const;

function split(ms: number) {
  let rest = Math.max(0, ms);
  return UNITS.map(([label, size]) => {
    const value = Math.floor(rest / size);
    rest -= value * size;
    return { label, value };
  });
}

/** `target` is an ISO instant. Renders dashes until mounted to avoid hydration mismatch. */
export function Countdown({ target }: { target: string }) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = setTimeout(tick, 0);
    const t = setInterval(tick, 1000);
    return () => {
      clearTimeout(first);
      clearInterval(t);
    };
  }, []);

  const parts = now === null ? null : split(new Date(target).getTime() - now);

  return (
    <div className="grid grid-cols-2 gap-3">
      {UNITS.map(([label], i) => (
        <div key={label} className="rounded-2xl bg-white/10 py-5 text-center ring-1 ring-white/15 backdrop-blur-sm">
          <p className="font-serif text-4xl text-white tabular-nums">{parts ? parts[i].value : "–"}</p>
          <p className="mt-1 text-xs tracking-[0.3em] text-white/75 uppercase">{label}</p>
        </div>
      ))}
    </div>
  );
}
