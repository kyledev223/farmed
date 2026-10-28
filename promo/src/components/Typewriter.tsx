import type { CSSProperties } from "react";
import { useCurrentFrame } from "remotion";
import { blink } from "../lib/anim";
import { fitText } from "../lib/text";
import { FONT } from "../theme";

/**
 * Typewriter in the pixel font. Untyped characters still take up space and the
 * cursor is an overlay, so the block never reflows while typing.
 * Cursor is solid while typing and blinks once done.
 */
export const Typewriter: React.FC<{
  text: string;
  start: number;
  framesPerChar?: number;
  maxWidth: number;
  maxFont: number;
  maxLines?: number;
  color?: string;
  cursorColor?: string;
  /** Hide the cursor from this frame on (e.g. when the next line starts). */
  cursorUntil?: number;
  align?: "left" | "center";
  style?: CSSProperties;
}> = ({
  text,
  start,
  framesPerChar = 1,
  maxWidth,
  maxFont,
  maxLines,
  color,
  cursorColor,
  cursorUntil = Infinity,
  align = "left",
  style,
}) => {
  const frame = useCurrentFrame();
  // Keep one free glyph after the last line so the end-of-text cursor stays inside maxWidth.
  const { fontSize, lines } = fitText(text, {
    maxWidth,
    maxFont,
    maxLines,
    reserveEnd: 1,
  });

  // Before it starts, still take up the space, so stacked lines never shift.
  const typed = frame < start ? 0 : Math.floor((frame - start) / framesPerChar);
  const total = lines.reduce((n, l) => n + l.length, 0);
  const done = typed >= total;
  const showCursor =
    frame >= start && frame < cursorUntil && (!done || blink(frame - start));

  // Where the cursor sits: the first untyped char, or the end of the last line.
  let cursorLine = lines.length - 1;
  let cursorCol = lines[cursorLine].length;
  for (let i = 0, acc = 0; i < lines.length; acc += lines[i].length, i++) {
    if (typed < acc + lines[i].length) {
      cursorLine = i;
      cursorCol = typed - acc;
      break;
    }
  }
  const d = Math.max(2, Math.round(fontSize / 12));

  return (
    <div
      style={{
        fontFamily: FONT.pixel,
        fontSize,
        lineHeight: 1.35,
        color,
        textAlign: align,
        whiteSpace: "pre",
        textShadow: `${d}px ${d}px 0 #000`,
        ...style,
      }}
    >
      {lines.map((line, i) => {
        const n =
          i < cursorLine ? line.length : i === cursorLine ? cursorCol : 0;
        return (
          <div key={i}>
            {line.slice(0, n)}
            <span style={{ position: "relative" }}>
              {i === cursorLine && showCursor && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "0.08em",
                    width: "0.9em",
                    height: "1em",
                    background: cursorColor ?? color,
                  }}
                />
              )}
            </span>
            <span style={{ visibility: "hidden" }}>{line.slice(n)}</span>
          </div>
        );
      })}
    </div>
  );
};
