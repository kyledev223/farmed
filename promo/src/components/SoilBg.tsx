import { AbsoluteFill, staticFile, useCurrentFrame } from "remotion";
import { C, hexA } from "../theme";

/** Tiled soil texture, darkened, drifting slowly in 2px steps. */
export const SoilBg: React.FC<{ dim?: number; tile?: number; glow?: string }> = ({ dim = 0.8, tile = 314, glow }) => {
  const frame = useCurrentFrame();
  const drift = Math.floor(frame / 3) * 2;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          backgroundImage: `url(${staticFile("bg-soil.png")})`,
          backgroundSize: `${tile}px ${tile}px`,
          backgroundPosition: `${-drift}px ${drift}px`,
          imageRendering: "pixelated",
        }}
      />
      <AbsoluteFill style={{ background: hexA(C.bg, dim) }} />
      {glow && <AbsoluteFill style={{ background: `radial-gradient(ellipse at center, ${hexA(glow, 0.16)} 0%, transparent 60%)` }} />}
    </AbsoluteFill>
  );
};
