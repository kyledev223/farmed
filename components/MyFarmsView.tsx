"use client";

import Image from "next/image";
import { useState } from "react";
import { BUY_URL, OWNED_FARMS, PROTOCOL_STATS, WALLET_SUMMARY, type OwnedFarm } from "@/lib/mock";
import { fmtDate, fmtInt, fmtPct, fmtSol, shortAddr } from "@/lib/format";
import { FarmCard } from "./FarmCard";
import { MintButton } from "./MintProvider";
import { PixelIcon, type IconName } from "./PixelIcon";

/**
 * MOCK — swap `farms` for the connected wallet's farm NFTs (e.g. via DAS getAssetsByOwner)
 * and the summary for live values. The preview toggle is design-only; remove it when wired.
 */
export function MyFarmsView() {
  const [preview, setPreview] = useState<"owned" | "empty">("owned");
  const farms: OwnedFarm[] = preview === "owned" ? OWNED_FARMS : [];

  return (
    <div className="space-y-8">
      <div role="group" aria-label="Design preview" className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <span className="border border-dashed border-line px-2 py-1 font-pixel text-[9px] uppercase">Design preview</span>
        {(["owned", "empty"] as const).map((p) => (
          <button
            key={p}
            type="button"
            aria-pressed={preview === p}
            onClick={() => setPreview(p)}
            className={`min-h-[36px] border-2 px-3 font-pixel text-[9px] uppercase ${
              preview === p ? "border-neon text-neon" : "border-line text-muted hover:text-ink"
            }`}
          >
            {p === "owned" ? "Has farms" : "Empty state"}
          </button>
        ))}
      </div>

      {farms.length === 0 ? <EmptyState /> : <Owned farms={farms} />}
    </div>
  );
}

function Owned({ farms }: { farms: OwnedFarm[] }) {
  const summary: { label: string; value: string; icon: IconName; tone?: string }[] = [
    { label: "Farms owned", value: fmtInt(farms.length), icon: "barn" },
    { label: "Total yield rate", value: fmtInt(WALLET_SUMMARY.yieldRate), icon: "pitchfork", tone: "text-neon" },
    { label: "Share of network", value: fmtPct(WALLET_SUMMARY.networkShare * 100, 3), icon: "clock", tone: "text-gold" },
    { label: "SOL earned", value: fmtSol(WALLET_SUMMARY.solEarned, 4), icon: "sol" },
  ];

  return (
    <>
      <p className="text-xs text-muted">
        Wallet <code className="text-ink">{shortAddr(WALLET_SUMMARY.address, 6, 6)}</code> (mock)
      </p>
      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {summary.map((s) => (
          <div key={s.label} className="panel flex min-w-0 items-center gap-3 p-3 sm:p-4">
            <PixelIcon name={s.icon} size={36} className="hidden sm:inline-block" />
            <div className="min-w-0">
              <dt className="truncate text-[10px] uppercase text-muted">{s.label}</dt>
              <dd className={`num mt-1.5 truncate text-sm ${s.tone ?? "text-ink"}`}>{s.value}</dd>
            </div>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap items-center justify-between gap-4 border-2 border-dashed border-line p-4">
        <p className="text-sm text-muted">
          Each harvest you get <span className="text-ink">{fmtPct(WALLET_SUMMARY.networkShare * 100, 3)}</span> of the
          pool. Want a bigger slice? Burn more.
        </p>
        <MintButton />
      </div>

      <ul className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2 lg:grid-cols-4">
        {farms.map((f) => (
          <li key={f.tokenId}>
            <FarmCard
              spec={f.spec}
              rows={[
                { label: "Yield", value: fmtInt(f.spec.yieldRate), accent: true },
                { label: "Share", value: fmtPct((f.spec.yieldRate / PROTOCOL_STATS.totalYieldRate) * 100, 3) },
                { label: "Earned", value: fmtSol(f.solEarned, 3) },
              ]}
              footer={
                <p className="mt-auto flex justify-between border-t-2 border-line pt-2 text-[11px] text-muted">
                  <span>#{f.tokenId}</span>
                  <span>Minted {fmtDate(f.mintedAt)}</span>
                </p>
              }
            />
          </li>
        ))}
      </ul>
    </>
  );
}

function EmptyState() {
  return (
    <div className="panel flex flex-col items-center px-6 py-14 text-center">
      <Image src="/icons/barn.png" alt="" width={96} height={96} className="pixelated opacity-80" />
      <h2 className="mt-6 text-sm uppercase sm:text-base">No farms. Just vibes.</h2>
      <p className="mt-4 max-w-md text-sm text-muted">
        You&apos;re currently the livestock. Burn 100K $FARMED to mint your first farm and start getting paid every
        10 minutes instead.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <MintButton />
        <a href={BUY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
          Buy $FARMED<span className="sr-only"> (opens in new tab)</span>
        </a>
      </div>
    </div>
  );
}
