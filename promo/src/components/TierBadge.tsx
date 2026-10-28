import { FONT } from "../theme";

/** Series/tier badge in the site's style: dark text on the tier swatch, 2px black border. */
export const TierBadge: React.FC<{ label: string; color: string; size: number }> = ({ label, color, size }) => (
  <span
    style={{
      display: "inline-block",
      border: `${Math.max(2, Math.round(size / 10))}px solid #000`,
      background: color,
      color: "#0B0F0C",
      fontFamily: FONT.pixel,
      fontSize: size,
      lineHeight: 1,
      padding: `${Math.round(size * 0.45)}px ${Math.round(size * 0.6)}px`,
      boxShadow: `${Math.round(size / 5)}px ${Math.round(size / 5)}px 0 #000`,
    }}
  >
    {label}
  </span>
);
