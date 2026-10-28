import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { Counter } from "../components/Counter";
import { Typewriter } from "../components/Typewriter";
import { COPY } from "../copy";
import { useLayout } from "../lib/layout";
import { fitText } from "../lib/text";
import { C, FONT, hexA } from "../theme";
import { HOOK } from "../timeline";

/** Normalised closes (0 = bottom, 1 = top): pump to the top, then the rug. */
const CLOSES = [
  0.3, 0.38, 0.47, 0.58, 0.7, 0.84, 0.95, 0.8, 0.66, 0.52, 0.56, 0.4, 0.31,
  0.24, 0.18, 0.21, 0.12, 0.08, 0.06, 0.04, 0.03, 0.02,
];
const PEAK = 6;
const snap4 = (v: number) => Math.round(v / 4) * 4;

export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, vertical, padX, pick } = useLayout();

  /* ---------- candle chart ---------- */
  const area = {
    x: padX / 2,
    y: height * pick(0.14, 0.16),
    w: width - padX,
    h: height * pick(0.72, 0.68),
  };
  const n = CLOSES.length;
  const slot = area.w / n;
  const bodyW = Math.max(8, Math.floor((slot * 0.6) / 4) * 4);
  const yOf = (p: number) => snap4(area.y + (1 - p) * area.h);
  const appearAt = (i: number) =>
    Math.round(
      i <= PEAK
        ? interpolate(i, [0, PEAK], [HOOK.chartStart, HOOK.chartPeak])
        : interpolate(i, [PEAK, n - 1], [HOOK.chartPeak, HOOK.chartEnd]),
    );
  // Music cuts out at line 3 → the chart drops to a ghost.
  const chartOpacity =
    frame < HOOK.lines[2]
      ? 0.7
      : [0.5, 0.35, 0.22][Math.min(2, Math.floor((frame - HOOK.lines[2]) / 2))];

  const candles = CLOSES.map((close, i) => {
    const at = appearAt(i);
    if (frame < at) return null;
    const open = i === 0 ? 0.26 : CLOSES[i - 1];
    // The newest candle grows over 3 stepped frames.
    const grow = Math.min(1, (frame - at + 1) / 3);
    const c = open + (close - open) * grow;
    const up = close >= open;
    const hi = Math.max(open, c) + 0.015 + random(`hi-${i}`) * 0.03;
    const lo = Math.min(open, c) - 0.015 - random(`lo-${i}`) * 0.03;
    const cx = snap4(area.x + slot * (i + 0.5));
    const color = up ? C.neon : C.barn;
    const top = yOf(Math.max(open, c));
    const bottom = Math.max(top + 4, yOf(Math.min(open, c)));
    return (
      <div key={i}>
        <div
          style={{
            position: "absolute",
            left: cx - 2,
            top: yOf(hi),
            width: 4,
            height: yOf(lo) - yOf(hi),
            background: color,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: cx - bodyW / 2,
            top,
            width: bodyW,
            height: bottom - top,
            background: color,
            boxShadow: "4px 4px 0 #000",
          }}
        />
      </div>
    );
  });

  const peakX = snap4(area.x + slot * (PEAK + 0.5));
  const lastX = snap4(area.x + slot * (n - 0.5));
  const markSize = pick(30, 34);

  /* ---------- text ---------- */
  const maxW = width - padX * 2;
  // Lines 1–2 share one size so the block reads as a list (fitted exactly as Typewriter does).
  const size = (l: string, maxFont: number) =>
    fitText(l, { maxWidth: maxW, maxFont, maxLines: 2, reserveEnd: 1 })
      .fontSize;
  const small = Math.min(
    ...COPY.hook.lines.slice(0, 2).map((l) => size(l, pick(76, 84))),
  );
  const big = size(COPY.hook.lines[2], pick(100, 124));

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <AbsoluteFill style={{ opacity: chartOpacity }}>
        {/* faint grid */}
        {Array.from({ length: 6 }, (_, k) => (
          <div
            key={k}
            style={{
              position: "absolute",
              left: area.x,
              width: area.w,
              top: snap4(area.y + (area.h * k) / 5),
              height: 2,
              background: hexA(C.border, 0.9),
            }}
          />
        ))}
        {candles}
        {frame >= appearAt(PEAK) + 2 && (
          <div
            style={{
              position: "absolute",
              left: peakX + bodyW,
              top: yOf(CLOSES[PEAK]) - markSize * 1.6,
              fontFamily: FONT.mono,
              fontWeight: 700,
              fontSize: markSize * 1.3,
              color: C.neon,
              textShadow: "3px 3px 0 #000",
            }}
          >
            {COPY.hook.markTop}
          </div>
        )}
        {frame >= HOOK.chartEnd + 2 && (
          <div
            style={{
              position: "absolute",
              right: width - lastX + bodyW,
              top: yOf(0.02) - markSize * 0.5,
              fontFamily: FONT.mono,
              fontWeight: 700,
              fontSize: markSize * 1.3,
              color: C.barnInk,
              textShadow: "3px 3px 0 #000",
            }}
          >
            {COPY.hook.markBottom}
          </div>
        )}
      </AbsoluteFill>

      {/* ticker + PnL */}
      <div
        style={{
          position: "absolute",
          left: padX,
          top: pick(60, 150),
          fontFamily: FONT.mono,
          fontWeight: 700,
          fontSize: pick(30, 38),
          color: C.muted,
          display: "flex",
          gap: 24,
        }}
      >
        <span>{COPY.hook.ticker}</span>
        {frame < HOOK.chartPeak ? (
          <Counter
            to={COPY.hook.pump}
            start={HOOK.chartStart}
            end={HOOK.chartPeak}
            decimals={1}
            prefix="+"
            suffix="%"
            style={{ color: C.neon }}
          />
        ) : (
          <Counter
            to={COPY.hook.drawdown}
            start={HOOK.chartPeak}
            end={HOOK.chartEnd}
            decimals={1}
            prefix="-"
            suffix="%"
            style={{ color: C.barnInk }}
          />
        )}
      </div>

      {/* text block, darkened band behind for legibility over the chart */}
      <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            height: pick(560, 900),
            transform: "translateY(-50%)",
            background:
              "linear-gradient(to bottom, transparent, rgba(0,0,0,0.75) 25%, rgba(0,0,0,0.75) 75%, transparent)",
          }}
        />
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: pick(18, 34),
            width: vertical ? maxW : undefined,
          }}
        >
          {COPY.hook.lines.map((line, i) => (
            <Typewriter
              key={i}
              text={line}
              start={HOOK.lines[i]}
              framesPerChar={HOOK.framesPerChar}
              maxWidth={maxW}
              maxFont={i < 2 ? small : big}
              maxLines={2}
              color={i < 2 ? C.text : C.neon}
              cursorColor={C.neon}
              cursorUntil={HOOK.lines[i + 1]}
              style={i === 2 ? { marginTop: pick(16, 30) } : undefined}
            />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
