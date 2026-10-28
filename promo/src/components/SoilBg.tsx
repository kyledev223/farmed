import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { C, hexA } from "../theme";
import { PixelImg } from "./PixelImg";

/**
 * Tiled soil texture, darkened, drifting slowly in 2px steps.
 * Tiles are <Img>s (not CSS background-image) so the renderer waits for them.
 */
export const SoilBg: React.FC<{
  dim?: number;
  tile?: number;
  glow?: string;
}> = ({ dim = 0.8, tile = 314, glow }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const drift = (Math.floor(frame / 3) * 2) % tile;
  const cols = Math.ceil(width / tile) + 1;
  const rows = Math.ceil(height / tile) + 1;
  return (
    <AbsoluteFill style={{ background: C.bg, overflow: "hidden" }}>
      <div
        style={{
          position: "absolute",
          left: -drift,
          top: drift - tile,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${tile}px)`,
          gridAutoRows: tile,
        }}
      >
        {Array.from({ length: cols * (rows + 1) }, (_, i) => (
          <PixelImg
            key={i}
            src="bg-soil.png"
            style={{ width: tile, height: tile }}
          />
        ))}
      </div>
      <AbsoluteFill style={{ background: hexA(C.bg, dim) }} />
      {glow && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse at center, ${hexA(glow, 0.16)} 0%, transparent 60%)`,
          }}
        />
      )}
    </AbsoluteFill>
  );
};
