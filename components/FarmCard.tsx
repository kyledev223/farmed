import Image from "next/image";
import type { ReactNode } from "react";
import { SERIES, SIZE_LABEL, TIER_HEX, type FarmSpec } from "@/lib/mock";
import { fmtInt } from "@/lib/format";
import { TierBadge } from "./TierBadge";

interface Row {
  label: string;
  value: ReactNode;
  accent?: boolean;
}

export function FarmCard({
  spec,
  rows,
  footer,
  headingLevel = "h3",
  priority = false,
}: {
  spec: FarmSpec;
  /** Overrides the default livestock / yield / odds rows. */
  rows?: Row[];
  footer?: ReactNode;
  headingLevel?: "h2" | "h3";
  priority?: boolean;
}) {
  const tierHex = TIER_HEX[SERIES[spec.series].tier];
  const H = headingLevel;
  const data: Row[] = rows ?? [
    { label: "Livestock", value: fmtInt(spec.livestock) },
    { label: "Yield rate", value: fmtInt(spec.yieldRate), accent: true },
    { label: "Odds", value: `${spec.odds}%` },
  ];

  return (
    <article
      className="glow-hover group relative flex flex-col border-2 border-line bg-panel hover:-translate-y-1 motion-reduce:hover:translate-y-0"
    >
      {/* tier stripe */}
      <div aria-hidden className="h-1 w-full" style={{ background: tierHex }} />
      <div className="relative aspect-square overflow-hidden border-b-2 border-line bg-bg">
        <Image
          src={spec.image}
          alt={`${spec.name}: pixel-art ${SERIES[spec.series].animal.toLowerCase()} farm, ${SIZE_LABEL[spec.size].toLowerCase()} size`}
          fill
          sizes="(min-width: 1024px) 270px, (min-width: 640px) 45vw, 92vw"
          className="pixelated object-cover transition-transform duration-300 group-hover:scale-[1.04] motion-reduce:group-hover:scale-100"
          priority={priority}
        />
        <div className="absolute left-2 top-2">
          <TierBadge series={spec.series} showTier={false} />
        </div>
        <span className="absolute right-2 top-2 border-2 border-black bg-bg px-1.5 py-1 font-pixel text-[9px] text-ink">
          {"■".repeat(spec.size)}
          <span className="text-line">{"■".repeat(3 - spec.size)}</span>
          <span className="sr-only">Size: {SIZE_LABEL[spec.size]}</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-3">
        <H className="text-[11px] uppercase leading-snug text-ink">{spec.name}</H>
        <dl className="grid grid-cols-3 gap-2 border-t-2 border-dashed border-line pt-3">
          {data.map((r) => (
            <div key={r.label} className="min-w-0">
              <dt className="truncate text-[10px] uppercase text-muted">{r.label}</dt>
              <dd className={`num mt-1 truncate text-[11px] ${r.accent ? "text-neon" : "text-ink"}`}>{r.value}</dd>
            </div>
          ))}
        </dl>
        {footer}
      </div>
    </article>
  );
}
