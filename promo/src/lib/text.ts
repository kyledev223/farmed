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

/**
 * Largest font size (≤ maxFont) at which `text` fits `maxWidth` in ≤ maxLines.
 * Exact for monospaced fonts, so nothing can overflow at render time.
 */
export function fitText(
  text: string,
  opts: { maxWidth: number; maxFont: number; minFont?: number; maxLines?: number; font?: keyof typeof ADVANCE },
) {
  const { maxWidth, maxFont, minFont = 10, maxLines = Infinity, font = "pixel" } = opts;
  const adv = ADVANCE[font];
  for (let size = maxFont; size >= minFont; size -= 2) {
    const lines = wrap(text, Math.floor(maxWidth / (size * adv)));
    if (lines && lines.length <= maxLines) return { fontSize: size, lines };
  }
  return { fontSize: minFont, lines: wrap(text, Math.floor(maxWidth / (minFont * adv))) ?? [text] };
}

const nf = new Intl.NumberFormat("en-US");
export const fmtInt = (n: number) => nf.format(n);
export const fmtFixed = (n: number, d: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
export const fmtCompact = (n: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
