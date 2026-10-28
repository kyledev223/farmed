import { random, useCurrentFrame } from "remotion";

/** Square pixel particles exploding from a point, with gravity. Positions snap to the particle grid. */
export const ParticleBurst: React.FC<{
  at: number;
  x: number;
  y: number;
  count?: number;
  colors: string[];
  speed?: number;
  size?: number;
  life?: number;
  gravity?: number;
  seed?: string;
}> = ({ at, x, y, count = 48, colors, speed = 30, size = 12, life = 28, gravity = 1.4, seed = "burst" }) => {
  const frame = useCurrentFrame();
  const t = frame - at;
  if (t < 0 || t > life) return null;
  return (
    <>
      {Array.from({ length: count }, (_, i) => {
        const r = (k: string) => random(`${seed}-${i}-${k}`);
        const a = r("a") * Math.PI * 2;
        const v = speed * (0.35 + r("v") * 0.9);
        const drag = 1 - Math.min(0.6, t / life);
        const px = x + Math.cos(a) * v * t * drag;
        const py = y + Math.sin(a) * v * t * drag + gravity * t * t;
        const s = size * (r("s") > 0.7 ? 2 : 1);
        // Blink out in the last third rather than fading — stays crisp.
        if (t > life * 0.66 && (t + i) % 2 === 0) return null;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: Math.round(px / size) * size,
              top: Math.round(py / size) * size,
              width: s,
              height: s,
              background: colors[i % colors.length],
              boxShadow: "3px 3px 0 #000",
            }}
          />
        );
      })}
    </>
  );
};
