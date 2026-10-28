import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#0B0F0C",
        panel: "#121A15",
        "panel-2": "#17221B",
        line: "#1F2B24",
        neon: "#22FF88",
        gold: "#F5C542",
        barn: "#C8423A",
        // Lighter barn red for text on dark surfaces (#C8423A alone is < 4.5:1)
        "barn-ink": "#FF7A6E",
        ink: "#E8EDE9",
        muted: "#7C8A82",
        tier: {
          common: "#A9B8AF",
          uncommon: "#22FF88",
          rare: "#5CC8FF",
          legendary: "#F5C542",
        },
      },
      fontFamily: {
        pixel: ["var(--font-pixel)", "monospace"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px #22FF88, 0 0 18px rgba(34,255,136,0.28)",
        "glow-gold": "0 0 0 1px #F5C542, 0 0 18px rgba(245,197,66,0.3)",
        hard: "4px 4px 0 0 #000",
        "hard-sm": "2px 2px 0 0 #000",
      },
      keyframes: {
        blink: { "0%,49%": { opacity: "1" }, "50%,100%": { opacity: "0" } },
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        pop: {
          "0%": { transform: "scale(0.6)", opacity: "0" },
          "60%": { transform: "scale(1.06)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "burst-ring": {
          "0%": { transform: "scale(0.2)", opacity: "1" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        flicker: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.55" } },
      },
      animation: {
        blink: "blink 1s steps(1) infinite",
        "spin-slow": "spin-slow 12s linear infinite",
        pop: "pop 420ms steps(6) both",
        "burst-ring": "burst-ring 700ms ease-out both",
        flicker: "flicker 1.2s steps(2) infinite",
      },
    },
  },
  plugins: [],
};

export default config;
