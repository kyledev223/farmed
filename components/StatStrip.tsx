"use client";

import { PROTOCOL_STATS } from "@/lib/mock";
import { fmtCompact, fmtInt, fmtMmSs, fmtSol } from "@/lib/format";
import { useHarvestClock } from "@/lib/useHarvestClock";
import { PixelIcon, type IconName } from "./PixelIcon";

export function StatStrip() {
  const clock = useHarvestClock();
  const stats: { label: string; value: string; icon: IconName; tone?: string; sub?: string }[] = [
    { label: "Total yield rate", value: fmtInt(PROTOCOL_STATS.totalYieldRate), icon: "pitchfork", tone: "text-neon" },
    { label: "SOL harvested", value: fmtSol(PROTOCOL_STATS.solHarvestedAllTime), icon: "sol", sub: "all-time" },
    { label: "Farms minted", value: fmtInt(PROTOCOL_STATS.farmsMinted), icon: "barn" },
    {
      label: "$FARMED burned",
      value: fmtCompact(PROTOCOL_STATS.farmedBurned),
      icon: "flame",
      tone: "text-barn-ink",
    },
    PROTOCOL_STATS.lastHarvestRound === 0
      ? { label: "Last harvest", value: "None yet", icon: "clock", tone: "text-muted" }
      : {
          label: "Last harvest",
          value: clock ? fmtMmSs(clock.secondsSinceLast) : "--:--",
          icon: "clock",
          sub: `ago · #${fmtInt(PROTOCOL_STATS.lastHarvestRound)}`,
        },
  ];

  return (
    <section aria-label="Protocol stats" className="border-y-2 border-line bg-panel/90">
      <dl className="container-farm grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className={`flex min-w-0 items-center gap-3 border-line py-5 pr-3 lg:border-r-2 lg:pl-5 lg:first:pl-0 lg:last:border-r-0 ${
              i === 4 ? "col-span-2 sm:col-span-1" : ""
            }`}
          >
            <PixelIcon name={s.icon} size={32} />
            <div className="min-w-0">
              <dt className="truncate text-[10px] uppercase text-muted">{s.label}</dt>
              <dd className={`num mt-1.5 truncate text-[13px] ${s.tone ?? "text-ink"}`}>
                {s.value}
                {s.sub && <span className="ml-1 font-mono text-[10px] text-muted">{s.sub}</span>}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </section>
  );
}
