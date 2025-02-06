// src/scenes/MapScene.ts
import Phaser from "phaser";

import { Map } from "../objects/Map";
import { HouseData } from "../objects/Plot";
import { RoadData } from "../objects/Road";

import { plotSelector, useAaStore } from "@/store/aa-store";
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
    this.load.svg("plot", "assets/plot.svg", { width: 50, height: 50 });

    this.load.svg("road-vertical", "assets/road-vertical.svg", { width: 30, height: 50 });
    this.load.svg("road-horizontal", "assets/road-horizontal.svg", { width: 50, height: 30 });
  }

  create() {
    // Создаем карту
    const map = new Map(this, this.roadsData, this.housesData);
    map.createMap();

    // Инициализируем контроллер камеры
    new CameraController(this, this.cameras.main);
  }
}

