import { AbsoluteFill, useCurrentFrame } from "remotion";
import { CoinRain } from "../components/CoinRain";
import { Counter } from "../components/Counter";
import { ParticleBurst } from "../components/ParticleBurst";
import { PixelCard } from "../components/PixelCard";
import { PixelIcon } from "../components/PixelIcon";
import { PixelText } from "../components/PixelText";
import { SoilBg } from "../components/SoilBg";
import { COPY } from "../copy";
import { pop } from "../lib/anim";
import { useLayout } from "../lib/layout";
import { C, FONT } from "../theme";
import { HARVEST } from "../timeline";

export const Harvest: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, padX, pick } = useLayout();

  // Geometry (absolute px) — the coins need a real target point.
  // Wide: countdown left, wallet right, caption across the bottom. Vertical: stacked.
  const card = pick(
    { x: padX, y: 210, w: 780, h: 420 },
    { x: padX, y: 200, w: width - padX * 2, h: 400 },
  );
  const wallet = pick(
    { cx: 1400, cy: 380, size: 280 },
    { cx: width / 2, cy: 880, size: 320 },
  );
  const counterY = wallet.cy + wallet.size / 2 + pick(50, 60);
  const caption = pick(
    { x: padX, y: 840, w: width - padX * 2 },
    { x: padX, y: counterY + 190, w: width - padX * 2 },
  );

  const ticked = HARVEST.ticks.filter((t) => frame >= t).length;
  const value = Math.max(0, COPY.harvest.countFrom - (ticked - 1));
  const lastTick = HARVEST.ticks[Math.max(0, ticked - 1)];
  const tickPop = [1.18, 1.1, 1.04][frame - lastTick] ?? 1;
  const harvesting = frame >= HARVEST.coinsStart;
  const blinkOn = Math.floor(frame / 3) % 2 === 0;
  const digitColor = harvesting ? (blinkOn ? C.gold : C.neon) : C.text;

  const walletBump =
    harvesting && frame < HARVEST.coinsEnd
      ? [1, 1.06][Math.floor(frame / 2) % 2]
      : 1;
  const counter = pop(frame, HARVEST.counterStart);
  const cap = pop(frame, HARVEST.caption);

  return (
    <AbsoluteFill>
      <SoilBg dim={0.84} glow={harvesting ? C.gold : undefined} />

      {/* countdown card */}
      <div style={{ position: "absolute", left: card.x, top: card.y }}>
        <PixelCard
          accent={harvesting ? C.gold : C.neon}
          glowAmount={harvesting ? 1 : 0.4}
          border={3}
          style={{ width: card.w, height: card.h }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 26,
              height: card.h - 9,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <PixelIcon name="clock" size={pick(60, 68)} />
              <PixelText
                text={harvesting ? COPY.harvest.ready : COPY.harvest.title}
                maxWidth={card.w - 180}
                maxFont={pick(38, 46)}
                maxLines={1}
                color={harvesting ? C.gold : C.muted}
                align="left"
              />
            </div>
            <div
              style={{
                fontFamily: FONT.pixel,
                fontSize: pick(124, 140),
                color: digitColor,
                textShadow: "8px 8px 0 #000",
                transform: `scale(${tickPop})`,
              }}
            >
              00:{String(value).padStart(2, "0")}
            </div>
          </div>
        </PixelCard>
      </div>

      {/* caption */}
      <div
        style={{
          position: "absolute",
          left: caption.x,
          top: caption.y,
          width: caption.w,
          opacity: cap.opacity,
          transform: `scale(${cap.scale})`,
        }}
      >
        <PixelText
          text={COPY.harvest.caption}
          maxWidth={caption.w}
          maxFont={pick(52, 54)}
          maxLines={2}
          color={C.text}
          lineHeight={1.5}
        />
      </div>

      {/* wallet + counter */}
      <div
        style={{
          position: "absolute",
          left: wallet.cx - wallet.size / 2,
          top: wallet.cy - wallet.size / 2,
          width: wallet.size,
          height: wallet.size,
          opacity: harvesting ? 1 : 0.35,
          transform: `scale(${walletBump})`,
          filter: harvesting
            ? "drop-shadow(0 0 24px rgba(245,197,66,0.45))"
            : undefined,
        }}
      >
        <PixelIcon name="wallet" size={wallet.size} />
      </div>
      <div
        style={{
          position: "absolute",
          left: wallet.cx - 500,
          width: 1000,
          top: counterY,
          textAlign: "center",
          fontFamily: FONT.pixel,
          fontSize: pick(92, 100),
          color: C.neon,
          textShadow: "7px 7px 0 #000",
          opacity: counter.opacity,
          transform: `scale(${counter.scale})`,
        }}
      >
        <Counter
          to={COPY.harvest.payout}
          start={HARVEST.counterStart}
          end={HARVEST.counterEnd}
          decimals={2}
          prefix="+"
        />
        <span style={{ color: C.gold }}> {COPY.harvest.unit}</span>
      </div>

      <CoinRain
        start={HARVEST.coinsStart}
        end={HARVEST.coinsEnd}
        count={pick(24, 28)}
        target={{ x: wallet.cx, y: wallet.cy - wallet.size * 0.2 }}
        spawn={pick(
          { x0: 1020, x1: 1800, y: -120 },
          { x0: 120, x1: width - 120, y: -120 },
        )}
        size={pick(140, 160)}
      />
      <ParticleBurst
        at={HARVEST.counterEnd}
        x={wallet.cx}
        y={wallet.cy - wallet.size * 0.25}
        count={40}
        colors={[C.neon, C.gold]}
        speed={26}
        size={10}
        life={22}
        seed="ka-ching"
      />
    </AbsoluteFill>
  );
};
