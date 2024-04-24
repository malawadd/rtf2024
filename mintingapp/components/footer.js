import ViewSourceCode from "./viewSourceCode";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 mb-5 flex items-center justify-center space-x-5">
      <div>
        {/* <Link href="https://testnets.opensea.io/collection/nfttalent">
          <a className="text-white hover:underline">Collection on openSea</a>
        </Link> */}
      </div>
      {/* <div className="text-white ">&#8226;</div> */}
      <div>
      {/* <Link href="https://goerli.etherscan.io/address/0xd0a999db766c1a41db113f725a851eb3ea6a2b3a">
          <a className="text-white hover:underline">Contract Address</a>
        </Link> */}
      </div>
    </footer>
  );
}
