import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { ParticleBurst } from "../components/ParticleBurst";
import { PixelCard } from "../components/PixelCard";
import { PixelImg } from "../components/PixelImg";
import { PixelText } from "../components/PixelText";
import { SlotReel } from "../components/SlotReel";
import { SoilBg } from "../components/SoilBg";
import { TierBadge } from "../components/TierBadge";
import { COPY, type SeriesKey } from "../copy";
import { pop, slam } from "../lib/anim";
import { useLayout } from "../lib/layout";
import { C, FONT, TIER } from "../theme";
import { ROLL } from "../timeline";

const SERIES: SeriesKey[] = ["jeeter", "paperhand", "bagholder", "whale"];
const ALL = SERIES.flatMap((s) => [1, 2, 3].map((n) => `${s}-${n}`));
const tierOf = (id: string) => TIER[id.split("-")[0] as SeriesKey];

/** Deterministic reel strip ending on the result, never repeating a card back-to-back. */
const STRIP = (() => {
  const pool = ALL.filter((id) => id !== COPY.roll.resultId);
  const out: string[] = [];
  for (let i = 0; i < ROLL.spinCards - 1; i++) {
    let id = pool[Math.floor(random(`reel-${i}`) * pool.length)];
    if (id === out[out.length - 1]) id = pool[(pool.indexOf(id) + 1) % pool.length];
    out.push(id);
  }
  return [...out, COPY.roll.resultId];
})();

export const Roll: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, vertical, padX, padY, pick } = useLayout();
  const landed = frame >= ROLL.land;
  const result = tierOf(COPY.roll.resultId);

  if (frame >= ROLL.grid) return <OddsGrid />;

  const cardSize = pick(470, 620);
  const dots = ".".repeat(1 + (Math.floor(frame / 5) % 3));
  const name = slam(frame, ROLL.land, 4, 2.2);
  const odds = pop(frame, ROLL.land + 4);
  const badge = pop(frame, ROLL.land);
  const textW = vertical ? width - padX * 2 : 760;
  const goldFlash = frame >= ROLL.land && frame < ROLL.land + 3 ? [0.6, 0.35, 0.15][frame - ROLL.land] : 0;

  const reel = <SlotReel ids={STRIP} start={ROLL.spinStart} land={ROLL.land} ticks={ROLL.tickIntervals} cardSize={cardSize} tierColor={(id) => tierOf(id).hex} />;

  const resultText = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: vertical ? "center" : "flex-start", gap: pick(28, 30) }}>
      <div style={{ transform: `scale(${name.scale})`, opacity: name.opacity, transformOrigin: vertical ? "center" : "left center" }}>
        <PixelText text={COPY.roll.resultName} maxWidth={textW} maxFont={pick(76, 88)} maxLines={2} color={C.gold} align={vertical ? "center" : "left"} />
      </div>
      <div style={{ transform: `scale(${odds.scale})`, opacity: odds.opacity, transformOrigin: vertical ? "center" : "left center" }}>
        <PixelText text={`— ${COPY.roll.resultOdds}`} maxWidth={textW} maxFont={pick(44, 52)} maxLines={1} color={C.neon} align={vertical ? "center" : "left"} />
      </div>
    </div>
  );

  const header = landed ? (
    <div style={{ transform: `scale(${badge.scale})` }}>
      <TierBadge label={COPY.roll.resultTier} color={result.hex} size={pick(34, 44)} />
    </div>
  ) : (
    <div style={{ fontFamily: FONT.pixel, fontSize: pick(56, 68), color: C.text, textShadow: "5px 5px 0 #000", whiteSpace: "pre" }}>
      {COPY.roll.title.replace(/\.+$/, "")}
      <span style={{ color: C.neon }}>{dots.padEnd(3, " ")}</span>
    </div>
  );

  return (
    <AbsoluteFill>
      <SoilBg dim={0.86} glow={landed ? C.gold : C.neon} />
      {vertical ? (
        <AbsoluteFill style={{ alignItems: "center", justifyContent: "space-between", padding: `${padY - 40}px ${padX}px ${padY + 40}px` }}>
          <div style={{ height: 110, display: "flex", alignItems: "center" }}>{header}</div>
          {reel}
          <div style={{ height: 300, display: "flex", alignItems: "center" }}>{landed && resultText}</div>
        </AbsoluteFill>
      ) : (
        <AbsoluteFill style={{ flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 110 }}>
          {reel}
          <div style={{ width: textW, display: "flex", flexDirection: "column", gap: 44 }}>
            <div style={{ height: 100, display: "flex", alignItems: "center" }}>{header}</div>
            <div style={{ height: 280 }}>{landed ? resultText : <RollingHint />}</div>
          </div>
        </AbsoluteFill>
      )}
      <ParticleBurst
        at={ROLL.land}
        x={vertical ? width / 2 : (width - (cardSize + 74 + 110 + textW)) / 2 + (cardSize + 74) / 2}
        y={vertical ? height / 2 - 20 : height / 2}
        count={70}
        colors={[C.gold, C.gold, "#FFE08A", C.neon]}
        speed={pick(34, 40)}
        size={pick(12, 14)}
        life={32}
      />
      {goldFlash > 0 && <AbsoluteFill style={{ background: C.gold, opacity: goldFlash, mixBlendMode: "screen" }} />}
    </AbsoluteFill>
  );
};

const RollingHint: React.FC = () => (
  <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: 34, color: C.muted, lineHeight: 1.5 }}>
    100,000 $FARMED burned.
    <br />
    Rolling the barn door...
  </div>
);

/** Quick 2×2 flash of the four series with their tier colours. */
const OddsGrid: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, vertical, padX, padY, pick } = useLayout();
  const gap = 40;
  const cellW = pick(Math.min(780, (width - padX * 2 - gap) / 2), (width - padX * 2 - gap) / 2);
  const cellH = pick(Math.min(400, (height - padY * 2 - gap) / 2), 640);
  const img = pick(cellH - 70, cellW - 60);

  return (
    <AbsoluteFill>
      <SoilBg dim={0.86} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ display: "grid", gridTemplateColumns: `${cellW}px ${cellW}px`, gap }}>
          {COPY.roll.series.map((s, i) => {
            const tier = TIER[s.key];
            const p = pop(frame, ROLL.grid + i * ROLL.gridStagger, 4);
            const textW = vertical ? cellW - 40 : cellW - img - 90;
            return (
              <div key={s.key} style={{ transform: `scale(${p.scale})`, opacity: p.opacity }}>
                <PixelCard accent={tier.hex} glowAmount={0.7} accentGlow={tier.hex} border={3} style={{ width: cellW, height: cellH }}>
                  <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", alignItems: "center", gap: pick(30, 18), padding: pick("22px 30px", "24px 20px") }}>
                    <div style={{ width: img, height: img, flexShrink: 0, border: `3px solid ${tier.hex}`, background: C.bg }}>
                      <PixelImg src={`farms/${s.key}-2.png`} fit="cover" style={{ width: "100%", height: "100%" }} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: vertical ? "center" : "flex-start", gap: pick(18, 14) }}>
                      <PixelText text={s.label} maxWidth={textW} maxFont={pick(40, 40)} maxLines={1} color={tier.hex} align={vertical ? "center" : "left"} />
                      <PixelText text={s.odds} maxWidth={textW} maxFont={pick(84, 72)} maxLines={1} color={C.text} align={vertical ? "center" : "left"} />
                      <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: pick(26, 28), color: C.muted }}>{tier.label}</div>
                    </div>
                  </div>
                </PixelCard>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
