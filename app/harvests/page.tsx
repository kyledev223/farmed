import type { Metadata } from "next";
import { HarvestCountdown } from "@/components/HarvestCountdown";
import { HarvestTable } from "@/components/HarvestTable";
import { SectionHeading } from "@/components/SectionHeading";
import { HARVEST_HISTORY, PROTOCOL_STATS } from "@/lib/mock";
import { fmtInt, fmtSol } from "@/lib/format";

export const metadata: Metadata = { title: "Harvests" };

const last24 = HARVEST_HISTORY.slice(0, 144);
const sol24 = last24.reduce((s, r) => s + r.poolSol, 0);
const best24 = last24.reduce((m, r) => Math.max(m, r.poolSol), 0);

export default function HarvestsPage() {
  return (
    <div className="container-farm py-14">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px] lg:items-start">
        <div>
          <SectionHeading as="h1" eyebrow="Payout log" title="Harvests">
            Every 10 minutes the barn doors open, creator fees get swept up, and SOL goes out to every farm, weighted by
            yield rate. Here&apos;s the receipt.
          </SectionHeading>
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              ["Rounds", fmtInt(PROTOCOL_STATS.lastHarvestRound)],
              ["All-time SOL", fmtSol(PROTOCOL_STATS.solHarvestedAllTime)],
              ["Last 24h SOL", fmtSol(sol24)],
              ["Best round 24h", fmtSol(best24, 3)],
            ].map(([k, v]) => (
              <div key={k} className="panel p-4">
                <dt className="text-[10px] uppercase text-muted">{k}</dt>
                <dd className="num mt-2 text-xs text-ink sm:text-sm">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <HarvestCountdown />
      </div>

      <div className="mt-10">
        <HarvestTable />
      </div>
    </div>
  );
}
