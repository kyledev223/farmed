import type { CSSProperties } from "react";
import { fitText } from "../lib/text";
import { FONT } from "../theme";

/** Auto-fitted pixel-font text block: wraps on words, shrinks until it fits. */
export const PixelText: React.FC<{
  text: string;
  maxWidth: number;
  maxFont: number;
  maxLines?: number;
  color?: string;
  align?: "left" | "center" | "right";
  lineHeight?: number;
  /** Hard pixel drop shadow (in px at 1x; scales with font size). */
  shadow?: boolean;
  font?: "pixel" | "mono";
  style?: CSSProperties;
}> = ({
  text,
  maxWidth,
  maxFont,
  maxLines,
  color,
  align = "center",
  lineHeight = 1.35,
  shadow = true,
  font = "pixel",
  style,
}) => {
  const { fontSize, lines } = fitText(text, {
    maxWidth,
    maxFont,
    maxLines,
    font,
  });
  const d = Math.max(2, Math.round(fontSize / 12));
  return (
    <div
      style={{
        fontFamily: font === "pixel" ? FONT.pixel : FONT.mono,
        fontSize,
        lineHeight,
        color,
        textAlign: align,
        whiteSpace: "pre",
        textShadow: shadow ? `${d}px ${d}px 0 #000` : undefined,
        ...style,
      }}
    >
      {lines.map((l, i) => (
        <div key={i}>{l || " "}</div>
      ))}
    </div>
  );
};
