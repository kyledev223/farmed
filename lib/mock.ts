/**
 * SITE DATA — everything on the site reads from here.
 * The catalogue (farm specs, odds) is the real game design. Live values
 * (harvests, protocol stats, owned farms) are zero/empty until launch and
 * should be replaced with onchain / indexer data when wiring up.
 */

export type SeriesKey = "jeeter" | "paperhand" | "bagholder" | "whale";
export type Tier = "common" | "uncommon" | "rare" | "legendary";
export type Size = 1 | 2 | 3;

export interface Series {
  key: SeriesKey;
  label: string;
  animal: string;
  tier: Tier;
  blurb: string;
}

export interface FarmSpec {
  id: string; // e.g. "jeeter-1"
  series: SeriesKey;
  size: Size;
  name: string;
  image: string;
  livestock: number;
  yieldRate: number;
  odds: number; // percent, all 12 sum to 100
}

export interface OwnedFarm {
  mint: string;
  tokenId: number;
  spec: FarmSpec;
  mintedAt: string; // ISO
  solEarned: number;
}

export interface HarvestRound {
  round: number;
  time: string; // ISO
  poolSol: number;
  farmsPaid: number;
  totalYieldRate: number;
  tx: string;
}

/* ------------------------------------------------------------------ */
/* Protocol constants                                                  */
/* ------------------------------------------------------------------ */

export const TOKEN_SYMBOL = "$FARMED";
export const MINT_COST = 100_000;
export const HARVEST_INTERVAL_SEC = 600;
export const PAYOUT_ASSET = "SOL";
/** $FARMED token mint (contract address). */
export const CONTRACT_ADDRESS = "uSf3r8EJDXpXLi5bLvBP53ZunHy32QD8qvfYHcdpump";
export const X_HANDLE = "getfarmedfun";
export const X_URL = `https://x.com/${X_HANDLE}`;
export const BUY_URL = `https://pump.fun/coin/${CONTRACT_ADDRESS}`;
export const EXPLORER_TX = (sig: string) => `https://solscan.io/tx/${sig}`;

/* ------------------------------------------------------------------ */
/* Catalogue: 4 series × 3 sizes                                       */
/* ------------------------------------------------------------------ */

export const SERIES: Record<SeriesKey, Series> = {
  jeeter: {
    key: "jeeter",
    label: "Jeeter",
    animal: "Chickens",
    tier: "common",
    blurb: "Sells the first green candle. Rebuys the top. Lays eggs anyway.",
  },
  paperhand: {
    key: "paperhand",
    label: "Paperhand",
    animal: "Sheep",
    tier: "uncommon",
    blurb: "Panic-sold at -4%. Still checking the chart. Still sweating.",
  },
  bagholder: {
    key: "bagholder",
    label: "Bagholder",
    animal: "Pigs",
    tier: "rare",
    blurb: "Down 96%. Will not sell. Calls it a long-term position.",
  },
  whale: {
    key: "whale",
    label: "Whale",
    animal: "Whales",
    tier: "legendary",
    blurb: "Moves the market by sneezing. Very few of them. Very large.",
  },
};

export const SERIES_ORDER: SeriesKey[] = ["jeeter", "paperhand", "bagholder", "whale"];

export const TIER_LABEL: Record<Tier, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  legendary: "Legendary",
};

/** Hex per tier — keep in sync with tailwind.config.ts `tier.*`. */
export const TIER_HEX: Record<Tier, string> = {
  common: "#A9B8AF",
  uncommon: "#22FF88",
  rare: "#5CC8FF",
  legendary: "#F5C542",
};

export const SIZE_LABEL: Record<Size, string> = { 1: "Small", 2: "Medium", 3: "Large" };

const NAMES: Record<SeriesKey, [string, string, string]> = {
  jeeter: ["Jeeter Coop", "Jeeter Henhouse", "Jeeter Factory"],
  paperhand: ["Paperhand Shed", "Paperhand Pasture", "Paperhand Ranch"],
  bagholder: ["Bagholder Sty", "Bagholder Pen", "Bagholder Estate"],
  whale: ["Whale Pond", "Whale Lagoon", "Whale Atoll"],
};

const SPEC_TABLE: Record<SeriesKey, { livestock: number; yieldRate: number; odds: number }[]> = {
  jeeter: [
    { livestock: 8, yieldRate: 10, odds: 22 },
    { livestock: 20, yieldRate: 28, odds: 12 },
    { livestock: 48, yieldRate: 75, odds: 6 },
  ],
  paperhand: [
    { livestock: 6, yieldRate: 18, odds: 16 },
    { livestock: 15, yieldRate: 48, odds: 9 },
    { livestock: 36, yieldRate: 120, odds: 5 },
  ],
  bagholder: [
    { livestock: 4, yieldRate: 35, odds: 10 },
    { livestock: 10, yieldRate: 90, odds: 6 },
    { livestock: 24, yieldRate: 220, odds: 3 },
  ],
  whale: [
    { livestock: 1, yieldRate: 80, odds: 6 },
    { livestock: 2, yieldRate: 200, odds: 3.5 },
    { livestock: 4, yieldRate: 500, odds: 1.5 },
  ],
};

export const CATALOGUE: FarmSpec[] = SERIES_ORDER.flatMap((series) =>
  SPEC_TABLE[series].map((row, i) => {
    const size = (i + 1) as Size;
    return {
      id: `${series}-${size}`,
      series,
      size,
      name: NAMES[series][i],
      image: `/farms/${series}-${size}.png`,
      ...row,
    };
  }),
);

export const EXPECTED_YIELD = CATALOGUE.reduce((s, f) => s + (f.odds / 100) * f.yieldRate, 0);

export const getSpec = (id: string) => CATALOGUE.find((f) => f.id === id)!;

/** MOCK mint roll — weighted by odds. Replace with the onchain VRF result. */
export function rollMockFarm(rand: () => number = Math.random): FarmSpec {
  let r = rand() * 100;
  for (const f of CATALOGUE) {
    r -= f.odds;
    if (r <= 0) return f;
  }
  return CATALOGUE[0];
}

/* ------------------------------------------------------------------ */
/* Harvests & protocol stats — zero until launch                       */
/* ------------------------------------------------------------------ */

/** Newest first. Empty until the first harvest. TODO(indexer): fetch real rounds. */
export const HARVEST_HISTORY: HarvestRound[] = [];

/** TODO(onchain): read from the program / indexer. */
export const PROTOCOL_STATS = {
  totalYieldRate: 0,
  solHarvestedAllTime: 0,
  farmsMinted: 0,
  farmedBurned: 0,
  lastHarvestRound: 0,
  lastHarvestSol: 0,
};

/* ------------------------------------------------------------------ */
/* Chart series                                                        */
/* ------------------------------------------------------------------ */

export type ChartRange = "1h" | "6h" | "24h" | "7d";

export interface ChartPoint {
  t: number; // ms
  sol: number;
  yieldRate: number;
}

export const CHART_RANGES: Record<ChartRange, { rounds: number; bucket: number; unit: string }> = {
  "1h": { rounds: 6, bucket: 1, unit: "round" },
  "6h": { rounds: 36, bucket: 1, unit: "round" },
  "24h": { rounds: 144, bucket: 6, unit: "hour" },
  "7d": { rounds: 1008, bucket: 36, unit: "6h" },
};

export function getChartData(range: ChartRange): ChartPoint[] {
  const { rounds, bucket } = CHART_RANGES[range];
  const slice = HARVEST_HISTORY.slice(0, rounds).reverse(); // oldest first
  const out: ChartPoint[] = [];
  for (let i = 0; i < slice.length; i += bucket) {
    const group = slice.slice(i, i + bucket);
    const last = group[group.length - 1];
    out.push({
      t: Date.parse(last.time),
      sol: +group.reduce((s, r) => s + r.poolSol, 0).toFixed(4),
      yieldRate: last.totalYieldRate,
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Connected wallet                                                    */
/* ------------------------------------------------------------------ */

/** TODO(onchain): the connected wallet's farm NFTs (e.g. DAS getAssetsByOwner). */
export const OWNED_FARMS: OwnedFarm[] = [];
