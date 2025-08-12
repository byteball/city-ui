import { isbot } from "isbot";
import { Game } from "phaser";
import MapScene from "./scenes/MainScene";

import { IEngineOptions } from "@/global";

import appConfig from "@/appConfig";

//  Find out more information about the Map Engine Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig

// Detect bot / limited rendering environment to allow graceful Canvas fallback.
const ua = typeof navigator !== 'undefined' ? navigator.userAgent : '';
const BOT_ENV = !!ua && isbot(ua);

const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

const config: Phaser.Types.Core.GameConfig = {
  // In bot/headless environments force AUTO so Phaser can fall back to Canvas if WebGL fails.
  type: BOT_ENV ? Phaser.AUTO : (isIOS ? Phaser.CANVAS : Phaser.WEBGL),
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
  // Don't fail in bot mode if only a software or degraded context is available.
  failIfMajorPerformanceCaveat: !BOT_ENV,
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

