import type { CSSProperties } from "react";
import { Img, staticFile } from "remotion";

/** <Img> for pixel art: nearest-neighbour scaling, never smoothed. */
export const PixelImg: React.FC<{ src: string; style?: CSSProperties; fit?: CSSProperties["objectFit"] }> = ({
  src,
  style,
  fit = "contain",
}) => (
  <Img
    src={staticFile(src)}
    style={{ display: "block", imageRendering: "pixelated", objectFit: fit, ...style }}
  />
);
