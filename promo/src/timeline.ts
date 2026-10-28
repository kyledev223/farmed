/**
 * ALL TIMINGS LIVE HERE. Frames at 30fps, music at 120 BPM.
 * Scene cues are relative to the scene's own start; SHAKES and SFX are absolute.
 */

export const FPS = 30;
export const BPM = 120;
/** Frames per beat (0.5s). */
export const BEAT = (FPS * 60) / BPM; // 15
/** Frames per bar (4 beats, 2s). */
export const BAR = BEAT * 4; // 60
export const DURATION = 780;

export const beats = (n: number) => Math.round(n * BEAT);
export const bars = (n: number) => Math.round(n * BAR);

/* ------------------------------------------------------------------ */
/* Music                                                               */
/* ------------------------------------------------------------------ */

export const MUSIC = {
  /** Extracted from ../assets/*.mp4 by `npm run assets`. */
  src: "music.m4a",
  /**
   * Seconds into the recording that frame 0 plays. The beat grid in the recording
   * starts at 1.5s (exactly 120 BPM), there's a one-bar silent break at 25.5s and
   * the big drop at 27.5s. Starting at 23.5s puts: full groove under frames 0–60,
   * the break under 60–120, and the drop exactly on frame 120. Keep this on
   * 1.5 + n*2 (a bar line) so the cuts stay on the grid.
   */
  startSeconds: 23.5,
  volume: 0.9,
  fadeIn: 15,
  fadeOut: 20,
};

/* ------------------------------------------------------------------ */
/* Scenes                                                              */
/* ------------------------------------------------------------------ */

const ORDER = [
  ["hook", beats(8)],
  ["brand", beats(6)],
  ["how", beats(8)],
  ["roll", beats(10)],
  ["harvest", beats(8)],
  ["site", beats(8)],
  ["cta", beats(4)],
] as const;

export type SceneKey = (typeof ORDER)[number][0];

export const SCENES = ORDER.reduce(
  (acc, [key, duration], i) => {
    const prev = i === 0 ? undefined : acc[ORDER[i - 1][0]];
    acc[key] = { from: prev ? prev.from + prev.duration : 0, duration };
    return acc;
  },
  {} as Record<SceneKey, { from: number; duration: number }>,
);
export const SCENE_ORDER = ORDER.map(([key]) => key);

/* ------------------------------------------------------------------ */
/* Per-scene cues (relative frames)                                    */
/* ------------------------------------------------------------------ */

export const HOOK = {
  /** Typewriter start per line. Line 3 types as the music cuts out (frame 60). */
  lines: [0, beats(2), beats(4)],
  framesPerChar: 1,
  /** Candle chart: pumps, then crashes, hits bottom as line 2 finishes. */
  chartStart: 0,
  chartPeak: beats(1),
  chartEnd: beats(3.5),
  /** Rumble builds on line 3 into the drop at the scene cut. */
  rumbleStart: beats(7),
};

export const BRAND = {
  slam: 0,
  slamFrames: 4,
  subtext: beats(2),
  /** Hero zoom range over the whole scene. */
  zoomFrom: 1.06,
  zoomTo: 1.18,
};

export const HOW = {
  title: 0,
  cards: [beats(1), beats(2), beats(3)],
  /** Arrow i draws in the frames leading up to card i+1. */
  arrowFrames: 8,
  /** Sub-captions under the cards. */
  subs: beats(4),
};

export const ROLL = {
  spinStart: 0,
  land: beats(5),
  /**
   * After the fast spin, the reel ticks card-by-card with these gaps (frames),
   * the last tick landing exactly on `land`. Longer gaps = more suspense.
   */
  tickIntervals: [2, 3, 3, 4, 5, 6, 8],
  /** Cards the reel passes before landing. */
  spinCards: 40,
  grid: beats(7),
  gridStagger: 3,
};

export const HARVEST = {
  /** Countdown ticks 00:03 → 00:00, one per beat. */
  ticks: [0, beats(1), beats(2), beats(3)],
  coinsStart: beats(3),
  coinsEnd: beats(7),
  counterStart: beats(3) + 4,
  counterEnd: beats(6),
  caption: beats(4),
};

export const SITE = {
  /** Device glides across for the whole scene. */
  deviceIn: 0,
  deviceInFrames: 10,
  statsStart: beats(1),
  statsEnd: beats(4),
  chartStart: beats(2),
  chartEnd: beats(5),
  scrollStart: beats(4),
  scrollEnd: beats(5.5),
  hover: beats(6),
};

export const CTA = {
  icon: 0,
  wordmark: beats(1),
  url: beats(2),
  /** Final hit: the scene freezes on this frame (absolute 765) and holds. */
  freeze: beats(3),
};

/* ------------------------------------------------------------------ */
/* Absolute cues                                                       */
/* ------------------------------------------------------------------ */

export type Shake = { at: number; frames: number; amp: number; ramp?: "in" | "out" };

/** Screen shakes (absolute frames). `ramp: "in"` builds up, default decays. */
export const SHAKES: Shake[] = [
  { at: SCENES.hook.from + HOOK.rumbleStart, frames: SCENES.brand.from - (SCENES.hook.from + HOOK.rumbleStart), amp: 7, ramp: "in" },
  { at: SCENES.brand.from, frames: beats(1), amp: 30 },
  { at: SCENES.roll.from + ROLL.land, frames: 10, amp: 14 },
  { at: SCENES.harvest.from + HARVEST.coinsStart, frames: 8, amp: 10 },
  { at: SCENES.cta.from + CTA.freeze, frames: 6, amp: 16 },
];

export type SfxName = "coin" | "whoosh" | "burn" | "reveal";
export type SfxCue = { name: SfxName; at: number; volume?: number };

const coinTicks = Array.from({ length: 7 }, (_, i) => SCENES.harvest.from + HARVEST.counterStart + i * 6);

/** Optional SFX — each one is skipped if public/sfx/<name>.mp3 doesn't exist. */
export const SFX: SfxCue[] = [
  { name: "burn", at: SCENES.brand.from, volume: 0.6 },
  { name: "whoosh", at: SCENES.how.from },
  { name: "burn", at: SCENES.how.from + HOW.cards[1] },
  { name: "whoosh", at: SCENES.roll.from },
  { name: "reveal", at: SCENES.roll.from + ROLL.land },
  ...coinTicks.map((at) => ({ name: "coin" as const, at, volume: 0.5 })),
  { name: "whoosh", at: SCENES.site.from },
  { name: "reveal", at: SCENES.cta.from + CTA.freeze },
];
