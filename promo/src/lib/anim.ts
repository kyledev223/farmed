import { Easing, interpolate, random } from "remotion";
import { BEAT, SHAKES } from "../timeline";

type Ease = (t: number) => number;

/** Quantize time into `n` steps before easing — reads as retro, frame-skipped motion. */
export const stepped =
  (n: number, ease: Ease = (t) => t): Ease =>
  (t) =>
    ease(Math.floor(t * n) / n);

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** 0→1 between two frames, optionally eased. */
export const progress = (frame: number, start: number, end: number, ease?: Ease) =>
  interpolate(frame, [start, end], [0, 1], { ...clamp, easing: ease });

/**
 * Pixel "pop" in, matching the site's `pop 420ms steps(6)`:
 * 0.6 → 1.08 → 1, stepped. Returns scale + visibility.
 */
export function pop(frame: number, at: number, frames = 6) {
  const t = Math.floor(frame - at);
  if (t < 0) return { scale: 0.6, opacity: 0 };
  const scale = interpolate(t, [0, frames * 0.6, frames], [0.6, 1.08, 1], clamp);
  return { scale: Math.round(scale * 20) / 20, opacity: 1 };
}

/** Slam in from big to 1 over a few hard frames. */
export function slam(frame: number, at: number, frames = 4, from = 2.6) {
  const t = frame - at;
  if (t < 0) return { scale: from, opacity: 0 };
  return { scale: interpolate(t, [0, frames], [from, 1], { ...clamp, easing: stepped(frames, Easing.in(Easing.quad)) }), opacity: 1 };
}

/** 1 on every beat, decaying to 0 within `decay` frames (stepped). */
export function beatPulse(frame: number, decay = 9, offset = 0) {
  const t = (((frame - offset) % BEAT) + BEAT) % BEAT;
  return Math.max(0, 1 - Math.floor(t / 2) / Math.floor(decay / 2));
}

/** Square-wave blink for cursors. */
export const blink = (frame: number, period = 16) => Math.floor(frame / (period / 2)) % 2 === 0;

/** Combined screen-shake offset for an absolute frame, from timeline SHAKES. */
export function shakeAt(frame: number) {
  let x = 0;
  let y = 0;
  for (const s of SHAKES) {
    const t = frame - s.at;
    if (t < 0 || t >= s.frames) continue;
    const k = t / s.frames;
    const amp = s.amp * (s.ramp === "in" ? k * k : (1 - k) * (1 - k));
    // Shake updates every frame but snaps to whole pixels (pixel art never sub-pixels).
    x += Math.round((random(`sx-${frame}`) * 2 - 1) * amp);
    y += Math.round((random(`sy-${frame}`) * 2 - 1) * amp);
  }
  return { x, y };
}
