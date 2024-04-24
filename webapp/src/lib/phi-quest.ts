import { parseAbiItem } from "viem";
import { polygonClient } from "./wagmi";

const phiClaimAddress = "0xD0a999DB766c1a41Db113f725a851eb3ea6A2b3a" as const;

const filter = (address?: `0x${string}`) => ({
  address: phiClaimAddress,
  event: parseAbiItem(["event LogClaimObject(address indexed sender, uint256 tokenid)"]),
  fromBlock: BigInt(35196288),
  args: { sender: address },
});

export async function getAchievedPhiQuestIds(address: `0x${string}`) {
  const logs = await polygonClient.getLogs(filter(address));
  return logs.map(({ args: { tokenid } }) => Number(tokenid));
}
