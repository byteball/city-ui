import Phaser from "phaser";

import { ICity, IEngineOptions } from "@/global";
import { useAaStore } from "@/store/aa-store";
import { mapUnitsSelector } from "@/store/selectors/mapUnitsSelector";
import CameraController from "../controllers/CameraController";
import { EventBus } from "../EventBus";
import { Map as GameMap } from "../objects/Map";
import { GoldenPlotPipeline } from "../pipelines/GoldenPlotPipeline";
import { HorizontalRoadPipeline } from "../pipelines/HorizontalRoadPipeline";
import { HousePipeline } from "../pipelines/HousePipeline";
import { MayorHousePipeline } from "../pipelines/MayorHousePipeline";
import { PlotPipeline } from "../pipelines/PlotPipeline";
import { PlusPipeline } from "../pipelines/PlusPipeline";
import { RoadPipeline } from "../pipelines/RoadPipeline";
import { VerticalRoadPipeline } from "../pipelines/VerticalRoadPipeline";
import { getRoads } from "../utils/getRoads";

const ASSET_VERSION = "v1"; // Update this version when assets change

export default class MapScene extends Phaser.Scene {
  private map!: GameMap;
  private roadPipeline!: RoadPipeline; // kept for backward compatibility (unused)
  private plusPipeline!: PlusPipeline;
  private verticalRoadPipeline!: VerticalRoadPipeline;
  private horizontalRoadPipeline!: HorizontalRoadPipeline;
  private plotPipeline!: PlotPipeline;
  private housePipeline!: HousePipeline;
  private goldenPlotPipeline!: GoldenPlotPipeline;
  private mayorHousePipeline!: MayorHousePipeline;
  private options: IEngineOptions = { displayMode: "main" };
  private isDestroyed: boolean = false;

  constructor() {
    super("MapScene");
  }

  init(data: IEngineOptions) {
    this.options = { ...this.options, ...data };
  }

  preload() {
    // Use absolute paths to correctly load assets regardless of current URL path
    this.load.svg("plot", "/assets/plot.svg" + `?${ASSET_VERSION}`, { width: 150, height: 150 });
    this.load.svg("plus", "/assets/plus.svg" + `?${ASSET_VERSION}`, { width: 150, height: 150 });
    this.load.svg("house", "/assets/house.svg" + `?${ASSET_VERSION}`, { width: 150, height: 150 });
    this.load.svg("road-vertical", "/assets/road-vertical.svg" + `?${ASSET_VERSION}`, { width: 180, height: 180 });
    this.load.svg("road-horizontal", "/assets/road-horizontal.svg" + `?${ASSET_VERSION}`, { width: 180, height: 180 });
    this.load.svg("mayor-house", "/assets/mayor-house.svg" + `?${ASSET_VERSION}`, { width: 215, height: 260 });
    this.load.svg("golden-plot", "/assets/golden-plot.svg" + `?${ASSET_VERSION}`, { width: 150, height: 150 });
  }

  create() {
    // register custom pipelines
    const renderer = this.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    if (renderer.pipelines) {
      this.plotPipeline = new PlotPipeline(this.game);
      this.housePipeline = new HousePipeline(this.game);
      this.goldenPlotPipeline = new GoldenPlotPipeline(this.game);
      this.mayorHousePipeline = new MayorHousePipeline(this.game);
      this.roadPipeline = new RoadPipeline(this.game); // unused generic pipeline
      this.verticalRoadPipeline = new VerticalRoadPipeline(this.game);
      this.horizontalRoadPipeline = new HorizontalRoadPipeline(this.game);
      this.plusPipeline = new PlusPipeline(this.game);

      renderer.pipelines.add('PlotPipeline', this.plotPipeline);
      renderer.pipelines.add('HousePipeline', this.housePipeline);
      renderer.pipelines.add('GoldenPlotPipeline', this.goldenPlotPipeline);
      renderer.pipelines.add('MayorHousePipeline', this.mayorHousePipeline);
      renderer.pipelines.add('RoadPipeline', this.roadPipeline);
      renderer.pipelines.add('VerticalRoadPipeline', this.verticalRoadPipeline);
      renderer.pipelines.add('HorizontalRoadPipeline', this.horizontalRoadPipeline);
      renderer.pipelines.add('PlusPipeline', this.plusPipeline);
    }

    const state = useAaStore.getState();
    const mapUnits = mapUnitsSelector(state);
    const cityStats = state.state.city_city as ICity;

    if (!cityStats || !cityStats.mayor) throw new Error("City mayor not found");

    const roads = getRoads(mapUnits, String(cityStats.mayor));

    this.map = new GameMap(this, roads, mapUnits);

    this.map.createMap(this.options);

    // Clear selection when reset-selection event is emitted from React
    EventBus.on("reset-selection", () => {
      if (!this.isDestroyed && this.map) {
        this.map.updateMapUnitSelection();
      }
    });

    const unsubscribe = useAaStore.subscribe((newState) => {
      // Skip updates if scene is destroyed or map doesn't exist
      if (this.isDestroyed || !this.scene || !this.add || !this.map) {
        return;
      }

      try {
        const mapUnits = mapUnitsSelector(newState);

        const cityStats = newState.state.city_city as ICity;

        if (!cityStats || !cityStats.mayor) throw new Error("City mayor not found");

        const roads = getRoads(mapUnits, String(cityStats.mayor));

        this.map.updateMapUnits(mapUnits);
        this.map.updateRoads(roads);

      } catch (error) {
        console.warn('Error updating map units, scene may be destroyed:', error);
        // Unsubscribe if we're getting errors due to destroyed scene
        unsubscribe();
      }
    });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.isDestroyed = true;
      unsubscribe();
      EventBus.off("reset-selection");
    });

    new CameraController(this, this.cameras.main);
  }

  private setHousesOnTop(): void {
    if (this.isDestroyed || !this.children) {
      return;
    }

    this.children.list
      .filter((obj) => obj instanceof Phaser.GameObjects.Image && obj.texture && obj.texture.key === "house")
      .forEach((house) => {
        (house as Phaser.GameObjects.Image).setDepth(1000);
      });
  }
}

