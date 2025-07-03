import { Game } from "phaser";
import MapScene from "./scenes/MainScene";

import { IEngineOptions } from "@/global";

import appConfig from "@/appConfig";

//  Find out more information about the Map Engine Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.WEBGL,
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
  audio: {
    disableWebAudio: true,
    noAudio: true,
  },
  scene: MapScene,
};

const StartMapEngine = (parent: string, options: IEngineOptions = {}) => {
  if (!options.params) {
    throw new Error("Missing required 'params' in options. Unable to start the engine.");
  }

  const mapEngine = new Game({ ...config, parent });

  mapEngine.scene.start("MapScene", options);

  return mapEngine;
};

export default StartMapEngine;

