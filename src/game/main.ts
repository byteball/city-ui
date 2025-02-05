// import { Boot } from './scenes/Boot';
import appConfig from "@/appConfig";
import { Game } from "phaser";
import MapScene from "./scenes/MainScene";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1800,
  height: 1800,
  banner: appConfig.TESTNET,
  backgroundColor: "hsl(224 71% 4%)",
  resizeInterval: 1,
  render: {
    antialias: true,
    transparent: true,
  },
  scene: [MapScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent, scene: MapScene });
};

export default StartGame;

