import type { Metadata } from "next";
import Image from "next/image";
import { MintButton } from "@/components/MintProvider";
import { SectionHeading } from "@/components/SectionHeading";
import { StatStrip } from "@/components/StatStrip";
import {
  CATALOGUE,
  EXPECTED_YIELD,
  HARVEST_HISTORY,
  PROTOCOL_STATS,
  SERIES,
  SERIES_ORDER,
  SIZE_LABEL,
  TIER_HEX,
  TIER_LABEL,
} from "@/lib/mock";
import { fmtInt, fmtSol } from "@/lib/format";

export const metadata: Metadata = { title: "Stats" };

// Est. SOL/day per farm = its share of network yield × trailing 24h pool (mock)
const sol24 = HARVEST_HISTORY.slice(0, 144).reduce((s, r) => s + r.poolSol, 0);
const solPerYieldPerDay = sol24 / PROTOCOL_STATS.totalYieldRate;
const maxOdds = Math.max(...CATALOGUE.map((f) => f.odds));

export default function StatsPage() {
  return (
    <>
      <div className="container-farm pt-14">
        <SectionHeading as="h1" eyebrow="Numbers" title="Stats & odds">
          The full catalogue spec, mint odds and what each farm would earn at the current harvest rate. Estimates use
          the trailing 24h pool and change every round.
        </SectionHeading>
      </div>
      <StatStrip />

      <div className="container-farm space-y-16 py-14">
        {/* Odds by series */}
        <section aria-labelledby="odds-title">
          <h2 id="odds-title" className="mb-6 text-sm uppercase sm:text-base">
            Mint odds
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {SERIES_ORDER.map((key) => {
              const s = SERIES[key];
              const hex = TIER_HEX[s.tier];
              const farms = CATALOGUE.filter((f) => f.series === key);
              const total = farms.reduce((a, f) => a + f.odds, 0);
              return (
                <div key={key} className="panel p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="text-[11px] uppercase">
                      {s.label} <span className="font-mono text-xs normal-case text-muted">· {s.animal}</span>
                    </h3>
                    <span className="font-pixel text-[9px] uppercase" style={{ color: hex }}>
                      {TIER_LABEL[s.tier]} · {total}%
                    </span>
                  </div>
                  <ul className="space-y-3">
                    {farms.map((f) => (
                      <li key={f.id} className="grid grid-cols-[88px_1fr_48px] items-center gap-3 text-xs">
                        <span className="truncate text-muted">{SIZE_LABEL[f.size]}</span>
                        <span aria-hidden className="h-3 bg-bg">
                          <span className="block h-full" style={{ width: `${(f.odds / maxOdds) * 100}%`, background: hex }} />
                        </span>
                        <span className="text-right tabular-nums text-ink">
                          {f.odds}%<span className="sr-only"> chance: {f.name}</span>
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        {/* Full spec table */}
        <section aria-labelledby="spec-title">
          <h2 id="spec-title" className="mb-6 text-sm uppercase sm:text-base">
            Catalogue spec
          </h2>
          <div className="panel relative overflow-x-auto" tabIndex={0} role="region" aria-label="Catalogue spec, scrollable">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="border-b-2 border-line bg-bg">
                <tr className="font-pixel text-[9px] uppercase text-muted">
                  <th scope="col" className="px-4 py-3 font-normal">Farm</th>
                  <th scope="col" className="px-4 py-3 font-normal">Tier</th>
                  <th scope="col" className="px-4 py-3 font-normal">Size</th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">Livestock</th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">Yield rate</th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">Odds</th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">vs. avg</th>
                  <th scope="col" className="px-4 py-3 text-right font-normal">Est. SOL/day</th>
                </tr>
              </thead>
              <tbody>
                {CATALOGUE.map((f) => {
                  const tier = SERIES[f.series].tier;
                  return (
                    <tr key={f.id} className="border-b border-line last:border-0 hover:bg-panel-2">
                      <th scope="row" className="px-4 py-2.5 font-normal">
                        <span className="flex items-center gap-3">
                          <Image src={f.image} alt="" width={36} height={36} className="pixelated border border-line" />
                          <span className="whitespace-nowrap text-ink">{f.name}</span>
                        </span>
                      </th>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex items-center gap-2 whitespace-nowrap text-xs">
                          <span aria-hidden className="h-2.5 w-2.5" style={{ background: TIER_HEX[tier] }} />
                          {TIER_LABEL[tier]}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-muted">{SIZE_LABEL[f.size]}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{fmtInt(f.livestock)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-neon">{fmtInt(f.yieldRate)}</td>
                      <td className="px-4 py-2.5 text-right tabular-nums">{f.odds}%</td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-muted">
                        {(f.yieldRate / EXPECTED_YIELD).toFixed(2)}×
                      </td>
                      <td className="px-4 py-2.5 text-right tabular-nums text-gold">
                        {fmtSol(f.yieldRate * solPerYieldPerDay, 4)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="border-t-2 border-line bg-bg text-xs text-muted">
                <tr>
                  <td colSpan={4} className="px-4 py-3">
                    Expected yield per mint (odds-weighted)
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink">{EXPECTED_YIELD.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right tabular-nums">100%</td>
                  <td className="px-4 py-3 text-right">1.00×</td>
                  <td className="px-4 py-3 text-right tabular-nums text-ink">{fmtSol(EXPECTED_YIELD * solPerYieldPerDay, 4)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="mt-4 text-xs text-muted">
            Est. SOL/day = farm yield rate ÷ network yield rate ({fmtInt(PROTOCOL_STATS.totalYieldRate)}) × trailing 24h
            pool ({fmtSol(sol24)} SOL). Past harvests are not a promise of future harvests. Volume dies, and so do pools.
          </p>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-dashed border-line p-5">
          <p className="text-sm text-muted">Done doing math? The barn is open.</p>
          <MintButton />
        </div>
      </div>
    </>
  );
}
