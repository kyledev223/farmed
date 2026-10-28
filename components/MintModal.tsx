"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import {
  CATALOGUE,
  MINT_COST,
  SERIES,
  TIER_HEX,
  TIER_LABEL,
  TOKEN_SYMBOL,
  rollMockFarm,
  type FarmSpec,
} from "@/lib/mock";
import { fmtInt } from "@/lib/format";
import { useFarmedWallet } from "@/hooks/useFarmedWallet";
import { useReducedMotion } from "@/lib/useReducedMotion";
import { FarmCard } from "./FarmCard";
import { PixelIcon } from "./PixelIcon";

type Phase = "confirm" | "rolling" | "reveal";

const TILE = 112; // px, tile width incl. gap
const REEL_LEN = 36;
const RESULT_INDEX = REEL_LEN - 4;
const SPIN_MS = 2600;

function buildReel(result: FarmSpec): FarmSpec[] {
  // Uniform filler so the reel shows plenty of rare stuff flying past (pure theatre)
  const reel = Array.from({ length: REEL_LEN }, () => CATALOGUE[Math.floor(Math.random() * CATALOGUE.length)]);
  reel[RESULT_INDEX] = result;
  return reel;
}

export function MintModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<Phase>("confirm");
  const [result, setResult] = useState<FarmSpec | null>(null);
  const [reel, setReel] = useState<FarmSpec[]>([]);

  // Open / close the native dialog (gives us focus trapping + Esc + top layer for free)
  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      setPhase("confirm");
      setResult(null);
      d.showModal();
      document.documentElement.style.overflow = "hidden";
    } else if (!open && d.open) {
      d.close();
    }
    if (!open) document.documentElement.style.overflow = "";
  }, [open]);

  const requestClose = useCallback(() => {
    if (phase === "rolling") return;
    onClose();
  }, [phase, onClose]);

  async function burn() {
    // TODO(onchain): build + send the burn tx for MINT_COST $FARMED, then read the
    // minted farm from the program / VRF result. This mock rolls locally.
    const r = rollMockFarm();
    setResult(r);
    setReel(buildReel(r));
    setPhase("rolling");
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="mint-title"
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) requestClose();
      }}
      className="m-auto w-[calc(100%-32px)] max-w-lg overflow-x-hidden border-2 border-line bg-panel p-0 text-ink shadow-hard backdrop:bg-black/80 backdrop:backdrop-blur-[2px]"
    >
      {open && (
        <div className="relative">
          <div className="flex items-center justify-between border-b-2 border-line bg-bg px-4 py-3">
            <h2 id="mint-title" className="flex items-center gap-2 text-[11px] uppercase">
              <PixelIcon name="flame" size={20} />
              {phase === "confirm" && "Mint a farm"}
              {phase === "rolling" && "Rolling..."}
              {phase === "reveal" && "Farm acquired"}
            </h2>
            <button
              type="button"
              onClick={requestClose}
              disabled={phase === "rolling"}
              className="btn btn-ghost min-h-[36px] w-9 px-0 py-0"
              aria-label="Close"
            >
              <span aria-hidden>X</span>
            </button>
          </div>

          <div className="p-4 sm:p-6">
            {phase === "confirm" && <Confirm onBurn={burn} onCancel={requestClose} />}
            {phase === "rolling" && result && (
              <Rolling reel={reel} reduced={reduced} onDone={() => setPhase("reveal")} />
            )}
            {phase === "reveal" && result && (
              <Reveal result={result} onAgain={() => setPhase("confirm")} onClose={onClose} />
            )}
          </div>

          <p className="sr-only" aria-live="assertive">
            {phase === "rolling" && "Rolling your farm."}
            {phase === "reveal" && result && `You minted ${result.name}, ${TIER_LABEL[SERIES[result.series].tier]}.`}
          </p>
        </div>
      )}
    </dialog>
  );
}

/* ------------------------------------------------------------------ */

function Confirm({ onBurn, onCancel }: { onBurn: () => void; onCancel: () => void }) {
  const { shortAddress } = useFarmedWallet();
  // TODO(onchain): read the wallet's $FARMED balance once the mint address is final,
  // show it here, and disable Burn when it's below MINT_COST.
  return (
    <div className="space-y-5">
      <div className="border-2 border-barn bg-barn/10 p-4 text-center">
        <p className="eyebrow">You burn</p>
        <p className="num mt-2 text-xl text-ink sm:text-2xl">{fmtInt(MINT_COST)}</p>
        <p className="mt-1 font-pixel text-[10px] text-barn-ink">{TOKEN_SYMBOL}</p>
      </div>

      <div aria-hidden className="text-center font-pixel text-muted">
        ▼
      </div>

      <div className="border-2 border-line bg-bg p-4">
        <p className="eyebrow mb-3 text-center">You get 1 random farm</p>
        <ul className="grid grid-cols-2 gap-2 text-center min-[440px]:grid-cols-4">
          {(["jeeter", "paperhand", "bagholder", "whale"] as const).map((k) => {
            const odds = CATALOGUE.filter((f) => f.series === k).reduce((s, f) => s + f.odds, 0);
            const hex = TIER_HEX[SERIES[k].tier];
            return (
              <li key={k} className="border-2 border-line p-2">
                <span aria-hidden className="mx-auto mb-2 block h-2 w-full" style={{ background: hex }} />
                <span className="block truncate font-pixel text-[8px] uppercase text-ink">{SERIES[k].label}</span>
                <span className="num mt-1 block text-[10px] text-muted">{odds}%</span>
              </li>
            );
          })}
        </ul>
      </div>

      <dl className="space-y-1 text-xs">
        <div className="flex justify-between">
          <dt className="text-muted">Wallet</dt>
          <dd className="font-mono text-ink">{shortAddress}</dd>
        </div>
      </dl>

      <p className="text-xs text-muted">
        Burns are permanent. The tokens are gone, the farm is yours, and the result is random. No refunds, no
        rerolls, no crying in the barn.
      </p>

      <div className="flex flex-col-reverse gap-3 sm:flex-row">
        <button type="button" className="btn btn-ghost flex-1" onClick={onCancel}>
          Cancel
        </button>
        <button type="button" className="btn btn-gold flex-[2]" onClick={onBurn}>
          <PixelIcon name="flame" size={18} />
          Burn {fmtInt(MINT_COST)}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Rolling({ reel, reduced, onDone }: { reel: FarmSpec[]; reduced: boolean; onDone: () => void }) {
  const windowRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    setTimeout(onDone, reduced ? 0 : 350);
  }, [onDone, reduced]);

  useLayoutEffect(() => {
    if (reduced) {
      const t = setTimeout(finish, 900);
      return () => clearTimeout(t);
    }
    const w = windowRef.current?.clientWidth ?? 320;
    const jitter = (Math.random() - 0.5) * TILE * 0.5;
    const target = RESULT_INDEX * TILE + TILE / 2 - w / 2 + jitter;
    // Next frame so the browser registers the start position before transitioning
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        setSpinning(true);
        setOffset(target);
      }),
    );
    const fallback = setTimeout(finish, SPIN_MS + 400);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [reduced, finish]);

  if (reduced) {
    return (
      <div className="flex h-56 flex-col items-center justify-center gap-4 text-center">
        <PixelIcon name="barn" size={64} />
        <p className="font-pixel text-[11px] text-neon">Rolling your farm...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 py-4">
      <div ref={windowRef} className="relative h-[136px] overflow-hidden border-2 border-line bg-bg">
        <div
          className="absolute left-0 top-0 flex h-full items-center"
          style={{
            transform: `translateX(${-offset}px)`,
            transition: spinning ? `transform ${SPIN_MS}ms cubic-bezier(0.08, 0.6, 0.12, 1)` : "none",
          }}
          onTransitionEnd={finish}
        >
          {reel.map((f, i) => (
            <div key={i} className="shrink-0 px-1" style={{ width: TILE }}>
              <div className="relative aspect-square border-2 bg-panel" style={{ borderColor: TIER_HEX[SERIES[f.series].tier] }}>
                <Image src={f.image} alt="" fill sizes="104px" className="pixelated object-cover" />
              </div>
            </div>
          ))}
        </div>
        {/* centre marker */}
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-1/2 w-[3px] -translate-x-1/2 bg-gold shadow-glow-gold" />
        <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 font-pixel text-xs leading-none text-gold">
          ▼
        </div>
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-bg to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-bg to-transparent" />
      </div>
      <p className="animate-flicker text-center font-pixel text-[10px] text-neon">Shaking the barn...</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const PARTICLES = Array.from({ length: 14 }, (_, i) => {
  const a = (i / 14) * Math.PI * 2;
  const d = 120 + (i % 3) * 30;
  return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, delay: (i % 4) * 40 };
});

function Reveal({ result, onAgain, onClose }: { result: FarmSpec; onAgain: () => void; onClose: () => void }) {
  const primaryRef = useRef<HTMLAnchorElement>(null);
  // The Burn button that had focus unmounted during the roll, so hand focus to the result
  useEffect(() => primaryRef.current?.focus(), []);
  const tier = SERIES[result.series].tier;
  const hex = TIER_HEX[tier];
  return (
    <div className="space-y-5">
      <div className="relative mx-auto max-w-[280px]">
        {/* burst: rotating rays + expanding ring + pixel confetti */}
        <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="absolute aspect-square w-[160%] animate-spin-slow opacity-50"
            style={{
              background: `repeating-conic-gradient(from 0deg, ${hex}55 0deg 8deg, transparent 8deg 22deg)`,
              maskImage: "radial-gradient(circle, #000 25%, transparent 68%)",
              WebkitMaskImage: "radial-gradient(circle, #000 25%, transparent 68%)",
            }}
          />
          <div className="absolute aspect-square w-full animate-burst-ring border-4" style={{ borderColor: hex }} />
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className="pixel-particle absolute h-2 w-2"
              style={
                {
                  background: i % 3 === 0 ? "#F5C542" : hex,
                  "--dx": `${p.dx}px`,
                  "--dy": `${p.dy}px`,
                  animationDelay: `${p.delay}ms`,
                } as CSSProperties
              }
            />
          ))}
        </div>
        <div className="relative animate-pop" style={{ boxShadow: `0 0 0 2px ${hex}, 0 0 40px ${hex}66` }}>
          <FarmCard spec={result} headingLevel="h3" />
        </div>
      </div>

      <p className="text-center font-pixel text-[11px] uppercase" style={{ color: hex }}>
        {TIER_LABEL[tier]} pull!
      </p>
      <p className="text-center text-xs text-muted">{SERIES[result.series].blurb}</p>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" className="btn btn-ghost flex-1" onClick={onAgain}>
          Mint another
        </button>
        <Link ref={primaryRef} href="/farms" className="btn btn-green flex-1" onClick={onClose}>
          View my farms
        </Link>
      </div>
    </div>
  );
}
