import type { CSSProperties, ReactNode } from "react";
import { BORDER, C, glow, hardShadow } from "../theme";

/** Square-cornered panel with a 2px border, hard drop shadow and optional accent stripe/glow. */
export const PixelCard: React.FC<{
  children?: ReactNode;
  accent?: string;
  /** 0–1: neon (or accent) glow strength. */
  glowAmount?: number;
  /** Border width in px (defaults to the 2px house style; scale up for big hero cards). */
  border?: number;
  shadow?: number;
  style?: CSSProperties;
}> = ({ children, accent, glowAmount = 0, border = BORDER, shadow = 8, style }) => (
  <div
    style={{
      position: "relative",
      background: C.panel,
      border: `${border}px solid ${C.border}`,
      boxShadow: [hardShadow(shadow), glowAmount > 0 ? glow(accent ?? C.neon, glowAmount) : ""].filter(Boolean).join(", "),
      ...style,
    }}
  >
    {accent && <div style={{ height: border * 3, background: accent }} />}
    {children}
  </div>
);
