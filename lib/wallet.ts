/**
 * Pure wallet helpers: catalogue, deep links, error copy, sign-in message.
 * No React here, so the design pass can restyle components without touching logic.
 */

import { WalletError } from "@solana/wallet-adapter-base";

/* ------------------------------------------------------------------ */
/* Known wallets                                                       */
/* ------------------------------------------------------------------ */

/**
 * Wallets we always list in the picker, even when not installed.
 * All of these implement the Wallet Standard, so when installed they are
 * auto-detected (with their own icon) and this entry only supplies the
 * fallback "Install" link. Names must match what each wallet registers.
 */
export const KNOWN_WALLETS: { name: string; url: string }[] = [
  { name: "Phantom", url: "https://phantom.com/" },
  { name: "OKX Wallet", url: "https://www.okx.com/web3" },
  { name: "Solflare", url: "https://solflare.com/" },
  { name: "Backpack", url: "https://backpack.app/" },
];

/* ------------------------------------------------------------------ */
/* Mobile                                                              */
/* ------------------------------------------------------------------ */

export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  // iPadOS 13+ reports itself as "Macintosh"; touch support gives it away.
  const iPadOS = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return iPadOS || /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}

/** Links that reopen the current page inside a wallet's in-app browser. */
export function getInAppBrowserLinks(pageUrl: string): { name: string; href: string }[] {
  const url = encodeURIComponent(pageUrl);
  const ref = encodeURIComponent(new URL(pageUrl).origin);
  const okxDeepLink = `okx://wallet/dapp/url?dappUrl=${url}`;
  return [
    { name: "Phantom", href: `https://phantom.app/ul/browse/${url}?ref=${ref}` },
    { name: "OKX Wallet", href: `https://www.okx.com/download?deeplink=${encodeURIComponent(okxDeepLink)}` },
  ];
}

/* ------------------------------------------------------------------ */
/* Errors                                                              */
/* ------------------------------------------------------------------ */

function isUserRejection(err: unknown): boolean {
  const inner = err instanceof WalletError ? err.error : err;
  const code = (inner as { code?: number } | undefined)?.code;
  if (code === 4001) return true;
  const msg = `${(err as Error)?.message ?? ""} ${(inner as Error)?.message ?? ""}`;
  return /reject|denied|declined|cancel/i.test(msg);
}

/** Turn any wallet-adapter error into one short sentence for the UI. */
export function friendlyWalletError(err: unknown): string {
  const name = (err as Error)?.name ?? "";
  if (isUserRejection(err)) {
    return name === "WalletSignMessageError"
      ? "Signature request cancelled."
      : "Connection request cancelled in your wallet.";
  }
  switch (name) {
    case "WalletNotReadyError":
      return "That wallet isn't installed or ready. Install it, then refresh this page.";
    case "WalletWindowClosedError":
      return "The wallet window was closed before connecting.";
    case "WalletTimeoutError":
      return "The wallet took too long to respond. Please try again.";
    case "WalletSignMessageError":
      return "Your wallet couldn't sign the message. Please try again.";
    case "WalletConnectionError":
      return "Couldn't connect to your wallet. Unlock it and try again.";
    default:
      return "Something went wrong with your wallet. Please try again.";
  }
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */

export const solscanAccountUrl = (address: string) => `https://solscan.io/account/${address}`;

/* ------------------------------------------------------------------ */
/* Sign-in message                                                     */
/* ------------------------------------------------------------------ */

export function createNonce(bytes = 16): string {
  const buf = crypto.getRandomValues(new Uint8Array(bytes));
  return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Human-readable sign-in message. Address and domain are included so a
 * signature can't be replayed for another wallet or site.
 * TODO(server): the nonce should come from the server, not the browser.
 */
export function buildSignInMessage(p: { address: string; domain: string; nonce: string; issuedAt: string }) {
  return [
    "Sign in to FARMED",
    `Nonce: ${p.nonce}`,
    `Issued: ${p.issuedAt}`,
    `Wallet: ${p.address}`,
    `Domain: ${p.domain}`,
    "",
    "This only proves you own this wallet. It does not send a transaction or cost any fees.",
  ].join("\n");
}

export function bytesToBase64(bytes: Uint8Array): string {
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin);
}
