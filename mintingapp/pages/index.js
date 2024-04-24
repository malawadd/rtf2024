import GameList from "../components/gameList";

export default function Home() {
  return (
    <div>
      <div className="flex justify-center items-center">
      <span className="flex justify-center items-center mb-10 text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-tl from-slate-300 via-cyan-100 to-white">
      Survival NFT minter
      </span>
      </div>
      <div>
        <GameList />
      </div>
    </div>
  );
}
