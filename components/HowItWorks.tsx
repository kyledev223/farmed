import { BUY_URL, MINT_COST } from "@/lib/mock";
import { fmtInt } from "@/lib/format";
import { MintButton } from "./MintProvider";
import { PixelIcon, type IconName } from "./PixelIcon";
import { SectionHeading } from "./SectionHeading";

const STEPS: { icon: IconName; title: string; aside?: string; body: string }[] = [
  {
    icon: "wallet",
    title: "Buy",
    body: "Pick up $FARMED on Pump.fun like every other degen. Congratulations, you are now livestock.",
  },
  {
    icon: "flame",
    title: "Burn",
    body: `Burn ${fmtInt(MINT_COST)} $FARMED to mint one random farm. Bigger farms and rarer animals mean a higher yield rate.`,
  },
  {
    icon: "pitchfork",
    title: "Get harvested daily...",
    aside: "(every 10 min)",
    body: "Pump.fun creator fees get harvested every round and paid out in SOL to every farm, split by yield rate.",
  },
];

export function HowItWorks() {
  return (
    <section aria-labelledby="how-it-works" id="how" className="container-farm scroll-mt-24 py-20">
      <SectionHeading id="how-it-works" eyebrow="How it works" title="Three steps. Zero pretending.">
        No staking dashboards, no lockups, no &ldquo;APY&rdquo;. Own a farm and the barn pays you.
      </SectionHeading>

      <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.title} className="glow-hover panel relative flex flex-col p-5">
            <div className="mb-5 flex items-center justify-between">
              <PixelIcon name={s.icon} size={56} />
              <span aria-hidden className="font-pixel text-3xl text-line">
                0{i + 1}
              </span>
            </div>
            <h3 className="text-xs uppercase leading-relaxed text-ink">
              <span className="sr-only">Step {i + 1}: </span>
              {s.title}
              {s.aside && <span className="mt-1 block text-[10px] text-gold">{s.aside}</span>}
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{s.body}</p>
          </li>
        ))}
      </ol>

      <div className="mt-8 flex flex-wrap gap-3">
        <a href={BUY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost">
          Buy $FARMED<span className="sr-only"> (opens in new tab)</span>
        </a>
        <MintButton />
      </div>
    </section>
  );
}
