import { AbsoluteFill, Freeze, useCurrentFrame } from "remotion";
import { ParticleBurst } from "../components/ParticleBurst";
import { PixelImg } from "../components/PixelImg";
import { PixelText } from "../components/PixelText";
import { SoilBg } from "../components/SoilBg";
import { COPY } from "../copy";
import { beatPulse, pop, slam } from "../lib/anim";
import { useLayout } from "../lib/layout";
import { C, FONT, hexA } from "../theme";
import { CTA } from "../timeline";

/** End card. On the final beat everything hits once, then the frame freezes and holds. */
export const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, pick } = useLayout();
  const flash = [0.7, 0.4, 0.15][frame - CTA.freeze] ?? 0;
  return (
    <AbsoluteFill>
      <Freeze frame={CTA.freeze} active={frame > CTA.freeze}>
        <CtaCard />
      </Freeze>
      {/* The hit plays over the held frame, so the hold itself stays clean. */}
      <ParticleBurst
        at={CTA.freeze}
        x={width / 2}
        y={height / 2}
        count={80}
        colors={[C.neon, C.gold]}
        speed={pick(70, 64)}
        size={14}
        life={12}
        gravity={0.8}
        seed="cta"
      />
      {flash > 0 && (
        <AbsoluteFill style={{ background: C.text, opacity: flash }} />
      )}
    </AbsoluteFill>
  );
};

const CtaCard: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, padX, pick } = useLayout();
  const icon = pop(frame, CTA.icon, 6);
  const wm = slam(frame, CTA.wordmark, 4, 2.4);
  const url = pop(frame, CTA.url);
  const chain = pop(frame, CTA.url + 3);
  const pulse = frame >= CTA.freeze ? 1 : beatPulse(frame);
  const maxW = width - padX * 2;

  return (
    <AbsoluteFill>
      <SoilBg dim={0.85} glow={C.neon} />
      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: pick(8, 30),
        }}
      >
        <div
          style={{
            width: pick(230, 300),
            transform: `scale(${icon.scale})`,
            opacity: icon.opacity,
            filter: "drop-shadow(8px 8px 0 #000)",
          }}
        >
          <PixelImg
            src="logo-icon.png"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
        {/* The wordmark PNG has ~20% empty space top and bottom, so pull neighbours in. */}
        <div
          style={{
            width: Math.min(maxW, pick(980, 920)),
            margin: pick("-64px 0 -74px", "-60px 0 -70px"),
            transform: `scale(${wm.scale})`,
            opacity: wm.opacity,
            filter: `drop-shadow(0 0 ${Math.round(10 + 26 * pulse)}px ${hexA(C.neon, 0.3 + 0.5 * pulse)}) drop-shadow(8px 8px 0 #000)`,
          }}
        >
          <PixelImg
            src="logo-wordmark.png"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
        <div
          style={{
            opacity: url.opacity,
            transform: `scale(${url.scale})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: pick(20, 34),
          }}
        >
          <PixelText
            text={COPY.cta.tagline}
            maxWidth={maxW}
            maxFont={pick(32, 38)}
            color={C.text}
            lineHeight={1.5}
          />
          <PixelText
            text={COPY.cta.url}
            maxWidth={maxW}
            maxFont={pick(84, 96)}
            maxLines={1}
            color={C.neon}
          />
        </div>
        <div
          style={{
            opacity: chain.opacity,
            transform: `scale(${chain.scale})`,
            marginTop: pick(4, 6),
          }}
        >
          <PixelText
            text={COPY.cta.chain}
            maxWidth={maxW}
            maxFont={pick(40, 46)}
            maxLines={1}
            color={C.gold}
          />
        </div>
      </AbsoluteFill>

      {COPY.disclaimer && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: pick(36, 150),
            textAlign: "center",
            fontFamily: FONT.mono,
            fontSize: pick(20, 26),
            color: C.muted,
          }}
        >
          {COPY.disclaimer}
        </div>
      )}
    </AbsoluteFill>
  );
};
