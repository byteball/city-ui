import Phaser from "phaser";

import { ICity } from "@/global";
import { useAaStore } from "@/store/aa-store";
import { mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import CameraController from "../controllers/CameraController";
import { Map as GameMap } from "../objects/Map";
import { getRoads } from "../utils/getRoads";
export default class MapScene extends Phaser.Scene {
  private map!: GameMap;

  constructor() {
    super("MapScene");
  }

  preload() {
    this.load.svg("plot", "assets/plot.svg", { width: 150, height: 150 });

    this.load.svg("road-vertical", "assets/road-vertical.svg", { width: 30, height: 50 });
    this.load.svg("road-horizontal", "assets/road-horizontal.svg", { width: 50, height: 30 });
  }

  create() {
    const state = useAaStore.getState();
    const mapUnits = mapUnitsSelector(state);
    const cityStats = state.state.city_city as ICity;

    if (!cityStats || !cityStats.mayor) throw new Error("City mayor not found");

    const roads = getRoads(mapUnits, String(cityStats.mayor));

    this.map = new GameMap(this, roads, mapUnits);

    this.map.createMap();

    const unsubscribe = useAaStore.subscribe((newState) => {
      const mapUnits = mapUnitsSelector(newState);

      const cityStats = newState.state.city_city as ICity;

      if (!cityStats || !cityStats.mayor) throw new Error("City mayor not found");

      const roads = getRoads(mapUnits, String(cityStats.mayor));

      this.map.updateMapUnits(mapUnits);
      this.map.updateRoads(roads);
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => unsubscribe());

    new CameraController(this, this.cameras.main);
  }
}

