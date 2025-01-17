import { Boot } from './scenes/Boot';
import MainScene from './scenes/MainScene';
import { AUTO, Game } from 'phaser';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    backgroundColor: '#fff',
    scene: [
        MainScene,
    ]
};

const StartGame = (parent: string) => {
    return new Game({ ...config, parent, scene: MainScene });
}

export default StartGame;
