import React, { useMemo } from "react";

import { MenuPage } from "@type/menu";

import { About } from "./about";
import { Controls } from "./controls";
import { NewGame } from "./new-game";
import { Settings } from "./settings";
import { Wrapper } from "./styles";
import { PvpGame } from "./pvp-game";

type Props = {
  page: MenuPage;
};

export const Content: React.FC<Props> = ({ page }) => {
  const Component = useMemo(() => {
    switch (page) {
      case MenuPage.NEW_GAME:
        return <NewGame />;
      case MenuPage.PVP_GAME:
        return <PvpGame />;
      case MenuPage.SETTINGS:
        return <Settings />;
      case MenuPage.ABOUT_GAME:
        return <About />;
      case MenuPage.CONTROLS:
        return <Controls />;
    }
  }, [page]);

  return <Wrapper>{Component}</Wrapper>;
};
