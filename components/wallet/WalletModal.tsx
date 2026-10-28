"use client";

import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from "react";
import type { WalletName } from "@solana/wallet-adapter-base";
import { useFarmedWallet, useWalletOptions, type WalletOption } from "@/hooks/useFarmedWallet";

/**
 * Wallet picker. Presentation only: state comes from useFarmedWallet(), the
 * list from useWalletOptions(). Rendered once by <WalletProviders>; open it
 * with useFarmedWallet().connect() or openModal().
 */
export function WalletModal() {
  const { modalOpen, closeModal, connect, pendingWallet, connecting, connected, walletName, error } =
    useFarmedWallet();
  const { options, inAppBrowserLinks } = useWalletOptions();
  const dialogRef = useRef<HTMLDivElement>(null);

  // Focus in, Escape to close, lock page scroll, restore focus on close.
  useEffect(() => {
    if (!modalOpen) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, [modalOpen, closeModal]);

  if (!modalOpen) return null;

  // Keep Tab inside the dialog.
  const trapFocus = (e: ReactKeyboardEvent) => {
    if (e.key !== "Tab" || !dialogRef.current) return;
    const items = dialogRef.current.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]");
    if (!items.length) return;
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || document.activeElement === dialogRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center" onClick={closeModal}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="wallet-modal-title"
        tabIndex={-1}
        onKeyDown={trapFocus}
        onClick={(e) => e.stopPropagation()}
        className="panel max-h-[85vh] w-full max-w-sm overflow-y-auto p-4 outline-none"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 id="wallet-modal-title" className="text-xs uppercase">
            {connected ? "Change wallet" : "Connect wallet"}
          </h2>
          <button type="button" onClick={closeModal} aria-label="Close" className="px-2 py-1 text-muted hover:text-ink">
            ✕
          </button>
        </div>

        {error && (
          <p role="alert" className="mb-4 border-2 border-barn px-3 py-2 text-xs text-barn-ink">
            {error}
          </p>
        )}

        {inAppBrowserLinks.length > 0 && (
          <section className="mb-4">
            <p className="mb-2 text-xs text-muted">
              No wallet found in this browser. Open FARMED inside your wallet app:
            </p>
            <ul className="space-y-2">
              {inAppBrowserLinks.map((l) => (
                <li key={l.name}>
                  <a href={l.href} className="btn btn-ghost w-full">
                    Open in {l.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <ul className="space-y-2">
          {options.map((o) => (
            <li key={o.name}>
              <WalletRow
                option={o}
                pending={pendingWallet === o.name}
                current={connected && walletName === o.name}
                disabled={connecting && pendingWallet !== o.name}
                onSelect={() => connect(o.name as WalletName)}
              />
            </li>
          ))}
        </ul>

        <p className="mt-4 text-[11px] text-muted">
          FARMED will never ask for your seed phrase or private key.
        </p>
      </div>
    </div>
  );
}

function WalletRow({
  option,
  pending,
  current,
  disabled,
  onSelect,
}: {
  option: WalletOption;
  pending: boolean;
  current: boolean;
  disabled: boolean;
  onSelect: () => void;
}) {
  const rowClass = "flex min-h-[48px] w-full items-center gap-3 border-2 border-line px-3 py-2 text-left text-sm hover:border-neon";
  const body = (
    <>
      <WalletIcon option={option} />
      <span className="min-w-0 flex-1 truncate">{option.name}</span>
      {option.status === "detected" && <span className="text-[10px] uppercase text-neon">Detected</span>}
      {option.status === "loadable" && <span className="text-[10px] uppercase text-muted">Mobile app</span>}
    </>
  );

  if (option.status === "install") {
    return (
      <a href={option.url} target="_blank" rel="noopener noreferrer" className={rowClass}>
        {body}
        <span className="text-[10px] uppercase text-muted">
          Install<span className="sr-only"> (opens in new tab)</span>
        </span>
      </a>
    );
  }

  return (
    <button type="button" onClick={onSelect} disabled={disabled || pending} aria-busy={pending} className={`${rowClass} disabled:opacity-50`}>
      {body}
      {pending && <span className="text-[10px] uppercase text-gold">Connecting…</span>}
      {current && !pending && <span className="text-[10px] uppercase text-muted">Connected</span>}
    </button>
  );
}

export function WalletIcon({ option, size = 28 }: { option: Pick<WalletOption, "name" | "icon">; size?: number }) {
  if (option.icon) {
    // eslint-disable-next-line @next/next/no-img-element -- wallet icons are data URIs supplied by the wallet
    return <img src={option.icon} alt="" width={size} height={size} className="shrink-0" />;
  }
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className="flex shrink-0 items-center justify-center bg-panel-2 text-xs text-muted"
    >
      {option.name.charAt(0)}
    </span>
  );
}
