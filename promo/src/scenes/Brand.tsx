import { AbsoluteFill, interpolate, random, useCurrentFrame } from "remotion";
import { PixelImg } from "../components/PixelImg";
import { Typewriter } from "../components/Typewriter";
import { COPY } from "../copy";
import { beatPulse, slam } from "../lib/anim";
import { useLayout } from "../lib/layout";
import { C, hexA } from "../theme";
import { BRAND, SCENES } from "../timeline";

const D = SCENES.brand.duration;

export const Brand: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, padX, pick } = useLayout();

  // Background layer: slow zoom + drift. Foreground motes move faster → parallax.
  const zoom = interpolate(frame, [0, D], [BRAND.zoomFrom, BRAND.zoomTo]);
  const panX = interpolate(frame, [0, D], [24, -36]);
  const wm = slam(frame, BRAND.slam, BRAND.slamFrames, 2.8);
  const pulse = beatPulse(frame);
  const wmW = Math.min(width - padX * 2, pick(1180, 940));
  const flash = [0.9, 0.55, 0.25][frame] ?? 0;

  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <AbsoluteFill
        style={{ transform: `translateX(${panX}px) scale(${zoom})` }}
      >
        <PixelImg
          src="hero.png"
          fit="cover"
          style={{
            width: "100%",
            height: "100%",
            objectPosition: pick("50% 50%", "72% 50%"),
          }}
        />
      </AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `linear-gradient(to bottom, ${hexA(C.bg, 0.55)} 0%, ${hexA(C.bg, 0.2)} 35%, ${hexA(C.bg, 0.35)} 60%, ${hexA(C.bg, 0.9)} 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% ${pick(42, 40)}%, ${hexA(C.bg, 0.7)} 0%, transparent 55%)`,
        }}
      />

      {/* parallax motes */}
      {Array.from({ length: 26 }, (_, i) => {
        const r = (k: string) => random(`mote-${i}-${k}`);
        const s = r("s") > 0.6 ? 8 : 4;
        const x =
          (r("x") * (width + 200) - frame * (2 + r("v") * 4)) % (width + 200);
        const y = r("y") * height - frame * (0.6 + r("u"));
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: Math.round((x < 0 ? x + width + 200 : x) / 4) * 4 - 100,
              top: Math.round(y / 4) * 4,
              width: s,
              height: s,
              background: r("c") > 0.5 ? C.gold : C.neon,
              opacity: 0.5 + 0.5 * ((Math.floor(frame / 4) + i) % 2),
            }}
          />
        );
      })}

      <AbsoluteFill
        style={{
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: pick(10, 40),
          paddingBottom: pick(40, 160),
        }}
      >
        <div
          style={{
            width: wmW,
            opacity: wm.opacity,
            transform: `scale(${wm.scale * (1 + 0.025 * pulse)})`,
            filter: `drop-shadow(0 0 ${Math.round(8 + 30 * pulse)}px ${hexA(C.neon, 0.35 + 0.5 * pulse)}) drop-shadow(10px 10px 0 #000)`,
          }}
        >
          <PixelImg
            src="logo-wordmark.png"
            style={{ width: "100%", height: "auto" }}
          />
        </div>
        {/* Subtitle bar keeps the line legible over the busy hero; the negative margin eats the wordmark PNG's bottom padding. */}
        <div
          style={{
            marginTop: pick(-90, -70),
            padding: pick("20px 32px", "24px 28px"),
            background:
              frame >= BRAND.subtext ? "rgba(0,0,0,0.72)" : "transparent",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Typewriter
            text={COPY.brand.subtext}
            start={BRAND.subtext}
            maxWidth={width - padX * 2 - 64}
            maxFont={pick(46, 60)}
            maxLines={2}
            color={C.gold}
            cursorColor={C.neon}
            align="center"
          />
        </div>
      </AbsoluteFill>

      {flash > 0 && (
        <AbsoluteFill style={{ background: C.text, opacity: flash }} />
      )}
    </AbsoluteFill>
  );
};
