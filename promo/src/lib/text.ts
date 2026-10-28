import { ADVANCE } from "../theme";

/** Greedy word wrap at `cols` characters. Returns null if a single word can't fit. */
export function wrap(text: string, cols: number): string[] | null {
  const out: string[] = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      if (word.length > cols) return null;
      const next = line ? `${line} ${word}` : word;
      if (next.length <= cols) line = next;
      else {
        out.push(line);
        line = word;
      }
    }
    out.push(line);
  }
  return out;
}

/** Wraps at `cols`, requiring `reserve` free columns after the last line (e.g. for a cursor). */
const wrapWithin = (text: string, cols: number, reserve: number) => {
  const lines = wrap(text, cols);
  return lines && lines[lines.length - 1].length + reserve <= cols
    ? lines
    : null;
};

/**
 * Largest font size (≤ maxFont) at which `text` fits `maxWidth` in ≤ maxLines.
 * Exact for monospaced fonts, so nothing can overflow at render time. Lines are
 * balanced (narrowest wrap with the same line count), so a 2-line headline
 * splits evenly instead of leaving one word dangling.
 */
export function fitText(
  text: string,
  opts: {
    maxWidth: number;
    maxFont: number;
    minFont?: number;
    maxLines?: number;
    font?: keyof typeof ADVANCE;
    /** Free glyphs to keep after the last line (Typewriter's cursor). */
    reserveEnd?: number;
  },
) {
  const {
    maxWidth,
    maxFont,
    minFont = 10,
    maxLines = Infinity,
    font = "pixel",
    reserveEnd = 0,
  } = opts;
  const adv = ADVANCE[font];
  for (let size = maxFont; size >= minFont; size -= 2) {
    const cols = Math.floor(maxWidth / (size * adv));
    let lines = wrapWithin(text, cols, reserveEnd);
    if (!lines || lines.length > maxLines) continue;
    for (let c = cols - 1; c > 0; c--) {
      const tighter = wrap(text, c);
      if (!tighter || tighter.length !== lines.length) break;
      if (tighter[tighter.length - 1].length + reserveEnd <= cols)
        lines = tighter;
    }
    return { fontSize: size, lines };
  }
  return {
    fontSize: minFont,
    lines: wrap(text, Math.floor(maxWidth / (minFont * adv))) ?? [text],
  };
}

const nf = new Intl.NumberFormat("en-US");
export const fmtInt = (n: number) => nf.format(n);
export const fmtFixed = (n: number, d: number) =>
  n.toLocaleString("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });
export const fmtCompact = (n: number) =>
  new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(n);
