import type { CSSProperties } from "react";
import type { IconName } from "../copy";
import { PixelImg } from "./PixelImg";

/** The icon PNGs keep their art in roughly the middle 55%; this crops that padding away. */
const ART = 0.55;

/** Icon from public/icons sized by its visible art, not its padded canvas. */
export const PixelIcon: React.FC<{
  name: IconName;
  size: number;
  style?: CSSProperties;
}> = ({ name, size, style }) => {
  const canvas = Math.round(size / ART);
  const off = Math.round((size - canvas) / 2);
  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        flexShrink: 0,
        ...style,
      }}
    >
      <PixelImg
        src={`icons/${name}.png`}
        style={{
          position: "absolute",
          left: off,
          top: off,
          width: canvas,
          height: canvas,
        }}
      />
    </div>
  );
};
