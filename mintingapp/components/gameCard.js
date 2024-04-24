import Link from "next/link";
import Image from "next/image";

export default function GameCard({ nameGame, imageGame, urlGame }) {
  return (
    <div className="p-5 border border-slate-600 rounded-md shadow-md shadow-slate-800/50">
      <div className="grid grid-cols-1 place-items-center gap-5">
       
          <a>
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white">
              {nameGame}
            </div>
          </a>
       

       
          <a>
            <Image
              src={imageGame}
              priority={true}
              width={300}
              height={300}
              alt={nameGame}
            />
          </a>
       

        <button
          className="flex justify-center items-center disabled:cursor-not-allowed space-x-3 verify-btn text-lg font-medium rounded-md px-5 py-3 w-full bg-gradient-to-r "
          onClick={urlGame}
        >
           <span> Mint NFT</span>
        </button>
          
            {/* <div className="flex justify-center items-center my-10">
              {urlGame}
            </div> */}
      </div>
    </div>
  );
}
