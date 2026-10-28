"use client";

import { WalletError, WalletReadyState, type WalletName } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, type PublicKey } from "@solana/web3.js";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { shortAddr } from "@/lib/format";
import {
  KNOWN_WALLETS,
  buildSignInMessage,
  bytesToBase64,
  createNonce,
  friendlyWalletError,
  getInAppBrowserLinks,
  isMobileDevice,
} from "@/lib/wallet";

const BALANCE_REFRESH_MS = 30_000;

/**
 * Result of the optional "Sign in" step. Held in memory only, never persisted.
 * TODO(server): POST { address, message, signature } to the backend and verify
 * it there (ed25519 over the message bytes, check nonce + issuedAt + domain).
 * Until that exists this proves nothing to the server and must not gate anything.
 */
export interface SignInSession {
  address: string;
  message: string;
  /** base64-encoded ed25519 signature of `message` (UTF-8). */
  signature: string;
  nonce: string;
  issuedAt: string;
}

export interface FarmedWallet {
  publicKey: PublicKey | null;
  address: string | null;
  /** e.g. "7xKX…a9Fp" */
  shortAddress: string | null;
  connected: boolean;
  connecting: boolean;
  /** SOL, or null while unknown / disconnected. */
  solBalance: number | null;
  /** No argument opens the wallet picker; with a name, connects to that wallet. */
  connect: (walletName?: WalletName) => Promise<void>;
  disconnect: () => Promise<void>;

  /* Extras for the wallet UI and anything else that wants them */
  walletName: WalletName | null;
  walletIcon: string | null;
  /** Wallet currently waiting for user approval, if any. */
  pendingWallet: WalletName | null;
  refreshBalance: () => Promise<void>;
  /** Friendly message for the last wallet error. */
  error: string | null;
  clearError: () => void;
  canSignIn: boolean;
  signingIn: boolean;
  session: SignInSession | null;
  signIn: () => Promise<SignInSession | null>;
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const FarmedWalletContext = createContext<FarmedWallet | null>(null);

/** Public hook. Must be used under <WalletProviders>. */
export function useFarmedWallet(): FarmedWallet {
  const ctx = useContext(FarmedWalletContext);
  if (!ctx) throw new Error("useFarmedWallet must be used inside <WalletProviders>");
  return ctx;
}

/** False on the server and during hydration, true after mount. */
function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

/**
 * Owns all wallet state. Used once, by <WalletProviders>, which puts the
 * result in FarmedWalletContext. `walletError` is the raw error the adapter
 * reported through WalletProvider's onError.
 */
export function useFarmedWalletController(
  walletError: unknown,
  setWalletError: (e: unknown) => void,
): FarmedWallet {
  const mounted = useMounted();
  const { connection } = useConnection();
  const {
    wallet,
    publicKey: rawPublicKey,
    connected: rawConnected,
    connecting: rawConnecting,
    select,
    connect: connectSelected,
    disconnect: disconnectAdapter,
    signMessage,
  } = useWallet();

  // Wallet state only exists in the browser. Report "disconnected" until
  // mounted so the server HTML and first client render match.
  const publicKey = mounted ? rawPublicKey : null;
  const connected = mounted && rawConnected && !!publicKey;
  const connecting = mounted && rawConnecting;
  const address = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  const [modalOpen, setModalOpen] = useState(false);

  /* ---------------- Balance ---------------- */

  const [solBalance, setSolBalance] = useState<number | null>(null);
  const addressRef = useRef(address);
  addressRef.current = address;

  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    const forAddress = publicKey.toBase58();
    try {
      const lamports = await connection.getBalance(publicKey, "confirmed");
      // Ignore late responses for a wallet we've since switched away from.
      if (addressRef.current === forAddress) setSolBalance(lamports / LAMPORTS_PER_SOL);
    } catch (err) {
      console.warn("[FARMED] balance fetch failed", err);
    }
  }, [connection, publicKey]);

  useEffect(() => {
    setSolBalance(null);
    if (!connected) return;
    refreshBalance();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") refreshBalance();
    }, BALANCE_REFRESH_MS);
    const onVisible = () => document.visibilityState === "visible" && refreshBalance();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [connected, refreshBalance]);

  /* ---------------- Connect / disconnect ---------------- */

  const connect = useCallback(
    async (name?: WalletName) => {
      if (!name) {
        setModalOpen(true);
        return;
      }
      setWalletError(null);
      if (wallet?.adapter.name === name) {
        if (wallet.adapter.connected) setModalOpen(false);
        // Errors are reported through onError, so they need no handling here.
        else await connectSelected().catch(() => {});
        return;
      }
      // WalletProvider has autoConnect on, so selecting a wallet triggers its connect.
      select(name);
    },
    [wallet, select, connectSelected, setWalletError],
  );

  const disconnect = useCallback(async () => {
    setModalOpen(false);
    await disconnectAdapter().catch(() => {});
  }, [disconnectAdapter]);

  // Close the picker once a (new) connection lands.
  useEffect(() => {
    if (connected) setModalOpen(false);
  }, [connected, address]);

  /* ---------------- Sign in (optional) ---------------- */

  const [session, setSession] = useState<SignInSession | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  // A session belongs to one address; drop it when the wallet changes.
  useEffect(() => {
    setSession((s) => (s && s.address === address ? s : null));
  }, [address]);

  const signIn = useCallback(async () => {
    if (!address || !signMessage) return null;
    setWalletError(null);
    setSigningIn(true);
    try {
      const nonce = createNonce();
      const issuedAt = new Date().toISOString();
      const message = buildSignInMessage({ address, domain: window.location.host, nonce, issuedAt });
      const sig = await signMessage(new TextEncoder().encode(message));
      const next: SignInSession = { address, message, signature: bytesToBase64(sig), nonce, issuedAt };
      // TODO(server): send `next` to the backend for verification before trusting it.
      setSession(next);
      return next;
    } catch (err) {
      // Adapter errors already arrive through onError; report anything else here.
      if (!(err instanceof WalletError)) setWalletError(err);
      return null;
    } finally {
      setSigningIn(false);
    }
  }, [address, signMessage, setWalletError]);

  /* ---------------- Modal ---------------- */

  const openModal = useCallback(() => {
    setWalletError(null);
    setModalOpen(true);
  }, [setWalletError]);
  const closeModal = useCallback(() => setModalOpen(false), []);
  const clearError = useCallback(() => setWalletError(null), [setWalletError]);

  const walletName = mounted ? (wallet?.adapter.name ?? null) : null;

  return {
    publicKey,
    address,
    shortAddress: address ? shortAddr(address) : null,
    connected,
    connecting,
    solBalance: connected ? solBalance : null,
    connect,
    disconnect,
    walletName,
    walletIcon: mounted ? (wallet?.adapter.icon ?? null) : null,
    pendingWallet: connecting ? walletName : null,
    refreshBalance,
    error: walletError ? friendlyWalletError(walletError) : null,
    clearError,
    canSignIn: connected && !!signMessage,
    signingIn,
    session,
    signIn,
    modalOpen,
    openModal,
    closeModal,
  };
}

/* ------------------------------------------------------------------ */
/* Picker data for <WalletModal>                                       */
/* ------------------------------------------------------------------ */

export type WalletOptionStatus = "detected" | "loadable" | "install";

export interface WalletOption {
  name: string;
  /** Data-URI icon from the wallet itself; null for wallets we've never seen. */
  icon: string | null;
  status: WalletOptionStatus;
  /** Official site, used for "Install". */
  url: string;
}

const STATUS_ORDER: Record<WalletOptionStatus, number> = { detected: 0, loadable: 1, install: 2 };

/**
 * Everything the picker shows: detected wallets first, then Mobile Wallet
 * Adapter (Android), then known wallets to install. On mobile with no
 * injected wallet, also links to reopen this page in a wallet's browser.
 */
export function useWalletOptions() {
  const { wallets } = useWallet();
  const [env, setEnv] = useState<{ mobile: boolean; pageUrl: string } | null>(null);

  // Device sniffing is browser-only; resolve after mount.
  useEffect(() => setEnv({ mobile: isMobileDevice(), pageUrl: window.location.href }), []);

  return useMemo(() => {
    const seen = new Set<string>();
    const options: WalletOption[] = [];

    for (const { adapter, readyState } of wallets) {
      const known = KNOWN_WALLETS.find((k) => k.name.toLowerCase() === adapter.name.toLowerCase());
      seen.add(adapter.name.toLowerCase());
      options.push({
        name: adapter.name,
        icon: adapter.icon || null,
        status:
          readyState === WalletReadyState.Installed
            ? "detected"
            : readyState === WalletReadyState.Loadable
              ? "loadable"
              : "install",
        url: known?.url ?? adapter.url,
      });
    }
    for (const k of KNOWN_WALLETS) {
      if (!seen.has(k.name.toLowerCase())) options.push({ name: k.name, icon: null, status: "install", url: k.url });
    }

    const rank = (name: string) => {
      const i = KNOWN_WALLETS.findIndex((k) => k.name.toLowerCase() === name.toLowerCase());
      return i === -1 ? KNOWN_WALLETS.length : i;
    };
    options.sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || rank(a.name) - rank(b.name));

    const hasInjected = options.some((o) => o.status === "detected");
    return {
      options,
      isMobile: env?.mobile ?? false,
      inAppBrowserLinks: env?.mobile && !hasInjected ? getInAppBrowserLinks(env.pageUrl) : [],
    };
  }, [wallets, env]);
}
