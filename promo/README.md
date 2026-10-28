# FARMED promo (Remotion)

26-second promo, 30fps / 780 frames, in two formats rendered from the same scenes:

| Composition  | Size      | Output                |
| ------------ | --------- | --------------------- |
| `Promo-16x9` | 1920×1080 | `out/farmed-16x9.mp4` |
| `Promo-9x16` | 1080×1920 | `out/farmed-9x16.mp4` |

```bash
npm install
npm run assets           # copy art from ../public, extract music from ../assets
npm run dev              # Remotion Studio
npm run render:wide      # H.264, CRF 18
npm run render:vertical
npm run render           # both
```

## Where to tweak things

| File               | What's in it                                                                    |
| ------------------ | ------------------------------------------------------------------------------- |
| `src/copy.ts`      | Every word on screen, the odds, the payout, the dashboard numbers, the disclaimer |
| `src/timeline.ts`  | `BEAT`/`BAR`, scene lengths, every cue, screen shakes, SFX cues, music offset   |
| `src/theme.ts`     | Colours, tier colours, fonts                                                    |
| `src/scenes/*`     | One component per scene, reflowing on `useLayout().vertical`                    |
| `src/components/*` | `PixelCard`, `Counter`, `Typewriter`, `CoinRain`, `SlotReel`, `Scanlines`, …    |

Scene cues are in frames relative to the scene start and written as `beats(n)`, so they stay on the
grid when you change them. Pixel-font text is auto-fitted (`src/lib/text.ts`): it wraps on words and
shrinks until it fits the box, so editing copy can't push text off-frame.

## Music

`npm run assets` pulls the audio track out of the first video/audio file in `../assets` into
`public/music.m4a`; the 500MB screen recording itself never enters the bundle.

The recording is exactly 120 BPM with the beat grid starting at 1.5s. It has a one-bar silent break at
25.5s and the big drop at 27.5s, so `MUSIC.startSeconds = 23.5`: one bar of groove, the break under
"YOU GOT FARMED.", and the drop exactly on frame 120. Keep the offset on a bar line (1.5 + 2n) if you change it.

## Optional extras

- **SFX:** drop `coin.mp3`, `whoosh.mp3`, `burn.mp3`, `reveal.mp3` in `public/sfx/` (or in the site's
  `public/sfx/` and re-run `npm run assets`). Missing files are skipped. Cues are in `timeline.ts → SFX`.
- **Screen recordings:** any `public/screens/*.mp4` replaces the rebuilt dashboard in scene 6. Names
  containing `mobile`/`phone`/`9x16` are used for vertical, `desktop`/`wide`/`16x9` for wide.
