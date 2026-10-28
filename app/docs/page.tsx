import type { Metadata } from "next";
import type { ReactNode } from "react";
import { DocsNav } from "@/components/DocsNav";
import { CATALOGUE, HARVEST_INTERVAL_SEC, MINT_COST, SERIES, SERIES_ORDER, TIER_LABEL } from "@/lib/mock";
import { fmtInt } from "@/lib/format";

export const metadata: Metadata = { title: "Docs" };

// PLACEHOLDER COPY — replace with final docs before launch.
const SECTIONS: { id: string; title: string; body: ReactNode }[] = [
  {
    id: "what",
    title: "What this is",
    body: (
      <>
        <p>
          FARMED is a memecoin with one honest premise: on a launchpad, most people are livestock. They buy tops, sell
          bottoms, and their fees feed someone else. FARMED lets you stand on the other side of the fence.
        </p>
        <p>
          Burn $FARMED to mint a farm NFT. Farms hold crypto-trader livestock and earn a share of the token&apos;s
          Pump.fun creator fees, paid in SOL every {HARVEST_INTERVAL_SEC / 60} minutes.
        </p>
      </>
    ),
  },
  {
    id: "token",
    title: "The token",
    body: (
      <>
        <p>
          $FARMED launched on Pump.fun with a fair launch: no presale, no team allocation, no VC round. Every trade
          generates creator fees, and those fees are the harvest.
        </p>
        <ul>
          <li>Ticker: $FARMED</li>
          <li>Chain: Solana</li>
          <li>Supply: fixed at launch, and it only goes down (burns)</li>
          <li>Contract: see the footer. Always verify before buying.</li>
        </ul>
      </>
    ),
  },
  {
    id: "minting",
    title: "Minting",
    body: (
      <>
        <p>
          Minting costs {fmtInt(MINT_COST)} $FARMED, burned permanently. In return you get one farm, chosen at random
          from 12 possibilities. Randomness comes from an onchain source (placeholder: VRF details TBD), so nobody, not
          even the dev, picks your farm.
        </p>
        <p>
          There is no reroll, no refund and no whitelist. You can mint as many farms as you can afford to burn for.
        </p>
      </>
    ),
  },
  {
    id: "farms",
    title: "The farms",
    body: (
      <>
        <p>There are four series, each with a small, medium and large farm:</p>
        <ul>
          {SERIES_ORDER.map((k) => {
            const odds = CATALOGUE.filter((f) => f.series === k).reduce((s, f) => s + f.odds, 0);
            return (
              <li key={k}>
                <strong>
                  {SERIES[k].label} ({TIER_LABEL[SERIES[k].tier]}, {odds}%):
                </strong>{" "}
                {SERIES[k].blurb}
              </li>
            );
          })}
        </ul>
        <p>
          Each farm has a fixed <em>yield rate</em>. Bigger farms and rarer series carry higher yield rates. Full numbers
          are on the Stats page.
        </p>
      </>
    ),
  },
  {
    id: "harvests",
    title: "How harvests work",
    body: (
      <>
        <p>
          Every {HARVEST_INTERVAL_SEC / 60} minutes, the creator fees collected since the last round are claimed and
          distributed:
        </p>
        <pre>
          <code>{`your payout = pool × (your yield rate ÷ total network yield rate)`}</code>
        </pre>
        <p>
          Payouts are pushed to the wallet holding the farm at harvest time. If you sell a farm, its future harvests go
          to the new owner. If a round collects nothing, nobody gets paid. That&apos;s farming.
        </p>
      </>
    ),
  },
  {
    id: "risks",
    title: "Risks",
    body: (
      <>
        <p>Read this part. Seriously.</p>
        <ul>
          <li>Memecoins can and usually do go to zero. Burned tokens are gone forever.</li>
          <li>Harvests depend entirely on trading volume. No volume, no fees, no SOL.</li>
          <li>Smart contracts can have bugs. Audits reduce risk; they don&apos;t remove it.</li>
          <li>Every new farm dilutes every existing farm&apos;s share of the pool.</li>
          <li>Nothing here is financial advice, a security or a promise of returns.</li>
        </ul>
      </>
    ),
  },
  {
    id: "faq",
    title: "FAQ",
    body: (
      <dl>
        {[
          ["Do I need to claim?", "No. Payouts are sent to your wallet automatically each round (placeholder)."],
          ["Can I sell my farm?", "Yes. Farms are standard NFTs. The harvest follows the farm."],
          ["Why burn instead of pay?", "Burning shrinks supply and keeps mint proceeds out of anyone's pocket, including the dev's."],
          ["Is this a rug?", "Read the contract, check the burns onchain, and decide for yourself. Then budget like it could be."],
          ["Wen whale?", "1.5% for a Whale Atoll. Godspeed."],
        ].map(([q, a]) => (
          <div key={q}>
            <dt>{q}</dt>
            <dd>{a}</dd>
          </div>
        ))}
      </dl>
    ),
  },
];

export default function DocsPage() {
  const nav = SECTIONS.map(({ id, title }) => ({ id, title }));
  return (
    <div className="container-farm py-14">
      <header className="mb-10 max-w-2xl">
        <p className="eyebrow mb-3 text-neon">Docs</p>
        <h1 className="text-xl sm:text-2xl">The farmer&apos;s almanac</h1>
        <p className="mt-4 text-sm text-muted">Everything you need to know before you burn anything.</p>
      </header>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
        <DocsNav sections={nav} />
        <article className="docs-prose min-w-0 max-w-3xl space-y-14">
          {SECTIONS.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-40 lg:scroll-mt-24">
              <h2 id={`${s.id}-h`} className="mb-5 flex items-baseline gap-3 text-sm uppercase sm:text-base">
                <span aria-hidden className="text-[10px] text-neon">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {s.title}
              </h2>
              {s.body}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
