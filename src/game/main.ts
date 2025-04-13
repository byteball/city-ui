import { Game } from "phaser";
import MapScene from "./scenes/MainScene";

import { IGameOptions } from "@/global";

import appConfig from "@/appConfig";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1800,
  height: 1800,
  banner: appConfig.TESTNET,
  resizeInterval: 10,
  render: {
    antialias: true,
    transparent: true,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  failIfMajorPerformanceCaveat: true,
  fps: {
    target: 10,
  },
};

const StartGame = (parent: string, options: IGameOptions = {}) => {
  if (!options.params) return null;

  const dynamicConfig = { ...config, parent };
  // Remove scene from the initial config

  // Create the game instance without the scene initially
  const game = new Game({ ...dynamicConfig });

  // Add the scene manually and pass options data. The 'true' flag auto-starts the scene.
  game.scene.add("MapScene", MapScene, true, options);

  return game;
};

export default StartGame;

