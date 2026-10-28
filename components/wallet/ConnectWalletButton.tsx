"use client";

import { useEffect, useRef, useState } from "react";
import { useFarmedWallet } from "@/hooks/useFarmedWallet";
import { fmtSol } from "@/lib/format";
import { solscanAccountUrl } from "@/lib/wallet";
import { PixelIcon } from "../PixelIcon";
import { WalletIcon } from "./WalletModal";

/**
 * Header wallet button. Presentation only; all state is from useFarmedWallet().
 * Keeps the ~44px "btn" footprint in every state so the header doesn't shift.
 */
export function ConnectWalletButton({ className = "" }: { className?: string }) {
  const w = useFarmedWallet();

  if (!w.connected || !w.address) {
    return (
      <button
        type="button"
        onClick={w.openModal}
        aria-busy={w.connecting}
        className={`btn btn-ghost px-3 ${className}`}
      >
        <PixelIcon name="wallet" size={20} />
        {w.connecting ? (
          <span>Connecting…</span>
        ) : (
          <>
            <span>Connect</span>
            <span className="hidden lg:inline">Wallet</span>
          </>
        )}
      </button>
    );
  }

  return <ConnectedMenu className={className} />;
}

function ConnectedMenu({ className }: { className: string }) {
  const w = useFarmedWallet();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const address = w.address!;
  const balance = w.solBalance === null ? "… SOL" : `${fmtSol(w.solBalance, 3)} SOL`;

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      // Clipboard blocked (e.g. insecure context); the address is still visible in the title.
    }
  }

  const item = "block w-full px-3 py-2 text-left text-sm hover:bg-panel-2 hover:text-neon disabled:opacity-50";

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls="wallet-menu"
        onClick={() => {
          if (!open) w.clearError();
          setOpen(!open);
        }}
        title={address}
        className={`btn btn-ghost px-3 ${className}`}
      >
        {w.walletIcon && w.walletName ? (
          <WalletIcon option={{ name: w.walletName, icon: w.walletIcon }} size={18} />
        ) : (
          <PixelIcon name="wallet" size={20} />
        )}
        <span>{w.shortAddress}</span>
        <span className="hidden text-muted sm:inline" aria-live="polite">
          {balance}
        </span>
      </button>

      {open && (
        <div id="wallet-menu" role="menu" className="panel absolute right-0 top-full z-50 mt-2 w-56 py-1">
          <p className="px-3 py-2 text-xs text-muted sm:hidden">{balance}</p>
          <button type="button" role="menuitem" className={item} onClick={copy}>
            <span aria-live="polite">{copied ? "Copied!" : "Copy address"}</span>
          </button>
          <a
            role="menuitem"
            href={solscanAccountUrl(address)}
            target="_blank"
            rel="noopener noreferrer"
            className={item}
            onClick={() => setOpen(false)}
          >
            View on Solscan<span className="sr-only"> (opens in new tab)</span>
          </a>

          {/* Optional sign-in. TODO(server): signature is not verified yet, so don't gate anything on it. */}
          {w.session ? (
            <p className="px-3 py-2 text-sm text-neon">Signed in</p>
          ) : (
            w.canSignIn && (
              <button type="button" role="menuitem" className={item} onClick={w.signIn} disabled={w.signingIn}>
                {w.signingIn ? "Check your wallet…" : "Sign in"}
              </button>
            )
          )}

          <button
            type="button"
            role="menuitem"
            className={item}
            onClick={() => {
              setOpen(false);
              w.openModal();
            }}
          >
            Change wallet
          </button>
          <button
            type="button"
            role="menuitem"
            className={`${item} text-barn-ink`}
            onClick={() => {
              setOpen(false);
              w.disconnect();
            }}
          >
            Disconnect
          </button>
          {w.error && !w.modalOpen && (
            <p role="alert" className="border-t-2 border-line px-3 py-2 text-xs text-barn-ink">
              {w.error}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
