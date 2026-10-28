"use client";

import { MINT_COST, PAYOUT_ASSET, PROTOCOL_STATS, TOKEN_SYMBOL } from "@/lib/mock";
import { fmtCompact, fmtMmSs, fmtSol } from "@/lib/format";
import { useHarvestClock } from "@/lib/useHarvestClock";
import { PixelIcon } from "./PixelIcon";

const SEGMENTS = 20;

export function HarvestCountdown() {
  const clock = useHarvestClock();
  const filled = clock ? Math.floor(clock.progress * SEGMENTS) : 0;
  const imminent = clock !== null && clock.secondsLeft <= 30;

  return (
    <section aria-labelledby="next-harvest" className="panel relative w-full shadow-hard">
      <div className="flex items-center justify-between border-b-2 border-line bg-bg px-4 py-3">
        <h2 id="next-harvest" className="flex items-center gap-2 text-[10px] uppercase text-muted">
          <PixelIcon name="clock" size={20} />
          Next harvest
        </h2>
        <span className="flex items-center gap-2 font-pixel text-[9px] uppercase text-neon">
          <span aria-hidden className="h-2 w-2 animate-blink bg-neon" />
          Live
        </span>
      </div>

      <div className="px-4 py-6 text-center">
        {/* Not a live region: screen readers read it on demand instead of every second */}
        <p
          className={`num text-[44px] leading-none sm:text-[52px] ${imminent ? "text-gold" : "text-ink"}`}
          style={{ textShadow: imminent ? "0 0 18px rgba(245,197,66,.45)" : "0 0 18px rgba(34,255,136,.25)" }}
        >
          <span aria-hidden>{clock ? fmtMmSs(clock.secondsLeft) : "--:--"}</span>
          <span className="sr-only">
            {clock
              ? `${Math.floor(clock.secondsLeft / 60)} minutes ${clock.secondsLeft % 60} seconds until next harvest`
              : "Loading countdown"}
          </span>
        </p>

        <div
          className="mx-auto mt-5 flex max-w-[280px] gap-[3px]"
          role="progressbar"
          aria-label="Round progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={clock ? Math.round(clock.progress * 100) : 0}
        >
          {Array.from({ length: SEGMENTS }, (_, i) => (
            <span key={i} className={`h-3 flex-1 ${i < filled ? "bg-neon" : "bg-line"}`} />
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          {imminent ? "Sharpening the pitchforks..." : "Fees accumulate, then get split by yield rate."}
        </p>
      </div>

      <dl className="grid grid-cols-3 border-t-2 border-line text-center">
        <div className="border-r-2 border-line px-2 py-3">
          <dt className="text-[10px] uppercase text-muted">Mint price</dt>
          <dd className="num mt-1.5 text-[10px] text-gold">
            {fmtCompact(MINT_COST)}
            <span className="sr-only"> {TOKEN_SYMBOL}</span>
          </dd>
        </div>
        <div className="border-r-2 border-line px-2 py-3">
          <dt className="text-[10px] uppercase text-muted">Payout</dt>
          <dd className="num mt-1.5 flex items-center justify-center gap-1 text-[10px] text-ink">
            <PixelIcon name="sol" size={14} />
            {PAYOUT_ASSET}
          </dd>
        </div>
        <div className="px-2 py-3">
          <dt className="text-[10px] uppercase text-muted">Last pool</dt>
          <dd className="num mt-1.5 text-[10px] text-neon">{fmtSol(PROTOCOL_STATS.lastHarvestSol, 3)}</dd>
        </div>
      </dl>
    </section>
  );
}
