import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Press_Start_2P } from "next/font/google";
import { MintProvider } from "@/components/MintProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { WalletProviders } from "@/components/wallet/WalletProviders";
import "./globals.css";

const pixel = Press_Start_2P({ weight: "400", subsets: ["latin"], variable: "--font-pixel", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL("https://farmed.example"),
  title: { default: "FARMED: Raise degens. Harvest $SOL.", template: "%s · FARMED" },
  description:
    "Burn 100,000 $FARMED to mint a random farm full of crypto-trader livestock. Every 10 minutes, creator fees are harvested and paid out in SOL to farm owners.",
  icons: { icon: "/logo-icon.png" },
  openGraph: {
    title: "FARMED",
    description: "You're not trading. You're being farmed. Might as well own the farm.",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["/og.png"] },
};

export const viewport: Viewport = {
  themeColor: "#0B0F0C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${pixel.variable} ${mono.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <WalletProviders>
          <MintProvider>
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
          </MintProvider>
        </WalletProviders>
      </body>
    </html>
  );
}
