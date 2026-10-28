/**
 * MOCK DATA — everything on the site reads from here.
 * Replace each export with real onchain / indexer data when wiring up.
 * All values are deterministic (seeded) so server and client renders match.
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
/** PLACEHOLDER contract address — swap for the real mint before launch. */
export const CONTRACT_ADDRESS = "8kFaRMeDq9ZtV3yWb2NxLcH7uPj4sE6aGmRf1TzQpump";
export const X_URL = "https://x.com/";
export const BUY_URL = "https://pump.fun/";
export const EXPLORER_TX = (sig: string) => `https://solscan.io/tx/${sig}`;

/** Fixed "now" for historical mock data (keeps SSR + client identical). */
export const MOCK_NOW = Date.UTC(2026, 9, 28, 12, 0, 0);

/* ------------------------------------------------------------------ */
/* Seeded PRNG                                                         */
/* ------------------------------------------------------------------ */

function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const B58 = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
function fakeSig(rand: () => number, len = 88) {
  let s = "";
  for (let i = 0; i < len; i++) s += B58[Math.floor(rand() * B58.length)];
  return s;
}

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
/* Harvest history: 7 days of 10-minute rounds                         */
/* ------------------------------------------------------------------ */

const ROUNDS_7D = (7 * 24 * 60) / 10; // 1008
const LATEST_ROUND = 8412;
const FARMS_NOW = 3412;

function buildHistory(): HarvestRound[] {
  const rand = mulberry32(0xfa12ed);
  const rounds: HarvestRound[] = [];
  for (let i = ROUNDS_7D - 1; i >= 0; i--) {
    const t = MOCK_NOW - i * HARVEST_INTERVAL_SEC * 1000;
    const progress = 1 - i / ROUNDS_7D; // 0 → 1 over the week
    const farms = Math.round(FARMS_NOW * (0.62 + 0.38 * progress) - rand() * 6);
    const hour = new Date(t).getUTCHours();
    // Volume is busier during US hours, plus noise and the occasional pump
    const daily = 0.75 + 0.45 * Math.sin(((hour - 9) / 24) * Math.PI * 2);
    const pump = rand() > 0.975 ? 2.4 + rand() * 2 : 1;
    const poolSol = +(0.18 * daily * pump * (0.6 + rand() * 0.8) * (0.7 + progress * 0.6)).toFixed(4);
    rounds.push({
      round: LATEST_ROUND - i,
      time: new Date(t).toISOString(),
      poolSol,
      farmsPaid: farms,
      totalYieldRate: Math.round(farms * EXPECTED_YIELD),
      tx: fakeSig(rand),
    });
  }
  return rounds.reverse(); // newest first
}

/** Newest first. */
export const HARVEST_HISTORY: HarvestRound[] = buildHistory();

const sum7d = HARVEST_HISTORY.reduce((s, r) => s + r.poolSol, 0);
const latest = HARVEST_HISTORY[0];

export const PROTOCOL_STATS = {
  totalYieldRate: latest.totalYieldRate,
  solHarvestedAllTime: +(612.4 + sum7d).toFixed(2),
  farmsMinted: FARMS_NOW,
  farmedBurned: FARMS_NOW * MINT_COST,
  lastHarvestRound: latest.round,
  lastHarvestSol: latest.poolSol,
  holders: 2187,
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
/* Connected wallet (MOCK)                                             */
/* ------------------------------------------------------------------ */

const OWNED: [string, number, string, number][] = [
  ["whale-2", 2981, "2026-10-21T18:40:00Z", 1.8421],
  ["bagholder-3", 1404, "2026-10-12T03:10:00Z", 3.1177],
  ["paperhand-2", 3120, "2026-10-24T22:00:00Z", 0.2864],
  ["jeeter-1", 3307, "2026-10-27T09:30:00Z", 0.0119],
  ["jeeter-3", 2412, "2026-10-17T14:20:00Z", 0.6038],
];

export const OWNED_FARMS: OwnedFarm[] = OWNED.map(([id, tokenId, mintedAt, solEarned]) => ({
  mint: fakeSig(mulberry32(tokenId), 44),
  tokenId,
  spec: getSpec(id),
  mintedAt,
  solEarned,
}));

export const WALLET_SUMMARY = (() => {
  const yieldRate = OWNED_FARMS.reduce((s, f) => s + f.spec.yieldRate, 0);
  return {
    address: "7xKpQm3vR9fWbN2sLc8hJdTzY4aEuG6oPq1VmB5nHrD",
    yieldRate,
    networkShare: yieldRate / PROTOCOL_STATS.totalYieldRate,
    solEarned: OWNED_FARMS.reduce((s, f) => s + f.solEarned, 0),
    farmedBalance: 245_310,
  };
})();
