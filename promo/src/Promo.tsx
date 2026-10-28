import {
  AbsoluteFill,
  Series,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { Music, SfxTrack } from "./components/Audio";
import { Scanlines } from "./components/Scanlines";
import { shakeAt } from "./lib/anim";
import { Brand } from "./scenes/Brand";
import { Cta } from "./scenes/Cta";
import { Harvest } from "./scenes/Harvest";
import { Hook } from "./scenes/Hook";
import { HowItWorks } from "./scenes/HowItWorks";
import { Roll } from "./scenes/Roll";
import { Site } from "./scenes/Site";
import { C } from "./theme";
import { SCENE_ORDER, SCENES, type SceneKey } from "./timeline";

const SCENE_COMPONENTS: Record<SceneKey, React.FC> = {
  hook: Hook,
  brand: Brand,
  how: HowItWorks,
  roll: Roll,
  harvest: Harvest,
  site: Site,
  cta: Cta,
};

/** Shared by both compositions; every scene reflows from useVideoConfig(). */
export const Promo: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const shake = shakeAt(frame);
  // Overscan while shaking so the frame edge never shows.
  const overscan =
    1 +
    (2 * Math.max(Math.abs(shake.x), Math.abs(shake.y))) /
      Math.min(width, height);

  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <AbsoluteFill
        style={{
          transform: `translate(${shake.x}px, ${shake.y}px) scale(${overscan})`,
        }}
      >
        <Series>
          {SCENE_ORDER.map((key) => {
            const Scene = SCENE_COMPONENTS[key];
            return (
              <Series.Sequence
                key={key}
                durationInFrames={SCENES[key].duration}
                name={key}
              >
                <Scene />
              </Series.Sequence>
            );
          })}
        </Series>
      </AbsoluteFill>
      <Scanlines />
      <Music />
      <SfxTrack />
    </AbsoluteFill>
  );
};
