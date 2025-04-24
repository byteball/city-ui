import Phaser from "phaser";

import { ICity, IGameOptions } from "@/global";
import { useAaStore } from "@/store/aa-store";
import { mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import CameraController from "../controllers/CameraController";
import { Map as GameMap } from "../objects/Map";
import { getRoads } from "../utils/getRoads";

export default class MapScene extends Phaser.Scene {
  private map!: GameMap;
  private options: IGameOptions = { displayMode: "main" };

  constructor() {
    super("MapScene");
  }

  init(data: IGameOptions) {
    this.options = { ...this.options, ...data };
  }

  preload() {
    this.load.image("background", "assets/background.jpg");
    this.load.svg("plot", "assets/plot.svg", { width: 150, height: 150 });
    this.load.svg("house", "assets/house.svg", { width: 150, height: 150 });
    this.load.svg("road-vertical", "assets/road-vertical.svg", { width: 80, height: 80 });
    this.load.svg("road-horizontal", "assets/road-horizontal.svg", { width: 80, height: 80 });
  }

  create() {
    const state = useAaStore.getState();
    const mapUnits = mapUnitsSelector(state);
    const cityStats = state.state.city_city as ICity;

    if (!cityStats || !cityStats.mayor) throw new Error("City mayor not found");

    const roads = getRoads(mapUnits, String(cityStats.mayor));

    this.map = new GameMap(this, roads, mapUnits);

    this.map.createMap(this.options);
    this.setHousesOnTop(); // Устанавливаем дома поверх всех элементов после создания карты

    const unsubscribe = useAaStore.subscribe((newState) => {
      const mapUnits = mapUnitsSelector(newState);

      const cityStats = newState.state.city_city as ICity;

      if (!cityStats || !cityStats.mayor) throw new Error("City mayor not found");

      const roads = getRoads(mapUnits, String(cityStats.mayor));

      this.map.updateMapUnits(mapUnits);
      this.map.updateRoads(roads);
      this.setHousesOnTop(); // Устанавливаем дома поверх всех элементов после обновления карты
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => unsubscribe());

    new CameraController(this, this.cameras.main);
  }

  // Метод для установки высокого значения depth для всех домов
  private setHousesOnTop(): void {
    // Находим все объекты с текстурой "house" и устанавливаем для них высокое значение depth
    this.children.list
      .filter((obj) => obj instanceof Phaser.GameObjects.Image && obj.texture && obj.texture.key === "house")
      .forEach((house) => {
        (house as Phaser.GameObjects.Image).setDepth(1000);
      });
  }
}

