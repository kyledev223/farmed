import { useCurrentFrame } from "remotion";
import { progress } from "../lib/anim";
import { C } from "../theme";

/**
 * Arrow drawn block-by-block (stepped) from `start` to `start + frames`,
 * then the stepped head appears. `length` is the full size along the arrow.
 */
export const PixelArrow: React.FC<{
  start: number;
  frames: number;
  length: number;
  direction: "right" | "down";
  block?: number;
  color?: string;
}> = ({ start, frames, length, direction, block = 14, color = C.neon }) => {
  const frame = useCurrentFrame();
  const headLen = block * 3;
  const cross = block * 5;
  const pitch = block * 1.6;
  const n = Math.max(1, Math.floor((length - headLen) / pitch));
  const shown = Math.floor(progress(frame, start, start + frames) * n);
  const done = frame >= start + frames;
  const horiz = direction === "right";

  // (along, across) → absolute box, so one code path draws both directions.
  const box = (
    along: number,
    across: number,
    extra?: React.CSSProperties,
  ): React.CSSProperties => ({
    position: "absolute",
    left: horiz ? along : across,
    top: horiz ? across : along,
    width: block,
    height: block,
    background: color,
    ...extra,
  });

  const blocks: React.CSSProperties[] = [];
  for (let i = 0; i < shown; i++)
    blocks.push(
      box(i * pitch, cross / 2 - block / 2, { boxShadow: "3px 3px 0 #000" }),
    );
  if (done) {
    // Three rows narrowing to a point: 5, 3, 1 blocks.
    [5, 3, 1].forEach((w, row) => {
      for (let k = 0; k < w; k++)
        blocks.push(
          box(
            length - headLen + row * block,
            (cross - w * block) / 2 + k * block,
          ),
        );
    });
  }

  return (
    <div
      style={{
        position: "relative",
        width: horiz ? length : cross,
        height: horiz ? cross : length,
        flexShrink: 0,
      }}
    >
      {blocks.map((s, i) => (
        <div key={i} style={s} />
      ))}
    </div>
  );
};
