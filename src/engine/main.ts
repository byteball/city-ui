import { Game } from "phaser";
import MapScene from "./scenes/MainScene";

import { IEngineOptions } from "@/global";

import appConfig from "@/appConfig";

//  Find out more information about the Map Engine Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1800,
  height: 1800,
  banner: !!appConfig.TESTNET,
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
    target: 60,
  },
};

const StartMapEngine = (parent: string, options: IEngineOptions = {}) => {
  if (!options.params) {
    throw new Error("Missing required 'params' in options. Unable to start the engine.");
  }

  const dynamicConfig = { ...config, parent };
  // Remove scene from the initial config

  // Create the engine instance without the scene initially
  const mapEngine = new Game({ ...dynamicConfig });

  // Add the scene manually and pass options data. The 'true' flag auto-starts the scene.
  mapEngine.scene.add("MapScene", MapScene, true, options);

  return mapEngine;
};

export default StartMapEngine;

