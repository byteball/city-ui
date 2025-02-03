// import { Boot } from './scenes/Boot';
import { Game } from "phaser";
import MapScene from "./scenes/MainScene";

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 600, // Ширина видимой области
  height: 600, // Высота видимой области
  backgroundColor: "#030711",
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

