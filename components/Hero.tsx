import Image from "next/image";
import { BUY_URL } from "@/lib/mock";
import { HarvestCountdown } from "./HarvestCountdown";
import { MintButton } from "./MintProvider";
import { PixelIcon } from "./PixelIcon";

export function Hero() {
  return (
    <section aria-labelledby="hero-title" className="crt relative isolate overflow-hidden border-b-2 border-line">
      <Image
        src="/hero.png"
        alt=""
        fill
        priority
        sizes="100vw"
        className="pixelated -z-10 object-cover object-[70%_center]"
      />
      {/* readability scrims: heavier on mobile, left-weighted on desktop */}
      <div aria-hidden className="absolute inset-0 -z-10 bg-bg/75 lg:bg-transparent lg:bg-gradient-to-r lg:from-bg lg:via-bg/80 lg:to-bg/10" />
      <div aria-hidden className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-bg to-transparent" />

      <div className="container-farm relative z-[2] grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.25fr_minmax(320px,380px)] lg:py-28">
        <div className="min-w-0">
          <p className="eyebrow mb-5 flex items-center gap-2 text-gold">
            <PixelIcon name="pitchfork" size={18} />
            Creator fees → farm owners
          </p>
          <h1 id="hero-title" className="text-[21px] leading-[1.4] text-ink [text-shadow:3px_3px_0_#000] min-[400px]:text-[26px] sm:text-[40px] lg:text-[46px]">
            RAISE DEGENS.
            <br />
            HARVEST <span className="text-neon">$SOL.</span>
          </h1>
          <p className="mt-6 max-w-xl text-sm leading-relaxed text-ink/90 sm:text-base">
            You&apos;re not trading. You&apos;re being farmed. Might as well own the farm. Burn $FARMED to mint a
            random farm full of jeeters, paperhands, bagholders and whales. Every 10 minutes the creator fees get
            harvested and paid to farm owners in SOL.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <MintButton className="btn btn-gold sm:px-6">
              <PixelIcon name="flame" size={18} />
              Burn 100K $FARMED
            </MintButton>
            <a href={BUY_URL} target="_blank" rel="noopener noreferrer" className="btn btn-ghost sm:px-6">
              Buy $FARMED<span className="sr-only"> (opens in new tab)</span>
            </a>
          </div>
          <a
            href="#how"
            className="mt-5 inline-flex min-h-[44px] items-center gap-2 font-pixel text-[10px] uppercase text-muted underline decoration-dashed underline-offset-4 hover:text-neon"
          >
            How it works ↓
          </a>
        </div>

        <HarvestCountdown />
      </div>
    </section>
  );
}
