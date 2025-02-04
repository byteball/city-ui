// src/scenes/MapScene.ts
import Phaser from "phaser";

import { Map } from "../objects/Map";
import { HouseData } from "../objects/Plot";
import { RoadData } from "../objects/Road";

import CameraController from "../controllers/CameraController";
import { houses } from "./houses";

export default class MapScene extends Phaser.Scene {
  private housesData: HouseData[] = houses;

  private roadsData: RoadData[] = [
    {
      coordinate: 5000,
      name: "Tonych Avenue",
      avenue: true,
      orientation: "vertical",
    },
    {
      coordinate: 9000,
      name: "Obyte Avenue",
      avenue: true,
      orientation: "horizontal",
    },
    {
      coordinate: 2000,
      name: "Taump Street",
      avenue: false,
      orientation: "horizontal",
    },
  ];

  constructor() {
    super("MapScene");
  }

  preload() {
    // Загрузка ресурсов, если необходимо
    // TODO: Uncomment and configure properly if the bitmap font will be used.
    // this.load.bitmapFont('bitmapFont', 'path/to/font.png', 'path/to/font.fnt');
    this.load.svg("plot", "assets/plot.svg");
  }

  create() {
    // Создаем карту
    const map = new Map(this, this.roadsData, this.housesData);
    map.createMap();

    // Инициализируем контроллер камеры
    new CameraController(this, this.cameras.main);
  }
}

