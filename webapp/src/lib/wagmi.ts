import "wagmi/window";
import { createConfig, Chain  } from "wagmi";
import { createPublicClient, http } from "viem";
import { mainnet, polygon } from "viem/chains";
import { getDefaultConfig } from "connectkit";

const alchemyId = process.env.ALCHEMY_API_KEY;
const alchemyPolygonId = process.env.ALCHEMY_POLYGON_API_KEY;
const walletConnectProjectID = "6c37429d912cb97065107c0f849bc879";

const rtftestnet: Chain = {
  id: 22999, // Chain ID
  name: 'RTF Network',
  network: 'RTF Network',
  nativeCurrency: {
    name: 'RTF',
    symbol: 'RTF', // Currency Symbol
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://rpc-testnet.rtfight.com'] } ,
    public: { http: ['https://rpc-testnet.rtfight.com'] } // Include the public key if required by the Chain type
  },
  testnet: true,
};

const wagmiConfig = createConfig(
  getDefaultConfig({
    alchemyId,
    walletConnectProjectId: walletConnectProjectID,
    appName: "Survival",
    appDescription: "Isometric game. Build and Defence in the onchain crypto world",
    appUrl: "",
    appIcon: "",
    chains: [rtftestnet]
    
  }),
);

const client = createPublicClient({
  chain: rtftestnet,
  transport: http("https://rpc-testnet.rtfight.com")
});

const polygonClient = createPublicClient({
  chain: polygon,
  transport: http("https://rpc-testnet.rtfight.com")
})

export { client, polygonClient, wagmiConfig };
