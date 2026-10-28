"use client";

import Image from "next/image";
import type { ReactNode } from "react";
import { useFarmedWallet } from "@/hooks/useFarmedWallet";
import { BUY_URL, OWNED_FARMS, PROTOCOL_STATS, type OwnedFarm } from "@/lib/mock";
import { fmtDate, fmtInt, fmtPct, fmtSol } from "@/lib/format";
import { FarmCard } from "./FarmCard";
import { MintButton } from "./MintProvider";
import { PixelIcon, type IconName } from "./PixelIcon";

/** Share of the network's total yield, as a percent; 0 before any farms exist. */
const networkPct = (yieldRate: number) =>
  PROTOCOL_STATS.totalYieldRate ? (yieldRate / PROTOCOL_STATS.totalYieldRate) * 100 : 0;

export function MyFarmsView() {
  const { connected, connecting, shortAddress, openModal } = useFarmedWallet();
  // TODO(onchain): load the connected wallet's farms instead of the (empty) OWNED_FARMS
  const farms: OwnedFarm[] = connected ? OWNED_FARMS : [];

  if (!connected) {
    return (
      <EmptyState
        title="Connect to see your barn"
        body="Connect your wallet to see the farms you own, their yield rate and the SOL they've earned you."
        action={
          <button type="button" className="btn btn-gold" onClick={openModal} disabled={connecting}>
            <PixelIcon name="wallet" size={18} />
            {connecting ? "Connecting..." : "Connect wallet"}
          </button>
        }
      />
    );
  }

  if (farms.length === 0) {
    return (
      <EmptyState
        title="No farms. Just vibes."
        body="You're currently the livestock. Burn 100K $FARMED to mint your first farm and start getting paid every 10 minutes instead."
        action={
          <>
            <MintButton />
            <a href={BUY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
              Buy $FARMED<span className="sr-only"> (opens in new tab)</span>
            </a>
          </>
        }
      />
    );
  }

  return <Owned farms={farms} shortAddress={shortAddress} />;
}

function Owned({ farms, shortAddress }: { farms: OwnedFarm[]; shortAddress: string | null }) {
  const yieldRate = farms.reduce((s, f) => s + f.spec.yieldRate, 0);
  const share = networkPct(yieldRate);
  const solEarned = farms.reduce((s, f) => s + f.solEarned, 0);
  const summary: { label: string; value: string; icon: IconName; tone?: string }[] = [
    { label: "Farms owned", value: fmtInt(farms.length), icon: "barn" },
    { label: "Total yield rate", value: fmtInt(yieldRate), icon: "pitchfork", tone: "text-neon" },
    { label: "Share of network", value: fmtPct(share, 3), icon: "clock", tone: "text-gold" },
    { label: "SOL earned", value: fmtSol(solEarned, 4), icon: "sol" },
  ];

  return (
    <div className="space-y-8">
      <p className="text-xs text-muted">
        Wallet <code className="text-ink">{shortAddress}</code>
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
          Each harvest you get <span className="text-ink">{fmtPct(share, 3)}</span> of the pool. Want a bigger slice?
          Burn more.
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
                { label: "Share", value: fmtPct(networkPct(f.spec.yieldRate), 3) },
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
    </div>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action: ReactNode }) {
  return (
    <div className="panel flex flex-col items-center px-6 py-14 text-center">
      <Image src="/icons/barn.png" alt="" width={96} height={96} className="pixelated opacity-80" />
      <h2 className="mt-6 text-sm uppercase sm:text-base">{title}</h2>
      <p className="mt-4 max-w-md text-sm text-muted">{body}</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">{action}</div>
    </div>
  );
}
