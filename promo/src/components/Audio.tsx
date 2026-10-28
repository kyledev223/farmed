import {
  Audio,
  getStaticFiles,
  interpolate,
  Sequence,
  staticFile,
} from "remotion";
import { DURATION, FPS, MUSIC, SFX, type SfxName } from "../timeline";

/** Names of everything in public/ (forward slashes), read once per bundle. */
let cache: Set<string> | null = null;
export function publicFiles() {
  if (!cache)
    cache = new Set(getStaticFiles().map((f) => f.name.replace(/\\/g, "/")));
  return cache;
}
export const hasPublicFile = (name: string) => publicFiles().has(name);

export const Music: React.FC = () => {
  if (!hasPublicFile(MUSIC.src)) return null;
  return (
    <Audio
      src={staticFile(MUSIC.src)}
      trimBefore={Math.round(MUSIC.startSeconds * FPS)}
      volume={(f) =>
        MUSIC.volume *
        interpolate(
          f,
          [0, MUSIC.fadeIn, DURATION - MUSIC.fadeOut, DURATION],
          [0, 1, 1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        )
      }
    />
  );
};

/** One optional sound effect. Renders nothing if public/sfx/<name>.mp3 is missing. */
export const Sfx: React.FC<{ name: SfxName; at: number; volume?: number }> = ({
  name,
  at,
  volume = 1,
}) => {
  const file = `sfx/${name}.mp3`;
  if (!hasPublicFile(file)) return null;
  return (
    <Sequence
      from={at}
      durationInFrames={FPS * 3}
      layout="none"
      name={`sfx:${name}`}
    >
      <Audio src={staticFile(file)} volume={volume} />
    </Sequence>
  );
};

/** Every cue from timeline.SFX. */
export const SfxTrack: React.FC = () => (
  <>
    {SFX.map((c, i) => (
      <Sfx key={i} name={c.name} at={c.at} volume={c.volume} />
    ))}
  </>
);
