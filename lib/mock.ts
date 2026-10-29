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
/* Demo data switch                                                    */
/* ------------------------------------------------------------------ */

/**
 * true  = fill the site with made-up demo numbers (harvests, stats, owned farms).
 * false = real launch state: everything zero / empty until onchain data is wired in.
 * Turn this OFF before showing the site to real buyers: these numbers aren't real.
 */
export const DEMO_DATA = true;

/** Fixed "now" for the demo history (keeps SSR + client renders identical). */
const DEMO_NOW = Date.UTC(2026, 9, 28, 18, 0, 0);

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
/* Harvests & protocol stats                                           */
/* ------------------------------------------------------------------ */

/** Demo mints, oldest first: [farm id, owner wallet, hours before DEMO_NOW]. 2 farms in the last 2 hours. */
const DEMO_MINTS: [string, string, number][] = [
  ["jeeter-2", "A", 2],
  ["paperhand-1", "B", 1],
];
/** The connected wallet is shown this owner's farms in demo mode. */
const DEMO_YOU = "A";

const demoMints = DEMO_MINTS.map(([id, owner, hoursAgo], i) => ({
  tokenId: i + 1,
  spec: getSpec(id),
  owner,
  mintedAt: DEMO_NOW - hoursAgo * 3_600_000,
}));

/** Harvest rounds since the first mint, plus each farm's running SOL earned. */
function buildDemo() {
  const rand = mulberry32(0xfa12ed);
  const step = HARVEST_INTERVAL_SEC * 1000;
  const earned = new Map<number, number>();
  const rounds: HarvestRound[] = [];
  for (let t = Math.floor(demoMints[0].mintedAt / step) * step + step; t <= DEMO_NOW; t += step) {
    const live = demoMints.filter((m) => m.mintedAt < t);
    const yieldRate = live.reduce((s, m) => s + m.spec.yieldRate, 0);
    const hour = new Date(t).getUTCHours();
    // A small new token's creator fees: busier in US hours, noisy, the occasional pump
    const daily = 0.75 + 0.45 * Math.sin(((hour - 9) / 24) * Math.PI * 2);
    const pump = rand() > 0.97 ? 2.5 + rand() * 2 : 1;
    const poolSol = +(0.0045 * daily * pump * (0.5 + rand())).toFixed(5);
    for (const m of live)
      earned.set(m.tokenId, (earned.get(m.tokenId) ?? 0) + (poolSol * m.spec.yieldRate) / yieldRate);
    rounds.push({
      round: rounds.length + 1,
      time: new Date(t).toISOString(),
      poolSol,
      farmsPaid: live.length,
      totalYieldRate: yieldRate,
      tx: fakeSig(rand),
    });
  }
  return { rounds: rounds.reverse(), earned };
}

const demo = DEMO_DATA ? buildDemo() : null;

/** Newest first. TODO(indexer): fetch real rounds. */
export const HARVEST_HISTORY: HarvestRound[] = demo?.rounds ?? [];

/** TODO(onchain): read from the program / indexer. */
export const PROTOCOL_STATS = (() => {
  const latest = HARVEST_HISTORY[0];
  if (!latest) {
    return {
      totalYieldRate: 0,
      solHarvestedAllTime: 0,
      farmsMinted: 0,
      farmedBurned: 0,
      lastHarvestRound: 0,
      lastHarvestSol: 0,
    };
  }
  return {
    totalYieldRate: latest.totalYieldRate,
    solHarvestedAllTime: +HARVEST_HISTORY.reduce((s, r) => s + r.poolSol, 0).toFixed(2),
    farmsMinted: demoMints.length,
    farmedBurned: demoMints.length * MINT_COST,
    lastHarvestRound: latest.round,
    lastHarvestSol: latest.poolSol,
  };
})();

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
export const OWNED_FARMS: OwnedFarm[] = demo
  ? demoMints
      .filter((m) => m.owner === DEMO_YOU)
      .map((m) => ({
        mint: fakeSig(mulberry32(m.tokenId), 44),
        tokenId: m.tokenId,
        spec: m.spec,
        mintedAt: new Date(m.mintedAt).toISOString(),
        solEarned: demo.earned.get(m.tokenId) ?? 0,
      }))
  : [];
