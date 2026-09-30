"use client";

import { useEffect, useState } from "react";

/**
 * Keeps an overlay mounted while its exit animation plays.
 * Render when `mounted`; put `data-state={state}` on elements styled by
 * `.ov` / `.sheet` in globals.css.
 */
export function usePresence(show: boolean, exitMs = 200) {
  const [mounted, setMounted] = useState(show);
  if (show && !mounted) setMounted(true);

  useEffect(() => {
    if (show) return;
    const t = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(t);
  }, [show, exitMs]);

  return { mounted, state: show ? "open" : "closed" } as const;
}
