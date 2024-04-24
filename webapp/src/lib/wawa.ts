// @ts-nocheck
import { useQuery } from "wagmi";
import { parseAbiItem } from "viem";
import { FactionId, PetId, Tier, Swatch, Metadata, Wawa } from "@type/wawa";
import { client } from "./wagmi";

const wawaNftAddress = "0xAe467A4CfCe5310C50E2b2A1ad30768A02155fAC" as const;
// const wawaNftABI = [
//   {
//     inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
//     name: "getAeonInfo",
//     outputs: [
//       {
//         components: [
//           {
//             components: [
//               { internalType: "uint8", name: "headwear", type: "uint8" },
//               { internalType: "uint8", name: "eyes", type: "uint8" },
//               { internalType: "uint8", name: "chest", type: "uint8" },
//               { internalType: "uint8", name: "legs", type: "uint8" },
//             ],
//             internalType: "struct Trait",
//             name: "trait",
//             type: "tuple",
//           },
//           { internalType: "string", name: "tokenURI", type: "string" },
//           { internalType: "enum Faction", name: "faction", type: "uint8" },
//           { internalType: "uint8", name: "petId", type: "uint8" },
//           { internalType: "bytes32", name: "gene", type: "bytes32" },
//         ],
//         internalType: "struct Wawa",
//         name: "",
//         type: "tuple",
//       },
//     ],
//     stateMutability: "view",
//     type: "function",
//   },
// ] as const;

const wawaNftABI = [
  {
    inputs: [{ internalType: "uint256", name: "tokenId", type: "uint256" }],
    name: "getAeonInfo",
    outputs: [
      {
        components: [
          {
            components: [
              { internalType: "string", name: "headwear", type: "string" },
              { internalType: "string", name: "eyes", type: "string" },
              { internalType: "string", name: "chest", type: "string" },
              { internalType: "string", name: "legs", type: "string" },
              // Assuming additional components based on the original ABI
              { internalType: "string", name: "bodySwatch", type: "string" },
              { internalType: "string", name: "headwearSwatch", type: "string" },
              { internalType: "string", name: "eyesSwatch", type: "string" },
              { internalType: "string", name: "chestSwatch", type: "string" },
              { internalType: "string", name: "legsSwatch", type: "string" },
              { internalType: "string", name: "petSwatch", type: "string" }
            ],
            internalType: "struct Trait", // Adjust this to the actual internal struct name
            name: "trait",
            type: "tuple",
          },
          { internalType: "string", name: "tokenURI", type: "string" },
          { internalType: "enum Faction", name: "faction", type: "uint8" }, // Adjust this to the actual enum name
          { internalType: "uint8", name: "petId", type: "uint8" },
          { internalType: "bytes32", name: "gene", type: "bytes32" },
        ],
        internalType: "struct Wawa", // Adjust this to the actual internal struct name
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

async function getCurrentBlockNumber() {
  try {
    return await client.getBlockNumber();
  } catch (error) {
    console.error("Error fetching current block number:", error);
    return null;
  }
}


const filter = async (from?: `0x${string}`, to?: `0x${string}`, fromBlock?: BigInt, toBlock?: BigInt) => {
  if (!fromBlock) {
    
    let currentBlockNumber = await getCurrentBlockNumber();
    // currentBlockNumber = currentBlockNumber.toString().slice(0, -1); // Remove the 'n' character
    fromBlock = BigInt(currentBlockNumber.toString() - 8000);
    // fromBlock = BigInt(currentBlockNumber - 1000);
    console.log("currentBlockNumber" , currentBlockNumber)
    console.log("fromBlock" , fromBlock)
  }
  if (!toBlock) {
    toBlock = BigInt(await getCurrentBlockNumber());
    console.log("toBlock" , toBlock)
  }

  return {
    address: wawaNftAddress,
    event: parseAbiItem([
      "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
    ]),
    fromBlock: fromBlock,
    toBlock: toBlock,
    args: { from, to },
  };
};



// const filter = (from?: `0x${string}`, to?: `0x${string}`) => ({ 
  
//   address: wawaNftAddress,
//   event: parseAbiItem([
//     "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
//   ]),
//   fromBlock: BigInt(3111447),300686
//   // todo: set toBlock after mint period
//   args: { from, to },
  
// });

export const getERC721TokenIds = async (
  address: `0x${string}`
): Promise<number[]> => {
  const currentBlockNumber = await getCurrentBlockNumber();
console.log("currentBlockNumber", currentBlockNumber)
  console.log("query getERC721TokenIds")
  // const sentLogs = await client.getLogs(filter(address, undefined));
 const  fromBlock = BigInt(currentBlockNumber.toString() - 8000);
 const toBlock = BigInt(await getCurrentBlockNumber());
  console.log("query send logs")
  console.log("address", address)
  const sentLogs = await client.getLogs({  
    address: wawaNftAddress,
    event: parseAbiItem([
          "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
         ]),
    args: {
      from: address,
      to: undefined
    },
    fromBlock: fromBlock,
  });

  console.log("sentLogs",sentLogs)
  // const receivedLogs = await client.getLogs(filter(undefined, address));

  const receivedLogs = await client.getLogs({  
    address: wawaNftAddress,
    event: parseAbiItem([
          "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
         ]),
    args: {
      from: undefined,
      to: address
    },
    fromBlock: fromBlock,
  });


  console.log("receivedLogs",receivedLogs)
  // @ts-ignore
  const logs = sentLogs
    .concat(receivedLogs)
    .sort((a, b) => Number(a.blockNumber - b.blockNumber));



  const owned = new Set<number>();
  console.log(owned)
  for (const {
    args: { from, to, tokenId },
  } of logs) {
    if (!(from && to && tokenId)) continue;

    if (to.toLowerCase() === address.toLowerCase()) {
      owned.add(Number(tokenId.toString()));
    } else if (from.toLowerCase() === address.toLowerCase()) {
      owned.delete(Number(tokenId.toString()));
    }
  }
  console.log("getOwned", Array.from(owned))

  return Array.from(owned);
};

export async function getMetadata(tokenURI: string): Promise<Metadata> {
  console.log("query metadata")
  const metadata = (await (await fetch("https://bafkreidrxvhsldtk6j5f3gfwstoiuwzo35y2mdtvoqkllzzko3fjfmtxb4.ipfs.nftstorage.link")).json()) as {
    name: string;
    description: string;
    attributes: { trait_type: string; value: string | string[] }[];
    properties: { files: { uri: string; type: string }[]; category: string };
    image: string;
  };
  console.log("return metadata", metadata)
  return {
    name: metadata.name,
    image: {
      x1: metadata.properties.files[2].uri,
      x10: metadata.properties.files[1].uri,
      x10bg: metadata.properties.files[0].uri,
    },
    swatches: {
      body: metadata.attributes[6].value as Swatch,
      headwear: metadata.attributes[7].value as Swatch,
      eyes: metadata.attributes[8].value as Swatch,
      chest: metadata.attributes[9].value as Swatch,
      legs: metadata.attributes[10].value as Swatch,
      pet: metadata.attributes[11].value as Swatch,
    },
    gene: metadata.attributes[12].value as `0x${string}}`,
  };
}

export async function getWawa(tokenId: number): Promise<Wawa> {
  console.log("query getWawa")
  console.log("query tokenId",tokenId )
  const res = await client.readContract({
    address: wawaNftAddress,
    abi: wawaNftABI,
    functionName: "getAeonInfo",
    args: [BigInt(tokenId)],
  });
  console.log("accountData", res)
  return {
    tokenId,
    factionId: res.faction as FactionId,
    petId: res.petId as PetId,
    tiers: {
      headwear: res.trait.headwear as Tier,
      eyes: res.trait.eyes as Tier,
      chest: res.trait.chest as Tier,
      legs: res.trait.legs as Tier,
    },
    ...(await getMetadata(res.tokenURI)),
  };
}

export const useOwnedWawas = (address?: `0x${string}`) => {
  console.log("query useOwnedWawas")
  const { data, isFetched } = useQuery(
    ["owned-wawas", address],
    async () => {
      if (!address) return [];
      const tokenIds = await getERC721TokenIds(address);
      return Promise.all(tokenIds.map((tokenId) => getWawa(tokenId)));
    },
    { initialData: [] }
  );

  return { data, isFetched };
};
