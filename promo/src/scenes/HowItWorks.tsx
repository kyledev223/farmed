import { Fragment } from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { PixelArrow } from "../components/PixelArrow";
import { PixelCard } from "../components/PixelCard";
import { PixelImg } from "../components/PixelImg";
import { PixelText } from "../components/PixelText";
import { SoilBg } from "../components/SoilBg";
import { COPY } from "../copy";
import { pop } from "../lib/anim";
import { useLayout } from "../lib/layout";
import { C, FONT } from "../theme";
import { BEAT, HOW } from "../timeline";

export const HowItWorks: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, vertical, padX, pick } = useLayout();
  const steps = COPY.how.steps;

  // After all three cards are in, light them up one per beat, then all at once.
  const litIndex = Math.floor((frame - HOW.subs) / BEAT);
  const isLit = (i: number) => frame >= HOW.subs && (litIndex === i || litIndex >= steps.length);

  const cardW = pick(440, width - padX * 2);
  const cardH = pick(470, 300);
  const iconSize = pick(200, 210);
  const arrowLen = pick(110, 84);
  const title = pop(frame, HOW.title);

  return (
    <AbsoluteFill>
      <SoilBg dim={0.82} glow={C.neon} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: pick(56, 80) }}>
        <div style={{ transform: `scale(${title.scale})`, opacity: title.opacity }}>
          <PixelText text={COPY.how.title} maxWidth={width - padX * 2} maxFont={pick(56, 72)} color={C.gold} />
        </div>

        <div style={{ display: "flex", flexDirection: vertical ? "column" : "row", alignItems: "center", gap: pick(22, 18) }}>
          {steps.map((s, i) => {
            const p = pop(frame, HOW.cards[i]);
            const lit = isLit(i);
            const accent = i === steps.length - 1 && litIndex >= steps.length ? C.gold : C.neon;
            const subStart = HOW.subs + i * BEAT;
            const subChars = Math.max(0, Math.floor((frame - subStart) * 1.5));
            // Stepped 2-frame bob on every beat; the flame flickers instead.
            const bob = (frame % BEAT) < 3 ? -6 : 0;
            const flicker = s.icon === "flame" ? [1, 1.06, 0.97][Math.floor(frame / 3) % 3] : 1;
            const textW = vertical ? cardW - iconSize - 120 : cardW - 60;
            return (
              <Fragment key={i}>
                {i > 0 && (
                  <PixelArrow
                    start={HOW.cards[i] - HOW.arrowFrames}
                    frames={HOW.arrowFrames}
                    length={arrowLen}
                    direction={vertical ? "down" : "right"}
                    block={pick(14, 14)}
                    color={frame >= HOW.cards[i] ? C.neon : C.muted}
                  />
                )}
                <div style={{ transform: `scale(${p.scale})`, opacity: p.opacity }}>
                  <PixelCard accent={lit ? accent : C.border} glowAmount={lit ? 1 : 0} border={3} style={{ width: cardW, height: cardH }}>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: vertical ? "row" : "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: pick(18, 36),
                        height: cardH - 9,
                        padding: pick("0 30px", "0 44px"),
                      }}
                    >
                      <div style={{ position: "relative", width: iconSize, height: iconSize, flexShrink: 0, transform: `translateY(${bob}px) scale(${flicker})` }}>
                        <div style={{ position: "absolute", left: 6, top: 6, fontFamily: FONT.pixel, fontSize: 22, color: C.muted }}>{i + 1}</div>
                        <PixelImg src={`icons/${s.icon}.png`} style={{ width: "100%", height: "100%" }} />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: vertical ? "flex-start" : "center", gap: 18 }}>
                        <PixelText text={s.title} maxWidth={textW} maxFont={pick(36, 48)} maxLines={1} color={lit ? accent : C.text} align={vertical ? "left" : "center"} />
                        <div style={{ fontFamily: FONT.mono, fontWeight: 700, fontSize: pick(30, 36), color: C.muted, whiteSpace: "pre" }}>
                          {s.sub.slice(0, subChars)}
                          <span style={{ visibility: "hidden" }}>{s.sub.slice(subChars) || " "}</span>
                        </div>
                      </div>
                    </div>
                  </PixelCard>
                </div>
              </Fragment>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
