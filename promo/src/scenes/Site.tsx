import {
  AbsoluteFill,
  Easing,
  interpolate,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { publicFiles } from "../components/Audio";
import { BrowserFrame, PhoneFrame } from "../components/Devices";
import { PixelText } from "../components/PixelText";
import { SiteMock } from "../components/SiteMock";
import { SoilBg } from "../components/SoilBg";
import { COPY } from "../copy";
import { pop, stepped } from "../lib/anim";
import { useLayout } from "../lib/layout";
import { C, FONT } from "../theme";
import { SCENES, SITE } from "../timeline";

/** Picks a screen recording from public/screens/, preferring one that matches the format. */
function findScreen(vertical: boolean) {
  const all = [...publicFiles()].filter((f) =>
    /^screens\/.+\.(mp4|webm|mov)$/i.test(f),
  );
  const want = vertical ? /mobile|phone|vertical|9x16/i : /desktop|wide|16x9/i;
  return all.find((f) => want.test(f)) ?? all[0];
}

export const Site: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height, vertical, padX, pick } = useLayout();
  const screen = findScreen(vertical);

  const dev = pick(
    { w: 1560, h: 820, top: 160 },
    { w: 780, h: 1400, top: 290 },
  );
  // Snap in from off-screen (stepped), then a slow continuous glide across.
  const enter = interpolate(
    frame,
    [SITE.deviceIn, SITE.deviceIn + SITE.deviceInFrames],
    [1, 0],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: stepped(5, Easing.out(Easing.cubic)),
    },
  );
  const glide = interpolate(
    frame,
    [0, SCENES.site.duration],
    pick([110, -110], [60, -60]),
  );
  const x = (width - dev.w) / 2 + glide + (vertical ? 0 : enter * width);
  const y = dev.top + (vertical ? enter * height : 0);
  const cap = pop(frame, 0);

  // Inner viewport of the device (minus bezel / browser chrome; phone loses a status bar to the notch).
  const statusBar = vertical ? 46 : 0;
  const innerW = vertical ? dev.w - Math.round(dev.w * 0.04) * 2 : dev.w - 8;
  const innerH = vertical
    ? dev.h - Math.round(dev.w * 0.04) * 2 - statusBar
    : dev.h - 8 - 68;
  const zoom = vertical ? 1 : SITE.desktopZoom;
  const content = screen ? (
    <OffthreadVideo
      src={staticFile(screen)}
      muted
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  ) : (
    <div style={{ paddingTop: statusBar, background: C.bg }}>
      <div style={{ width: innerW, height: innerH, overflow: "hidden" }}>
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "0 0" }}>
          <SiteMock w={innerW / zoom} h={innerH / zoom} mobile={vertical} />
        </div>
      </div>
    </div>
  );

  return (
    <AbsoluteFill>
      <SoilBg dim={0.86} glow={C.neon} />
      <div
        style={{
          position: "absolute",
          top: pick(52, 170),
          left: padX,
          right: padX,
          display: "flex",
          justifyContent: "center",
          transform: `scale(${cap.scale})`,
          opacity: cap.opacity,
        }}
      >
        <PixelText
          text={COPY.site.caption}
          maxWidth={width - padX * 2}
          maxFont={pick(48, 52)}
          maxLines={1}
          color={C.gold}
        />
      </div>

      <div style={{ position: "absolute", left: x, top: y }}>
        {vertical ? (
          <PhoneFrame width={dev.w} height={dev.h}>
            {content}
          </PhoneFrame>
        ) : (
          <BrowserFrame width={dev.w} height={dev.h} url={COPY.site.url}>
            {content}
          </BrowserFrame>
        )}
      </div>

      {COPY.disclaimer && (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: dev.top + dev.h + pick(24, 34),
            textAlign: "center",
            fontFamily: FONT.mono,
            fontSize: pick(22, 28),
            color: C.muted,
          }}
        >
          {COPY.disclaimer}
        </div>
      )}
    </AbsoluteFill>
  );
};
