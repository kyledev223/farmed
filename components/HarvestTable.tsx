"use client";

import { useState } from "react";
import { EXPLORER_TX, HARVEST_HISTORY } from "@/lib/mock";
import { fmtInt, fmtSol, fmtUtc, shortAddr } from "@/lib/format";

const PAGE = 25;

/** MOCK — replace HARVEST_HISTORY with an indexer query, paginated by round. */
export function HarvestTable() {
  const [count, setCount] = useState(PAGE);
  const rows = HARVEST_HISTORY.slice(0, count);

  return (
    <div className="panel">
      {/* Scroll is contained to the table on narrow screens; the page itself never scrolls sideways */}
      <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-label="Harvest rounds, scrollable">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Harvest payout rounds, newest first</caption>
          <thead className="border-b-2 border-line bg-bg">
            <tr className="font-pixel text-[9px] uppercase text-muted">
              <th scope="col" className="px-4 py-3 font-normal">Round</th>
              <th scope="col" className="px-4 py-3 font-normal">Time (UTC)</th>
              <th scope="col" className="px-4 py-3 text-right font-normal">Pool SOL</th>
              <th scope="col" className="px-4 py-3 text-right font-normal">Farms paid</th>
              <th scope="col" className="px-4 py-3 font-normal">Tx</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.round} className="border-b border-line transition-colors last:border-0 hover:bg-panel-2">
                <td className="px-4 py-3">
                  <span className="num text-[10px] text-ink">#{fmtInt(r.round)}</span>
                  {i === 0 && (
                    <span className="ml-2 border border-neon px-1.5 py-0.5 font-pixel text-[8px] uppercase text-neon">Latest</span>
                  )}
                </td>
                <td className="whitespace-nowrap px-4 py-3 text-muted">{fmtUtc(r.time)}</td>
                <td className="px-4 py-3 text-right tabular-nums text-neon">{fmtSol(r.poolSol, 4)}</td>
                <td className="px-4 py-3 text-right tabular-nums">{fmtInt(r.farmsPaid)}</td>
                <td className="px-4 py-3">
                  <a
                    href={EXPLORER_TX(r.tx)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs text-gold underline decoration-dashed underline-offset-4 hover:text-ink"
                  >
                    {shortAddr(r.tx, 6, 4)}
                    <span className="sr-only"> (view transaction on Solscan, opens in new tab)</span>
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t-2 border-line px-4 py-3 text-xs text-muted">
        <span aria-live="polite">
          Showing {fmtInt(rows.length)} of {fmtInt(HARVEST_HISTORY.length)} rounds
        </span>
        {count < HARVEST_HISTORY.length && (
          <button type="button" className="btn btn-ghost min-h-[40px] py-2" onClick={() => setCount((c) => c + PAGE)}>
            Load more
          </button>
        )}
      </div>
    </div>
  );
}
