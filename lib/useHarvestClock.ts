"use client";

import { useEffect, useState } from "react";
import { HARVEST_INTERVAL_SEC } from "./mock";

/**
 * Live harvest clock. Harvests land on every 10-minute UTC boundary.
 * Returns null until mounted so SSR output doesn't depend on wall-clock time.
 * TODO(onchain): derive from the program's last harvest slot instead.
 */
export function useHarvestClock() {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  if (now === null) return null;
  const sec = Math.floor(now / 1000);
  const intoRound = sec % HARVEST_INTERVAL_SEC;
  return {
    secondsLeft: HARVEST_INTERVAL_SEC - intoRound,
    secondsSinceLast: intoRound,
    progress: intoRound / HARVEST_INTERVAL_SEC,
  };
}
