import type { CSSProperties } from "react";
import { Easing, useCurrentFrame } from "remotion";
import { progress } from "../lib/anim";
import { fmtCompact, fmtFixed } from "../lib/text";

/**
 * Arcade-score counter: interpolates, then floors to the last shown digit,
 * so values tick up in whole steps instead of gliding.
 */
export const Counter: React.FC<{
  to: number;
  from?: number;
  start: number;
  end: number;
  decimals?: number;
  compact?: boolean;
  prefix?: string;
  suffix?: string;
  ease?: (t: number) => number;
  style?: CSSProperties;
}> = ({
  to,
  from = 0,
  start,
  end,
  decimals = 0,
  compact,
  prefix = "",
  suffix = "",
  ease = Easing.out(Easing.cubic),
  style,
}) => {
  const frame = useCurrentFrame();
  const raw = from + (to - from) * progress(frame, start, end, ease);
  const unit = 10 ** decimals;
  const v = Math.floor(raw * unit + 1e-6) / unit;
  const text = compact ? fmtCompact(Math.floor(v)) : fmtFixed(v, decimals);
  return (
    <span style={{ fontVariantNumeric: "tabular-nums", ...style }}>
      {prefix}
      {text}
      {suffix}
    </span>
  );
};
