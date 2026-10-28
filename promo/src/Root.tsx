import { Composition } from "remotion";
import { Promo } from "./Promo";
import { DURATION, FPS } from "./timeline";

export { BAR, BEAT } from "./timeline";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="Promo-16x9"
      component={Promo}
      durationInFrames={DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition
      id="Promo-9x16"
      component={Promo}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </>
);
