# FARMED

Next.js 14 (App Router) + TypeScript + Tailwind.

```bash
npm install
npm run dev
```

## Wallet

Solana wallet connection on mainnet-beta. Installed wallets that implement the
[Wallet Standard](https://github.com/wallet-standard/wallet-standard) (Phantom,
OKX Wallet, Solflare, Backpack, …) are detected automatically, so no
per-wallet adapter packages are installed. On Android Chrome, the Mobile Wallet
Adapter is added automatically too.

### Install

```bash
npm install @solana/web3.js@^1.99.0 @solana/wallet-adapter-react @solana/wallet-adapter-base
```

`@solana/web3.js` is pinned to v1 because the wallet adapter packages need it as a peer dependency.

### Environment

| Variable              | Required    | Notes                                                                                   |
| --------------------- | ----------- | --------------------------------------------------------------------------------------- |
| `NEXT_PUBLIC_RPC_URL` | Recommended | Mainnet RPC endpoint. Falls back to `clusterApiUrl("mainnet-beta")` (rate-limited). |

Copy `.env.example` to `.env.local` and fill it in. The value ships to the browser, so use a key that's
restricted to your domain.

### Files

| File                                       | Role                                                                   |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| `components/wallet/WalletProviders.tsx`    | Connection + wallet providers (autoConnect), renders the modal once    |
| `components/wallet/ConnectWalletButton.tsx`| Header button and connected dropdown (presentation only)               |
| `components/wallet/WalletModal.tsx`        | Wallet picker (presentation only)                                      |
| `hooks/useFarmedWallet.ts`                 | All wallet state: `useFarmedWallet()` and `useWalletOptions()`         |
| `lib/wallet.ts`                            | Pure helpers: wallet catalogue, deep links, error copy, sign-in message |

Use it anywhere under the layout:

```tsx
const { publicKey, address, shortAddress, connected, connecting, solBalance, connect, disconnect } =
  useFarmedWallet();
// connect() opens the picker; connect("Phantom") connects directly.
```

The SOL balance refreshes on connect, every 30 s while the tab is visible, and on `refreshBalance()`.

**Sign in** (optional, in the connected dropdown) asks the wallet to sign a plain-text message with a
random nonce. The signature is kept in memory only. **TODO:** it isn't verified by a server yet, so
nothing should be gated on it.

The site never asks for or handles private keys or seed phrases.

### Testing

**Desktop (Chrome / Brave / Edge)**

1. Install the [Phantom](https://phantom.com/) and/or [OKX Wallet](https://www.okx.com/web3) extension and create or import a wallet.
2. `npm run dev`, open http://localhost:3000, and click **Connect Wallet**.
3. Both wallets should appear at the top marked **Detected**, with their own icons. Wallets you haven't installed show **Install**.
4. Pick one, approve the request, and the button should show `7xKX…a9Fp` plus your SOL balance.
5. Check: reject the request in the wallet (a friendly error appears in the modal), reload the page (it reconnects
   automatically), use **Change wallet** to switch, **Sign in**, then **Disconnect** (a reload should stay disconnected).

**Mobile (iOS / Android)**

Mobile browsers have no wallet extensions, so test on an HTTPS URL your phone can reach. `localhost` won't
work. Deploy a preview, or tunnel your dev server, e.g. `npx localtunnel --port 3000` or `ngrok http 3000`.

1. Open the URL in Safari or Chrome. The modal should show **Open in Phantom** and **Open in OKX Wallet**.
2. Tap one. The wallet app opens FARMED in its in-app browser, where the wallet is now **Detected**. Connect there.
3. You can also open the URL directly from the browser tab inside Phantom or OKX Wallet.
4. On Android Chrome, **Mobile Wallet Adapter** also appears and connects to an installed wallet app without leaving Chrome.
