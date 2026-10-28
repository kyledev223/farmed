"use client";

import type { Adapter } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { clusterApiUrl } from "@solana/web3.js";
import { useCallback, useState, type ReactNode } from "react";
import { FarmedWalletContext, useFarmedWalletController } from "@/hooks/useFarmedWallet";
import { WalletModal } from "./WalletModal";

const ENDPOINT = process.env.NEXT_PUBLIC_RPC_URL || clusterApiUrl("mainnet-beta");

/**
 * Explicit adapters, only for wallets that don't implement the Wallet Standard.
 * Phantom, OKX Wallet, Solflare and Backpack all do, so they're detected
 * automatically and nothing needs to go here. Mobile Wallet Adapter (Android)
 * is added by WalletProvider itself.
 */
const LEGACY_ADAPTERS: Adapter[] = [];

function FarmedWalletProvider({
  walletError,
  setWalletError,
  children,
}: {
  walletError: unknown;
  setWalletError: (e: unknown) => void;
  children: ReactNode;
}) {
  const value = useFarmedWalletController(walletError, setWalletError);
  return (
    <FarmedWalletContext.Provider value={value}>
      {children}
      <WalletModal />
    </FarmedWalletContext.Provider>
  );
}

export function WalletProviders({ children }: { children: ReactNode }) {
  const [walletError, setWalletError] = useState<unknown>(null);
  const onError = useCallback((err: unknown) => {
    console.warn("[FARMED] wallet error", err);
    setWalletError(err);
  }, []);

  return (
    <ConnectionProvider endpoint={ENDPOINT} config={{ commitment: "confirmed" }}>
      <WalletProvider wallets={LEGACY_ADAPTERS} autoConnect onError={onError}>
        <FarmedWalletProvider walletError={walletError} setWalletError={setWalletError}>
          {children}
        </FarmedWalletProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
