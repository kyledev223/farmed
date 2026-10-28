/**
 * ALL ON-SCREEN COPY LIVES HERE.
 * Pixel-font lines wrap automatically to fit; use "\n" to force a break.
 */

export type IconName =
  | "wallet"
  | "pitchfork"
  | "flame"
  | "sol"
  | "clock"
  | "barn";
export type SeriesKey = "jeeter" | "paperhand" | "bagholder" | "whale";

export const TAGLINE =
  "You're not trading. You're being farmed. Might as well own the farm.";

export const COPY = {
  hook: {
    lines: ["YOU BOUGHT THE TOP.", "YOU SOLD THE BOTTOM.", "YOU GOT FARMED."],
    ticker: "$JEETCOIN / SOL",
    /** PnL ticker: counts up to +pump% on the way up, then down to -drawdown%. */
    pump: 412,
    drawdown: 94.2,
    markTop: "← YOU",
    markBottom: "ALSO YOU →",
  },

  brand: {
    subtext: "Might as well own the farm.",
  },

  how: {
    title: "HOW IT WORKS",
    steps: [
      { icon: "wallet", title: "BUY $FARMED", sub: "on Pump.fun" },
      { icon: "flame", title: "BURN 100K", sub: "gone. forever." },
      { icon: "barn", title: "GET A FARM", sub: "random. no refunds." },
    ] as { icon: IconName; title: string; sub: string }[],
  },

  roll: {
    title: "MINTING...",
    /** Shown beside the reel (16:9 only) while it spins. */
    hint: "100,000 $FARMED burned.\nRolling the barn door...",
    /** Farm image the reel lands on (public/farms/<id>.png). */
    resultId: "whale-3",
    resultName: "WHALE RANCH",
    resultOdds: "5.1% ODDS",
    resultTier: "LEGENDARY",
    series: [
      { key: "jeeter", label: "JEETER", odds: "56%" },
      { key: "paperhand", label: "PAPERHAND", odds: "27%" },
      { key: "bagholder", label: "BAGHOLDER", odds: "12%" },
      { key: "whale", label: "WHALE", odds: "5%" },
    ] as { key: SeriesKey; label: string; odds: string }[],
  },

  harvest: {
    title: "NEXT HARVEST",
    countFrom: 3,
    ready: "HARVEST!",
    payout: 0.42,
    unit: "SOL",
    caption: "Paid in SOL. Every 10 minutes.",
  },

  site: {
    caption: "Watch the herd work.",
    url: "farmed.fun",
    nav: ["Farms", "Harvests", "Stats", "Docs"],
    cta: "MINT A FARM",
    /** Illustrative numbers for the dashboard mock (the live site is zero until launch). */
    stats: [
      {
        label: "Yield rate",
        icon: "pitchfork",
        to: 18_420,
        decimals: 0,
        tone: "neon",
      },
      {
        label: "SOL harvested",
        icon: "sol",
        to: 1_284.37,
        decimals: 2,
        tone: "text",
      },
      {
        label: "Farms minted",
        icon: "barn",
        to: 3_412,
        decimals: 0,
        tone: "text",
      },
      {
        label: "$FARMED burned",
        icon: "flame",
        to: 341_200_000,
        decimals: 0,
        compact: true,
        tone: "barn",
      },
    ] as {
      label: string;
      icon: IconName;
      to: number;
      decimals: number;
      compact?: boolean;
      tone: "neon" | "text" | "barn" | "gold";
    }[],
    chartTitle: "SOL PER HARVEST",
    chartRange: "24H",
    catalogueTitle: "CATALOGUE",
    /** Which catalogue card the cursor hovers (index into the grid). */
    hoverIndex: 3,
    catalogue: [
      "jeeter-2",
      "paperhand-3",
      "bagholder-2",
      "whale-3",
      "jeeter-3",
      "whale-1",
      "paperhand-1",
      "bagholder-3",
    ],
  },

  cta: {
    tagline: "You're not trading.\nYou're being farmed.",
    url: "farmed.fun",
    chain: "$FARMED on Solana",
  },

  /** Small print on the site mock and the end card. Set to "" to hide. */
  disclaimer: "Figures illustrative. Not financial advice.",
};

/** Display names for the catalogue mock. */
export const FARM_NAMES: Record<string, string> = {
  "jeeter-1": "Jeeter Coop",
  "jeeter-2": "Jeeter Henhouse",
  "jeeter-3": "Jeeter Factory",
  "paperhand-1": "Paperhand Shed",
  "paperhand-2": "Paperhand Pasture",
  "paperhand-3": "Paperhand Ranch",
  "bagholder-1": "Bagholder Sty",
  "bagholder-2": "Bagholder Pen",
  "bagholder-3": "Bagholder Estate",
  "whale-1": "Whale Pond",
  "whale-2": "Whale Lagoon",
  "whale-3": "Whale Atoll",
};
