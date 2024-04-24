import Header from "./header";
import Footer from "./footer";
import Head from "next/head";
import Script from "next/script";
import { Provider as WagmiProvider } from "wagmi";
import { providers } from "ethers";

import networks from "../utils/networks.json";

// Provider that will be used when no wallet is connected (aka no signer)
const provider = providers.getDefaultProvider(
  networks[networks.selectedChain].rpcUrls[0]
);

export default function Layout({ children }) {
  return (
    <>
      <Head>
        <link rel="icon" href="/logo.png" />
        <link rel="apple-touch-icon" href="/logo.png" />
        <title>Survival NFT minter</title>
        <meta name="title" content="Survival NFT minter" />
        <meta name="description" content="Survival NFT minter " />
        <meta name="theme-color" content="#ea580c" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https:app" />
        <meta property="twitter:title" content="Survival NFT minter" />
        <meta
          property="twitter:description"
          content="Survival NFT minter"
        />

        {/* Open Graph */}
        <meta property="og:type" content="website" key="ogtype" />
        <meta
          property="og:image"
          content="https:app"
          key="ogimage"
        />
        <meta property="og:title" content="NFT" key="ogtitle" />
        <meta
          property="og:description"
          content="NFT"
          key="ogdesc"
        />
      </Head>
      <WagmiProvider autoConnect provider={provider}>
        <div className="flex flex-col min-h-screen px-2 bg-[#1b1d0c] text-slate-300">
          <Header />
          <main className="mb-auto">{children}</main>
          <Footer />
        </div>
      </WagmiProvider>
    </>
  );
}
