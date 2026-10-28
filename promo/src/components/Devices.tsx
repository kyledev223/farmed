import type { ReactNode } from "react";
import { C, FONT, hardShadow } from "../theme";

/** Stepped (pixel) corners via clip-path, `s` = step size in px. */
const pixelCorners = (s: number) => {
  // Top-left corner staircase, clockwise, in units of s. Other corners mirror it.
  const P = [
    [0, 2],
    [1, 2],
    [1, 1],
    [2, 1],
    [2, 0],
  ];
  const v = (n: number, mirror: boolean) =>
    mirror ? `calc(100% - ${n * s}px)` : `${n * s}px`;
  const corner = (mx: boolean, my: boolean, rev: boolean) =>
    (rev ? [...P].reverse() : P).map(([x, y]) => `${v(x, mx)} ${v(y, my)}`);
  return `polygon(${[...corner(false, false, false), ...corner(true, false, true), ...corner(true, true, false), ...corner(false, true, true)].join(", ")})`;
};

/** Square-cornered browser window with traffic-light squares and a URL bar. */
export const BrowserFrame: React.FC<{
  width: number;
  height: number;
  url: string;
  children: ReactNode;
}> = ({ width, height, url, children }) => {
  const bar = 64;
  return (
    <div
      style={{
        width,
        height,
        border: `4px solid ${C.border}`,
        background: C.bg,
        boxShadow: hardShadow(14),
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          height: bar,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "0 22px",
          background: C.panel,
          borderBottom: `4px solid ${C.border}`,
        }}
      >
        {[C.barn, C.gold, C.neon].map((c) => (
          <div
            key={c}
            style={{
              width: 18,
              height: 18,
              background: c,
              boxShadow: "2px 2px 0 #000",
            }}
          />
        ))}
        <div
          style={{
            marginLeft: 22,
            flex: 1,
            height: 38,
            display: "flex",
            alignItems: "center",
            padding: "0 18px",
            background: C.bg,
            border: `2px solid ${C.border}`,
            fontFamily: FONT.mono,
            fontSize: 22,
            color: C.muted,
          }}
        >
          <span style={{ color: C.neon }}>https://</span>
          <span style={{ color: C.text }}>{url}</span>
        </div>
      </div>
      <div style={{ position: "relative", flex: 1, overflow: "hidden" }}>
        {children}
      </div>
    </div>
  );
};

/** Chunky phone with stepped pixel corners and a notch. */
export const PhoneFrame: React.FC<{
  width: number;
  height: number;
  children: ReactNode;
}> = ({ width, height, children }) => {
  const bezel = Math.round(width * 0.04);
  const step = Math.round(width * 0.025);
  return (
    <div
      style={{
        position: "relative",
        width,
        height,
        filter: `drop-shadow(14px 14px 0 #000)`,
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: C.border,
          clipPath: pixelCorners(step * 2),
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: bezel,
          background: C.bg,
          overflow: "hidden",
          clipPath: pixelCorners(step),
        }}
      >
        {children}
      </div>
      <div
        style={{
          position: "absolute",
          top: bezel,
          left: "50%",
          width: width * 0.3,
          height: bezel * 1.1,
          transform: "translateX(-50%)",
          background: C.border,
        }}
      />
    </div>
  );
};
