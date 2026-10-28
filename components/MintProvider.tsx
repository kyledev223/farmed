"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useFarmedWallet } from "@/hooks/useFarmedWallet";
import { MintModal } from "./MintModal";

const MintContext = createContext<{ openMint: () => void } | null>(null);

export function MintProvider({ children }: { children: ReactNode }) {
  const { connected, connecting, modalOpen: walletModalOpen, openModal: openWalletModal } = useFarmedWallet();
  const [open, setOpen] = useState(false);
  // Set when Burn was clicked without a wallet: the mint opens once one connects
  const [mintAfterConnect, setMintAfterConnect] = useState(false);

  const openMint = useCallback(() => {
    if (connected) {
      setOpen(true);
    } else {
      setMintAfterConnect(true);
      openWalletModal();
    }
  }, [connected, openWalletModal]);

  useEffect(() => {
    if (!mintAfterConnect) return;
    if (connected) {
      setMintAfterConnect(false);
      setOpen(true);
    } else if (!walletModalOpen && !connecting) {
      // Picker dismissed without connecting
      setMintAfterConnect(false);
    }
  }, [mintAfterConnect, connected, connecting, walletModalOpen]);

  // Burning needs a wallet; drop the mint if it disconnects mid-flow
  useEffect(() => {
    if (!connected) setOpen(false);
  }, [connected]);

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

/** Any "Burn 100K $FARMED" CTA on the site. Asks for a wallet first if none is connected. */
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
