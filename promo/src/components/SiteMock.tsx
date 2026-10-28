import { Easing, interpolate, random, useCurrentFrame } from "remotion";
import { COPY, FARM_NAMES, type SeriesKey } from "../copy";
import { progress, stepped } from "../lib/anim";
import { C, FONT, glow, hexA, TIER } from "../theme";
import { SITE } from "../timeline";
import { Counter } from "./Counter";
import { PixelIcon } from "./PixelIcon";
import { PixelImg } from "./PixelImg";

const TONE = { neon: C.neon, text: C.text, barn: C.barnInk, gold: C.gold };

/** Rising, noisy SOL-per-harvest series (deterministic). */
const POINTS = Array.from(
  { length: 32 },
  (_, i) => 0.18 + 0.62 * (i / 31) ** 1.3 + (random(`chart-${i}`) - 0.5) * 0.16,
);

/** All mock sizes in one place, per layout. `scroll` = how far the page travels to reveal the catalogue. */
const SIZES = {
  desktop: {
    pad: 28,
    header: 84,
    logo: 62,
    icon: 46,
    label: 20,
    value: 30,
    chartH: 380,
    cardImg: 200,
    cols: 4,
    gap: 16,
    scroll: 340,
  },
  mobile: {
    pad: 24,
    header: 104,
    logo: 76,
    icon: 40,
    label: 22,
    value: 30,
    chartH: 430,
    cardImg: 250,
    cols: 2,
    gap: 20,
    scroll: 260,
  },
};
type Sizes = (typeof SIZES)["desktop"];

/**
 * Rebuilt FARMED page (sticky header, stat strip, harvest chart, catalogue) for the
 * device mockup when no screen recording is provided. Sized in CSS px of the device.
 */
export const SiteMock: React.FC<{ w: number; h: number; mobile: boolean }> = ({
  w,
  h,
  mobile,
}) => {
  const frame = useCurrentFrame();
  const S = mobile ? SIZES.mobile : SIZES.desktop;
  const scroll = interpolate(
    frame,
    [SITE.scrollStart, SITE.scrollEnd],
    [0, S.scroll],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.inOut(Easing.cubic),
    },
  );

  return (
    <div
      style={{
        width: w,
        height: h,
        overflow: "hidden",
        background: C.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Header S={S} mobile={mobile} />
      <div style={{ flex: 1, overflow: "hidden" }}>
        <div style={{ transform: `translateY(${-Math.round(scroll)}px)` }}>
          <Stats S={S} mobile={mobile} />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: S.pad,
              padding: S.pad,
            }}
          >
            <HarvestChart S={S} mobile={mobile} />
            <Catalogue S={S} mobile={mobile} width={w - S.pad * 2} />
          </div>
        </div>
      </div>
    </div>
  );
};

const Header: React.FC<{ S: Sizes; mobile: boolean }> = ({ S, mobile }) => (
  <div
    style={{
      height: S.header,
      display: "flex",
      alignItems: "center",
      gap: 28,
      padding: `0 ${S.pad}px`,
      borderBottom: `2px solid ${C.border}`,
      background: C.bg,
      flexShrink: 0,
    }}
  >
    <PixelImg
      src="logo-wordmark.png"
      style={{ height: S.logo, width: "auto" }}
    />
    {!mobile &&
      COPY.site.nav.map((n, i) => (
        <div
          key={n}
          style={{
            fontFamily: FONT.pixel,
            fontSize: 16,
            color: i === 2 ? C.neon : C.muted,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {i === 2 && (
            <div style={{ width: 10, height: 10, background: C.neon }} />
          )}
          {n.toUpperCase()}
        </div>
      ))}
    <div style={{ flex: 1 }} />
    <div
      style={{
        fontFamily: FONT.pixel,
        fontSize: mobile ? 18 : 16,
        color: C.bg,
        background: C.gold,
        border: "2px solid #000",
        boxShadow: "4px 4px 0 #000",
        padding: mobile ? "14px 16px" : "12px 16px",
      }}
    >
      {COPY.site.cta}
    </div>
    {mobile && (
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {[0, 1, 2].map((k) => (
          <div key={k} style={{ width: 36, height: 6, background: C.text }} />
        ))}
      </div>
    )}
  </div>
);

const Stats: React.FC<{ S: Sizes; mobile: boolean }> = ({ S, mobile }) => (
  <div
    style={{
      display: "grid",
      gridTemplateColumns: mobile ? "1fr 1fr" : "repeat(4, 1fr)",
      borderBottom: `2px solid ${C.border}`,
      background: C.panel,
    }}
  >
    {COPY.site.stats.map((s, i) => (
      <div
        key={s.label}
        style={{
          display: "flex",
          alignItems: "center",
          gap: mobile ? 12 : 16,
          padding: mobile ? "22px 16px" : "24px 26px",
          borderRight: (mobile ? i % 2 === 0 : i < 3)
            ? `2px solid ${C.border}`
            : undefined,
          borderBottom: mobile && i < 2 ? `2px solid ${C.border}` : undefined,
          minWidth: 0,
        }}
      >
        <PixelIcon name={s.icon} size={S.icon} />
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: FONT.mono,
              fontWeight: 700,
              fontSize: S.label,
              color: C.muted,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
            }}
          >
            {s.label}
          </div>
          <div
            style={{
              fontFamily: FONT.pixel,
              fontSize: S.value,
              color: TONE[s.tone],
              marginTop: 10,
              whiteSpace: "nowrap",
            }}
          >
            <Counter
              to={s.to}
              start={SITE.statsStart + i * 3}
              end={SITE.statsEnd + i * 3}
              decimals={s.decimals}
              compact={s.compact}
            />
          </div>
        </div>
      </div>
    ))}
  </div>
);

const PanelTitle: React.FC<{
  text: string;
  mobile: boolean;
  right?: React.ReactNode;
}> = ({ text, mobile, right }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 18,
    }}
  >
    <div
      style={{
        fontFamily: FONT.pixel,
        fontSize: mobile ? 22 : 20,
        color: C.text,
      }}
    >
      {text}
    </div>
    {right}
  </div>
);

const HarvestChart: React.FC<{ S: Sizes; mobile: boolean }> = ({
  S,
  mobile,
}) => {
  const frame = useCurrentFrame();
  const p = progress(
    frame,
    SITE.chartStart,
    SITE.chartEnd,
    stepped(24, Easing.out(Easing.quad)),
  );
  const W = 1000;
  const H = 400;
  const step = W / (POINTS.length - 1);
  const ys = POINTS.map((v) => Math.round((H - v * H * 0.9) / 8) * 8);
  // Axis-aligned staircase, so its length is exact for the dash trick.
  let d = `M0 ${ys[0]}`;
  let len = 0;
  for (let i = 1; i < ys.length; i++) {
    d += ` H${i * step} V${ys[i]}`;
    len += step + Math.abs(ys[i] - ys[i - 1]);
  }

  return (
    <div
      style={{
        background: C.panel,
        border: `2px solid ${C.border}`,
        boxShadow: "6px 6px 0 #000",
        padding: 22,
        height: S.chartH,
      }}
    >
      <PanelTitle
        text={COPY.site.chartTitle}
        mobile={mobile}
        right={
          <div style={{ display: "flex", gap: 6 }}>
            {["1H", "6H", "24H", "7D"].map((r) => {
              const on = r === COPY.site.chartRange;
              return (
                <div
                  key={r}
                  style={{
                    fontFamily: FONT.pixel,
                    fontSize: mobile ? 16 : 14,
                    padding: "8px 10px",
                    border: `2px solid ${on ? C.neon : C.border}`,
                    color: on ? C.neon : C.muted,
                  }}
                >
                  {r}
                </div>
              );
            })}
          </div>
        }
      />
      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        style={{
          width: "100%",
          height: S.chartH - 110,
          display: "block",
          overflow: "visible",
        }}
      >
        <defs>
          <clipPath id="chart-reveal">
            <rect x={0} y={-20} width={W * p} height={H + 40} />
          </clipPath>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <line
            key={g}
            x1={0}
            x2={W}
            y1={H * g}
            y2={H * g}
            stroke={C.border}
            strokeWidth={2}
            strokeDasharray="8 8"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        <path
          d={`${d} V${H} H0 Z`}
          fill={hexA(C.neon, 0.1)}
          clipPath="url(#chart-reveal)"
        />
        <path
          d={d}
          fill="none"
          stroke={C.neon}
          strokeWidth={6}
          strokeDasharray={len}
          strokeDashoffset={len * (1 - p)}
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
};

const Catalogue: React.FC<{ S: Sizes; mobile: boolean; width: number }> = ({
  S,
  mobile,
  width,
}) => {
  const frame = useCurrentFrame();
  const ids = COPY.site.catalogue.slice(0, 4);
  const hovered = frame >= SITE.hover;
  const cardW = (width - S.gap * (S.cols - 1)) / S.cols;
  const col = COPY.site.hoverIndex % S.cols;
  const row = Math.floor(COPY.site.hoverIndex / S.cols);
  const target = {
    x: col * (cardW + S.gap) + cardW * 0.55,
    y: 44 + row * (S.cardImg + 110) + S.cardImg * 0.6,
  };

  return (
    <div style={{ position: "relative" }}>
      <PanelTitle text={COPY.site.catalogueTitle} mobile={mobile} />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${S.cols}, 1fr)`,
          gap: S.gap,
        }}
      >
        {ids.map((id, i) => {
          const tier = TIER[id.split("-")[0] as SeriesKey];
          const hot = hovered && i === COPY.site.hoverIndex;
          return (
            <div
              key={id}
              style={{
                position: "relative",
                background: C.panel,
                border: `2px solid ${hot ? C.neon : C.border}`,
                boxShadow: hot
                  ? `${glow(C.neon)}, 6px 6px 0 #000`
                  : "6px 6px 0 #000",
                transform: `translateY(${hot ? -8 : 0}px)`,
              }}
            >
              <div style={{ height: 6, background: tier.hex }} />
              <div
                style={{
                  height: S.cardImg,
                  overflow: "hidden",
                  borderBottom: `2px solid ${C.border}`,
                }}
              >
                <PixelImg
                  src={`farms/${id}.png`}
                  fit="cover"
                  style={{
                    width: "100%",
                    height: "100%",
                    transform: `scale(${hot ? 1.06 : 1})`,
                  }}
                />
              </div>
              <div style={{ padding: "14px 14px" }}>
                <div
                  style={{
                    fontFamily: FONT.pixel,
                    fontSize: mobile ? 16 : 15,
                    color: C.text,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                  }}
                >
                  {FARM_NAMES[id].toUpperCase()}
                </div>
                <div
                  style={{
                    fontFamily: FONT.mono,
                    fontWeight: 700,
                    fontSize: mobile ? 20 : 18,
                    color: tier.hex,
                    marginTop: 8,
                  }}
                >
                  {tier.label}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {mobile ? (
        <TapRing x={target.x} y={target.y} />
      ) : (
        <Cursor x={target.x} y={target.y} />
      )}
    </div>
  );
};

/** Pixel arrow cursor that glides onto the hovered catalogue card. */
const Cursor: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const frame = useCurrentFrame();
  const t = progress(
    frame,
    SITE.hover - 18,
    SITE.hover,
    Easing.inOut(Easing.cubic),
  );
  const cx = interpolate(t, [0, 1], [x - 420, x]);
  const cy = interpolate(t, [0, 1], [y + 160, y]);
  // 1 = fill, 2 = outline.
  const shape = [
    "2",
    "22",
    "212",
    "2112",
    "21112",
    "211112",
    "2111112",
    "21111222",
    "2112",
    "22 212",
    "    212",
    "     2",
  ];
  const px = 5;
  return (
    <div
      style={{
        position: "absolute",
        left: cx,
        top: cy,
        filter: "drop-shadow(4px 4px 0 #000)",
      }}
    >
      {shape.map((row, r) =>
        row.split("").map((c, k) =>
          c === " " ? null : (
            <div
              key={`${r}-${k}`}
              style={{
                position: "absolute",
                left: k * px,
                top: r * px,
                width: px,
                height: px,
                background: c === "1" ? C.text : "#000",
              }}
            />
          ),
        ),
      )}
    </div>
  );
};

/** Square tap ring that expands in steps where the finger lands. */
const TapRing: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  const t = useCurrentFrame() - SITE.hover;
  if (t < 0 || t > 10) return null;
  const s = [60, 90, 120, 140, 150][Math.min(4, Math.floor(t / 2))];
  return (
    <div
      style={{
        position: "absolute",
        left: x - s / 2,
        top: y - s / 2,
        width: s,
        height: s,
        border: `6px solid ${C.neon}`,
      }}
    />
  );
};
