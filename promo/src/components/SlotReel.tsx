import { Easing, interpolate, useCurrentFrame } from "remotion";
import { C, hardShadow } from "../theme";
import { PixelImg } from "./PixelImg";

/**
 * Reel position in cards: a continuous fast spin that eases off, then discrete
 * ticks (one card per interval) so the stop reads as a stepped, mechanical click.
 */
export function reelPosition(
  frame: number,
  start: number,
  land: number,
  landIndex: number,
  ticks: number[],
) {
  const last = landIndex;
  if (frame >= land) {
    // Tiny overshoot-and-settle, snapped per frame.
    const settle = [0.1, -0.04, 0][Math.min(2, frame - land)];
    return last + settle;
  }
  const tickTotal = ticks.reduce((a, b) => a + b, 0);
  const spinEnd = land - tickTotal;
  const spinCards = last - ticks.length;
  if (frame < spinEnd) {
    const t = interpolate(frame, [start, spinEnd], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });
    // Mostly ease-out, with some linear left in so it hands off to the ticks without a dead stop.
    return spinCards * (0.7 * Easing.out(Easing.quad)(t) + 0.3 * t);
  }
  let at = spinEnd;
  let pos = spinCards;
  for (const gap of ticks) {
    at += gap;
    if (frame < at) break;
    pos++;
  }
  return pos;
}

export const SlotReel: React.FC<{
  ids: string[];
  /** Index the reel stops on (cards after it just fill the window above). */
  landIndex: number;
  start: number;
  land: number;
  ticks: number[];
  cardSize: number;
  tierColor: (id: string) => string;
  children?: React.ReactNode;
}> = ({
  ids,
  landIndex,
  start,
  land,
  ticks,
  cardSize,
  tierColor,
  children,
}) => {
  const frame = useCurrentFrame();
  const pos = reelPosition(frame, start, land, landIndex, ticks);
  const gap = Math.round(cardSize * 0.08);
  const pitch = cardSize + gap;
  const winH = Math.round(cardSize * 1.7);
  const frameW = Math.round(cardSize * 0.035);
  const landed = frame >= land;
  const near = Math.round(pos);

  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          position: "relative",
          width: cardSize + gap * 2,
          height: winH,
          overflow: "hidden",
          background: C.bg,
          border: `${frameW}px solid ${landed ? C.gold : C.border}`,
          boxShadow: hardShadow(10),
        }}
      >
        {ids.map((id, i) => {
          if (Math.abs(i - pos) > 1.6) return null;
          // Higher index sits above, so the strip travels downward as pos grows.
          const top = Math.round(winH / 2 - cardSize / 2 - (i - pos) * pitch);
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: gap - frameW,
                top,
                width: cardSize,
                height: cardSize,
                border: `${frameW}px solid ${tierColor(id)}`,
                background: C.panel,
              }}
            >
              <PixelImg
                src={`farms/${id}.png`}
                fit="cover"
                style={{
                  width: "100%",
                  height: "100%",
                  opacity: i === near ? 1 : 0.55,
                }}
              />
            </div>
          );
        })}
        {/* Fade the neighbours into the window edge. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(to bottom, ${C.bg} 0%, transparent 22%, transparent 78%, ${C.bg} 100%)`,
          }}
        />
      </div>
      {/* Overlays positioned in reel space (e.g. the landing burst), not clipped by the window. */}
      <div style={{ position: "absolute", inset: 0 }}>{children}</div>
    </div>
  );
};
