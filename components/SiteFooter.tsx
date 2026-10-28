import Image from "next/image";
import Link from "next/link";
import { CONTRACT_ADDRESS, X_URL } from "@/lib/mock";
import { CopyButton } from "./CopyButton";
import { NAV } from "./nav";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t-2 border-line bg-bg/95">
      <div className="container-farm grid gap-10 py-12 md:grid-cols-[1.4fr_1fr]">
        <div className="min-w-0 space-y-5">
          <Image src="/logo-wordmark.png" alt="FARMED" width={140} height={55} className="pixelated" />
          <p className="max-w-md text-sm text-muted">
            You&apos;re not trading. You&apos;re being farmed. Might as well own the farm.
          </p>

          <div>
            <p className="eyebrow mb-2" id="ca-label">
              Contract address
            </p>
            <div className="flex min-w-0 items-stretch gap-2">
              <code
                aria-labelledby="ca-label"
                className="panel flex min-w-0 flex-1 items-center truncate px-3 py-2 text-xs text-ink"
                title={CONTRACT_ADDRESS}
              >
                {CONTRACT_ADDRESS}
              </code>
              <CopyButton value={CONTRACT_ADDRESS} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <nav aria-label="Footer">
            <p className="eyebrow mb-3">Site</p>
            <ul className="space-y-2 text-sm">
              {NAV.map((n) => (
                <li key={n.href}>
                  <Link href={n.href} className="text-ink hover:text-neon">
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="eyebrow mb-3">Social</p>
            <a
              href={X_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-ink hover:text-neon"
            >
              <span aria-hidden className="font-pixel text-xs">
                X
              </span>
              Follow on X<span className="sr-only"> (opens in new tab)</span>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t-2 border-line">
        <p className="container-farm py-6 text-xs leading-relaxed text-muted">
          <strong className="text-barn-ink">Risk disclaimer:</strong> $FARMED is a memecoin with no intrinsic value
          and no expectation of financial return. Burning tokens is irreversible. Harvest payouts depend entirely on
          trading volume and can drop to zero. Nothing here is financial advice. You can lose everything you put in, so
          budget accordingly. Not available where prohibited.
        </p>
      </div>
    </footer>
  );
}
