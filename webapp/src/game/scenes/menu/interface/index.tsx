import React, { useState, useEffect } from "react";

import { Overlay } from "@game/scenes/system/interface/overlay";
import { WalletProvider } from "@scene/wallet-provider";
import { MenuPage } from "@type/menu";
import { SCORE_RECORD_ENDPOINT } from "@const/analytics";
import { Content } from "./content";
import { Copyright } from "./copyright";
import { Navigation } from "./navigation";
import {
  Wrapper,
  Logotype,
  Header,
  Block,
  Main,
  Menu,
  Title,
  Link,
  GifImage,
  WawaBlock,
  RankingContainer,
  RankingItem,
  RankingList,
  RankingTitle,
  SmallText,
  FactionText,
} from "./styles";

type Props = {
  defaultPage?: MenuPage;
};

type RankingItem = {
  address: string;
  tokenId: string;
  faction: string;
  score: number;
};

export const MenuUI: React.FC<Props> = ({ defaultPage }) => {
  const [page, setPage] = useState(defaultPage ?? MenuPage.NEW_GAME);
  const [rankingData, setRankingData] = useState<RankingItem[] | null>(null);
  const getEmojiForRank = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      case 4:
        return "🏅";
      case 5:
        return "🎖️";
      default:
        return "";
    }
  };
  useEffect(() => {
    if (SCORE_RECORD_ENDPOINT) {
      fetch(SCORE_RECORD_ENDPOINT)
        .then((response) => response.json())
        .then((data) => setRankingData(data))
        .catch((error) => console.error("Error fetching data: ", error));
    }
  }, []);

  return (
    <Overlay>
      <Wrapper>
        <Header>
          <Block>
            <Logotype src="assets/logotype.png" />
            <Title>Survival</Title>
            <Copyright />
          </Block>
        </Header>

        <WawaBlock href="http://localhost:3001/" target="_blank">
          <GifImage src="assets/aeonNFT_b.png" alt="aeonNFT_b" />
          <Link>Mint Survival NFT from here</Link>
        </WawaBlock>

        <WalletProvider>
          <Menu>
            <Block centerContent>
              <Navigation page={page} onSelect={setPage} />
            </Block>
          </Menu>

          <Main>
            <Block>
              <Content page={page} />
            </Block>
          </Main>
        </WalletProvider>
        {rankingData && page == MenuPage.NEW_GAME ? (
          <Main>
            <RankingContainer>
              <RankingTitle>Top Rankings</RankingTitle>
              <RankingList>
                {rankingData.map((item: any, index: any) => (
                  <RankingItem key={index}>
                    {getEmojiForRank(index + 1)} Rank {index + 1}:{" "}
                    <SmallText>{item.address}</SmallText>, Score:{" "}
                    <SmallText>{item.score}</SmallText>, TokenID: #
                    {item.tokenId}, Faction:{" "}
                    <FactionText faction={item.faction}>
                      {item.faction}
                    </FactionText>
                  </RankingItem>
                ))}
              </RankingList>
            </RankingContainer>
          </Main>
        ) : null}
      </Wrapper>
    </Overlay>
  );
};

MenuUI.displayName = "MenuUI";
