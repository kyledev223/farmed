import { AbsoluteFill, random, useCurrentFrame, useVideoConfig } from "remotion";

/** CRT overlay on every frame: scanlines, a slow rolling band, flicker and a vignette. */
export const Scanlines: React.FC = () => {
  const frame = useCurrentFrame();
  const { height } = useVideoConfig();
  // Scanline pitch scales with output height so it reads the same in both formats.
  const pitch = Math.max(3, Math.round(height / 360));
  const flicker = 0.85 + Math.floor(random(`flicker-${Math.floor(frame / 2)}`) * 3) * 0.075;
  const bandY = ((frame * 6) % (height + 400)) - 200;

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          opacity: flicker,
          backgroundImage: `repeating-linear-gradient(to bottom, rgba(0,0,0,0.26) 0px, rgba(0,0,0,0.26) ${Math.ceil(pitch / 2)}px, transparent ${Math.ceil(pitch / 2)}px, transparent ${pitch}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: bandY,
          height: 200,
          background: "linear-gradient(to bottom, transparent, rgba(232,237,233,0.035), transparent)",
        }}
      />
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at center, transparent 58%, rgba(0,0,0,0.55) 100%)" }}
      />
    </AbsoluteFill>
  );
};
