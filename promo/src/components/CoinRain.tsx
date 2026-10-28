import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import { PixelImg } from "./PixelImg";

const GRID = 4;
const snap = (v: number) => Math.round(v / GRID) * GRID;

/**
 * SOL coins rain from the top edge and funnel into a target point (the wallet).
 * Positions snap to a 4px grid and the spin is a 3-step pixel flip.
 */
export const CoinRain: React.FC<{
  start: number;
  end: number;
  count: number;
  target: { x: number; y: number };
  /** Horizontal spawn band along the top edge. */
  spawn: { x0: number; x1: number; y: number };
  size: number;
  fall?: [number, number];
  seed?: string;
}> = ({ start, end, count, target, spawn, size, fall = [14, 22], seed = "coin" }) => {
  const frame = useCurrentFrame();
  const span = Math.max(1, end - start - fall[1]);

  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const born = start + (i / count) * span + r("d") * 4;
        const dur = fall[0] + r("f") * (fall[1] - fall[0]);
        const t = (frame - born) / dur;
        if (t < 0 || t >= 1) return null;
        const x0 = spawn.x0 + r("x") * (spawn.x1 - spawn.x0);
        const x = interpolate(t, [0, 1], [x0, target.x], { easing: Easing.in(Easing.quad) });
        const y = interpolate(t * t, [0, 1], [spawn.y, target.y]);
        const flip = [1, 0.6, 0.25, 0.6][Math.floor(frame / 2 + r("p") * 4) % 4];
        const s = size * (0.8 + r("s") * 0.4) * interpolate(t, [0.8, 1], [1, 0.6], { extrapolateLeft: "clamp" });
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: snap(x - s / 2),
              top: snap(y - s / 2),
              width: s,
              height: s,
              transform: `scaleX(${flip})`,
            }}
          >
            <PixelImg src="icons/sol.png" style={{ width: "100%", height: "100%" }} />
          </div>
        );
      })}
    </>
  );
};
