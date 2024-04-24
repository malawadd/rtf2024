import { useGame } from "phaser-react-ui";
import React, { useState } from "react";

import { GameSettings, GameSettingsData, IGame } from "@type/game";
import { Setting } from "@game/scenes/system/interface/setting";

type Props = {
  type: GameSettings;
  data: GameSettingsData;
};

export const Param: React.FC<Props> = ({ type, data }) => {
  const game = useGame<IGame>();

  const [currentValue, setCurrentValue] = useState(game.settings[type]);

  const updateSetting = (value: string) => {
    game.updateSetting(type, value);
    setCurrentValue(value);
  };

  return (
    <Setting
      label={data.description}
      values={data.values}
      currentValue={currentValue}
      onChange={updateSetting}
    />
  );
};
