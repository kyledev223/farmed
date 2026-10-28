"use client";

import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipProps,
} from "recharts";
import { CHART_RANGES, getChartData, type ChartPoint, type ChartRange } from "@/lib/mock";
import { fmtCompact, fmtInt, fmtSol, fmtUtc } from "@/lib/format";

const RANGES: ChartRange[] = ["1h", "6h", "24h", "7d"];
const AXIS = { fill: "#7C8A82", fontSize: 10, fontFamily: "var(--font-mono)" };
const GRID = "#1F2B24";
const NEON = "#22FF88";
const GOLD = "#F5C542";

function tickFor(range: ChartRange) {
  return (t: number) => (range === "7d" ? fmtUtc(t).split(",")[0] : fmtUtc(t, false));
}

function ChartTooltip({ active, payload, range }: TooltipProps<number, string> & { range: ChartRange }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload as ChartPoint;
  return (
    <div className="border-2 border-line bg-bg px-3 py-2 text-xs shadow-hard">
      <p className="mb-1.5 text-muted">
        {fmtUtc(p.t)} UTC · per {CHART_RANGES[range].unit}
      </p>
      <p className="flex items-center gap-2">
        <span aria-hidden className="h-2 w-2" style={{ background: NEON }} />
        <span className="text-muted">SOL harvested</span>
        <span className="num ml-auto pl-3 text-[10px] text-ink">{fmtSol(p.sol, 3)}</span>
      </p>
      <p className="mt-1 flex items-center gap-2">
        <span aria-hidden className="h-0.5 w-2" style={{ background: GOLD }} />
        <span className="text-muted">Yield rate</span>
        <span className="num ml-auto pl-3 text-[10px] text-ink">{fmtInt(p.yieldRate)}</span>
      </p>
    </div>
  );
}

export function HarvestChart() {
  const [range, setRange] = useState<ChartRange>("24h");
  const data = useMemo(() => getChartData(range), [range]);
  const unit = CHART_RANGES[range].unit;
  const total = data.reduce((s, d) => s + d.sol, 0);
  const yieldNow = data[data.length - 1]?.yieldRate ?? 0;
  const yieldStart = data[0]?.yieldRate ?? 0;
  const yieldDelta = yieldStart ? ((yieldNow - yieldStart) / yieldStart) * 100 : 0;
  const tick = tickFor(range);
  const tooltip = <ChartTooltip range={range} />;
  const cursor = { fill: "rgba(34,255,136,0.08)" };

  return (
    <section aria-labelledby="chart-title" className="panel">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-line px-4 py-3">
        <h2 id="chart-title" className="text-[11px] uppercase">
          Harvest history
        </h2>
        <div role="group" aria-label="Time range" className="flex border-2 border-line">
          {RANGES.map((r) => (
            <button
              key={r}
              type="button"
              aria-pressed={range === r}
              onClick={() => setRange(r)}
              className={`min-h-[36px] min-w-[48px] px-3 font-pixel text-[10px] uppercase transition-colors ${
                range === r ? "bg-neon text-bg" : "text-muted hover:bg-panel-2 hover:text-ink"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-px bg-line lg:grid-cols-[1fr_220px]">
        <div className="min-w-0 space-y-6 bg-panel p-4">
          {/* Chart 1: SOL per bucket */}
          <figure>
            <figcaption className="mb-2 flex items-baseline justify-between gap-2">
              <span className="text-xs text-ink">SOL harvested per {unit}</span>
              <span className="text-[10px] text-muted">UTC</span>
            </figcaption>
            <div className="h-[180px] sm:h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} syncId="harvest" margin={{ top: 4, right: 4, bottom: 0, left: -8 }} barCategoryGap={2}>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="t" tickFormatter={tick} tick={AXIS} axisLine={{ stroke: GRID }} tickLine={false} minTickGap={24} />
                  <YAxis tick={AXIS} axisLine={false} tickLine={false} width={52} tickFormatter={(v: number) => v.toFixed(2)} />
                  <Tooltip content={tooltip} cursor={cursor} isAnimationActive={false} />
                  <Bar dataKey="sol" fill={NEON} isAnimationActive={false} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </figure>

          {/* Chart 2: total yield rate. Separate chart, same x-axis (no dual y-axis) */}
          <figure>
            <figcaption className="mb-2 text-xs text-ink">Total network yield rate</figcaption>
            <div className="h-[120px] sm:h-[140px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} syncId="harvest" margin={{ top: 4, right: 4, bottom: 0, left: -8 }}>
                  <CartesianGrid vertical={false} stroke={GRID} />
                  <XAxis dataKey="t" tickFormatter={tick} tick={AXIS} axisLine={{ stroke: GRID }} tickLine={false} minTickGap={24} />
                  <YAxis
                    tick={AXIS}
                    axisLine={false}
                    tickLine={false}
                    width={52}
                    domain={["dataMin - 1000", "dataMax + 1000"]}
                    tickFormatter={(v: number) => fmtCompact(v)}
                  />
                  <Tooltip content={tooltip} cursor={{ stroke: "#7C8A82", strokeDasharray: "2 3" }} isAnimationActive={false} />
                  <Line
                    type="stepAfter"
                    dataKey="yieldRate"
                    stroke={GOLD}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: GOLD, stroke: "#0B0F0C", strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </figure>
        </div>

        <dl className="grid grid-cols-2 gap-px bg-line lg:grid-cols-1">
          <div className="bg-panel p-4">
            <dt className="text-[10px] uppercase text-muted">Harvested ({range})</dt>
            <dd className="num mt-2 text-sm text-neon">{fmtSol(total, 2)} SOL</dd>
          </div>
          <div className="bg-panel p-4">
            <dt className="text-[10px] uppercase text-muted">Avg per {unit}</dt>
            <dd className="num mt-2 text-sm text-ink">{fmtSol(total / data.length, 3)}</dd>
          </div>
          <div className="bg-panel p-4">
            <dt className="text-[10px] uppercase text-muted">Yield rate now</dt>
            <dd className="num mt-2 text-sm text-ink">{fmtInt(yieldNow)}</dd>
          </div>
          <div className="bg-panel p-4">
            <dt className="text-[10px] uppercase text-muted">Yield change</dt>
            <dd className="num mt-2 text-sm text-gold">
              {yieldDelta >= 0 ? "+" : ""}
              {yieldDelta.toFixed(1)}%
            </dd>
          </div>
        </dl>
      </div>

      <details className="border-t-2 border-line px-4 py-3 text-xs">
        <summary className="cursor-pointer text-muted hover:text-ink">View as table</summary>
        <div className="mt-3 max-h-64 overflow-auto">
          <table className="w-full text-left">
            <thead className="sticky top-0 bg-panel text-muted">
              <tr>
                <th className="py-1 pr-4 font-normal">Time (UTC)</th>
                <th className="py-1 pr-4 text-right font-normal">SOL</th>
                <th className="py-1 text-right font-normal">Yield rate</th>
              </tr>
            </thead>
            <tbody>
              {[...data].reverse().map((d) => (
                <tr key={d.t} className="border-t border-line">
                  <td className="py-1 pr-4">{fmtUtc(d.t)}</td>
                  <td className="py-1 pr-4 text-right tabular-nums">{fmtSol(d.sol, 3)}</td>
                  <td className="py-1 text-right tabular-nums">{fmtInt(d.yieldRate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
