import { loadFont as loadJetBrains } from "@remotion/google-fonts/JetBrainsMono";
import { loadFont as loadPressStart } from "@remotion/google-fonts/PressStart2P";
import type { SeriesKey } from "./copy";

const pressStart = loadPressStart("normal", { weights: ["400"], subsets: ["latin"] });
const jetbrains = loadJetBrains("normal", { weights: ["400", "700"], subsets: ["latin"] });

export const FONT = {
  pixel: pressStart.fontFamily,
  mono: jetbrains.fontFamily,
};

/** Glyph advance in em — both fonts are monospaced, so text can be fitted with math. */
export const ADVANCE = { pixel: 1, mono: 0.6 };

export const C = {
  bg: "#0B0F0C",
  panel: "#121A15",
  panel2: "#17221B",
  border: "#1F2B24",
  neon: "#22FF88",
  gold: "#F5C542",
  barn: "#C8423A",
  /** Lighter barn red for text on dark (same as the site's barn-ink). */
  barnInk: "#FF7A6E",
  text: "#E8EDE9",
  muted: "#7C8A82",
  black: "#000000",
};

export const TIER: Record<SeriesKey, { label: string; hex: string }> = {
  jeeter: { label: "COMMON", hex: "#A9B8AF" },
  paperhand: { label: "UNCOMMON", hex: "#22FF88" },
  bagholder: { label: "RARE", hex: "#5CC8FF" },
  whale: { label: "LEGENDARY", hex: "#F5C542" },
};

export const BORDER = 2;

export const hardShadow = (px = 6) => `${px}px ${px}px 0 0 ${C.black}`;
export const glow = (color: string, strength = 1) =>
  `0 0 0 ${BORDER}px ${color}, 0 0 ${Math.round(28 * strength)}px ${hexA(color, 0.45 * strength)}`;

/** "#RRGGBB" + alpha → rgba(). */
export function hexA(hex: string, a: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${Math.max(0, Math.min(1, a))})`;
}
