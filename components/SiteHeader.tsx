"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { NAV } from "./nav";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <header className="sticky top-0 z-40 border-b-2 border-line bg-bg/90 backdrop-blur-sm">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-2 focus:z-50 focus:bg-gold focus:px-3 focus:py-2 focus:text-bg"
      >
        Skip to content
      </a>
      <div className="container-farm flex h-16 items-center gap-4">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="FARMED home">
          {/* Icon on mobile, wordmark (which already includes the pitchfork) from sm up */}
          <Image src="/logo-icon.png" alt="" width={36} height={38} className="pixelated sm:hidden" priority />
          <Image src="/logo-wordmark.png" alt="" width={106} height={42} className="pixelated hidden sm:block" priority />
        </Link>

        <nav aria-label="Primary" className="ml-2 hidden md:block">
          <ul className="flex items-center">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`block px-3 py-2 font-pixel text-[10px] uppercase transition-colors hover:text-neon ${
                      active ? "text-neon" : "text-muted"
                    }`}
                  >
                    <span aria-hidden className={active ? "" : "invisible"}>
                      ▸
                    </span>{" "}
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ConnectWalletButton />
          <button
            type="button"
            className="btn btn-ghost w-11 px-0 md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span aria-hidden className="font-pixel text-sm leading-none">
              {open ? "X" : "≡"}
            </span>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t-2 border-line bg-panel md:hidden">
          <ul className="container-farm py-2">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href} className="border-b border-line last:border-0">
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-[48px] items-center gap-2 font-pixel text-[11px] uppercase ${
                      active ? "text-neon" : "text-ink"
                    }`}
                  >
                    <span aria-hidden className={active ? "" : "invisible"}>
                      ▸
                    </span>
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
