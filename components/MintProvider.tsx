"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { MintModal } from "./MintModal";

const MintContext = createContext<{ openMint: () => void } | null>(null);

export function MintProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const openMint = useCallback(() => setOpen(true), []);
  return (
    <MintContext.Provider value={{ openMint }}>
      {children}
      <MintModal open={open} onClose={() => setOpen(false)} />
    </MintContext.Provider>
  );
}

export function useMint() {
  const ctx = useContext(MintContext);
  if (!ctx) throw new Error("useMint must be used inside <MintProvider>");
  return ctx;
}

/** Any "Burn 100K $FARMED" CTA on the site. */
export function MintButton({
  children = "Burn 100K $FARMED",
  className = "btn btn-gold",
}: {
  children?: ReactNode;
  className?: string;
}) {
  const { openMint } = useMint();
  return (
    <button type="button" className={className} onClick={openMint} aria-haspopup="dialog">
      {children}
    </button>
  );
}
