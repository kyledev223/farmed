import { SERIES, TIER_HEX, TIER_LABEL, type SeriesKey } from "@/lib/mock";

/** Series badge with tier color. Text stays readable: dark text on the tier swatch. */
export function TierBadge({ series, showTier = true }: { series: SeriesKey; showTier?: boolean }) {
  const s = SERIES[series];
  const hex = TIER_HEX[s.tier];
  return (
    <span className="inline-flex items-stretch border-2 border-black font-pixel text-[9px] uppercase leading-none">
      <span className="px-2 py-1.5 text-bg" style={{ background: hex }}>
        {s.label}
      </span>
      {showTier && (
        <span className="bg-bg px-2 py-1.5" style={{ color: hex }}>
          {TIER_LABEL[s.tier]}
        </span>
      )}
    </span>
  );
}
