// src/objects/Map.ts

import { Decimal } from "decimal.js";
import Phaser from "phaser";

import { IEngineOptions, IMapUnit, IRoad } from "@/global";
import { asNonNegativeNumber, getAddressFromNearestRoad } from "@/lib";
import { useSettingsStore } from "@/store/settings-store";

import { NeighborLink } from "./NeighborLink";
import { Plot } from "./Plot";
import { Road } from "./Road";

import { getMapUnitSize } from "@/aaLogic/getMapUnitSize";
import { toast } from "@/hooks/use-toast";
import { House } from "./House";

import appConfig from "@/appConfig";
import { IMatch } from "@/lib/getMatches";
import { shouldDisplayUnit } from "@/lib/shouldDisplayUnit";
import { validateDisplayedUnits } from "@/lib/validateDisplayedUnits";

export const ROAD_THICKNESS = 60;

export class Map {
  private scene: Phaser.Scene;
  private roadsData: IRoad[];
  private unitsData: IMapUnit[];
  private totalSize: number;
  private selectedMapUnit: House | Plot | null = null;
  private MapUnits: (Plot | House)[] = [];
  private neighborLinks: NeighborLink[] = [];
  private engineOptions: IEngineOptions;
  private matches: globalThis.Map<number, IMatch>;

  constructor(scene: Phaser.Scene, roadsData: IRoad[], unitsData: IMapUnit[], matches: globalThis.Map<number, IMatch>) {
    this.scene = scene;
    this.roadsData = roadsData;
    this.unitsData = unitsData;
    this.matches = matches;

    if (unitsData.length === 0) {
      this.totalSize = 1; // Or handle empty data explicitly
    } else {
      this.totalSize = this.unitsData.reduce((sum, unit) => sum + getMapUnitSize(unit), 0);
    }
  }

  public createMap(options: IEngineOptions) {
    console.log('log: create map with options:', options);
    this.engineOptions = options;
    // 1) Calculate the total thickness of vertical and horizontal roads
    let totalVerticalThickness = 0;
    let totalHorizontalThickness = 0;

    this.roadsData.forEach((road) => {
      if (road.orientation === "vertical") {
        totalVerticalThickness += ROAD_THICKNESS;
      } else {
        totalHorizontalThickness += ROAD_THICKNESS;
      }
    });

    const BASE_MAP_SIZE = Decimal(1_000_000).mul(appConfig.MAP_SCALE);

    // 2) Base sizes 1,000,000 x 1,000,000
    const MAP_WIDTH = BASE_MAP_SIZE.plus(totalVerticalThickness).toNumber();
    const MAP_HEIGHT = BASE_MAP_SIZE.plus(totalHorizontalThickness).toNumber();


    // 3) Pass them to the functions that create roads and plots
    this.createRoads(MAP_WIDTH, MAP_HEIGHT);
    this.createMapUnits(MAP_WIDTH, MAP_HEIGHT, options.displayMode || "main");
    this.createNeighborLinks();
    this.updateMapUnitSelection();

    // Add click handler to clear selection when clicking on empty space
    this.scene.input.on(
      "pointerdown",
      (_pointer: Phaser.Input.Pointer, engineOptions: Phaser.GameObjects.GameObject[]) => {
        if (!engineOptions || engineOptions.length === 0) {
          if (this.selectedMapUnit) {
            this.selectedMapUnit.setSelected(false);
            this.selectedMapUnit = null;
          }
          if (this.engineOptions?.displayMode === "main") {
            useSettingsStore.getState().setSelectedMapUnit(null);
          } else if (this.engineOptions?.displayMode === "market") {
            useSettingsStore.getState().setSelectedMarketPlot(null);
          }
        }
      }
    );
  }

  private createRoads(mapWidth: number, mapHeight: number) {
    this.roadsData.forEach((roadData) => {
      const scaledData = {
        ...roadData,
        x: asNonNegativeNumber(Decimal(roadData.x).mul(appConfig.MAP_SCALE).toNumber()),
        y: asNonNegativeNumber(Decimal(roadData.y).mul(appConfig.MAP_SCALE).toNumber()),
      };

      new Road(this.scene, scaledData, mapWidth, mapHeight);
    });
  }

  private createMapUnits(MAP_WIDTH: number, MAP_HEIGHT: number, sceneType: IEngineOptions["displayMode"]) {
    const thickness = asNonNegativeNumber(ROAD_THICKNESS);

    if (!validateDisplayedUnits(this.engineOptions.displayedUnits, sceneType)) {
      throw new Error("Invalid displayedUnits for the current display mode");
    }

    this.unitsData.forEach((unitData) => {
      if (!shouldDisplayUnit(this.engineOptions, unitData)) return;

      const { x, y, type } = unitData;

      const totalAmount = getMapUnitSize(unitData);

      const plotFraction = (totalAmount / this.totalSize) * 0.1;

      const plotArea = plotFraction * MAP_WIDTH * MAP_HEIGHT;
      let plotSize = Math.sqrt(plotArea);

      // 2) Initial coordinates of the plot
      let finalX = asNonNegativeNumber(Decimal(x).mul(appConfig.MAP_SCALE).toNumber());
      let finalY = asNonNegativeNumber(Decimal(y).mul(appConfig.MAP_SCALE).toNumber());
      let overlapping = true;

      // Loop to find a non-overlapping position
      while (overlapping) {
        overlapping = false;
        const leftEdge = finalX - plotSize / 2;
        const rightEdge = finalX + plotSize / 2;
        const topEdge = finalY - plotSize / 2;
        const bottomEdge = finalY + plotSize / 2;

        // Check all roads
        for (const road of this.roadsData) {
          if (road.orientation === "vertical") {
            // use x coordinate of the road
            const roadStart = road.x;
            const roadEnd = road.x + thickness;

            if (rightEdge >= roadStart && leftEdge < roadEnd) {
              overlapping = true;
              break;
            }
          } else {
            // Horizontal road: use y coordinate of the road
            const roadStart = road.y;
            const roadEnd = road.y + thickness;

            if (bottomEdge >= roadStart && topEdge < roadEnd) {
              overlapping = true;
              break;
            }
          }
        }
      } // end while

      // creating new plot
      let unit: Plot | House;

      const [address] =
        unitData?.x !== undefined && unitData?.y !== undefined
          ? getAddressFromNearestRoad(
            this.roadsData,
            {
              x: unitData.x,
              y: unitData.y,
            },
            unitData.type === "house" ? unitData.house_num ?? 0 : unitData.plot_num ?? 0
          )
          : [];

      if (type === "house") {
        unit = new House(
          this.scene,
          { ...unitData, x: finalX, y: finalY },
          this.engineOptions?.displayMode && ["market", "claim", "followup"].includes(this.engineOptions?.displayMode),
          address
        );
      } else if (type === "plot") {

        let view = "plot";

        if (sceneType === "claim" && this.engineOptions?.displayedUnits?.[1]?.num === unitData.plot_num) {
          view = "plus";
        }

        unit = new Plot(
          this.scene,
          { ...unitData, x: finalX, y: finalY },
          plotSize,
          address,
          view
        );
      } else {
        throw new Error(`Unknown unit type: ${type}`);
      }

      this.MapUnits.push(unit);

      if (
        (sceneType === "market" && type === "house") ||
        sceneType === "claim" || sceneType === "followup"
      ) {
        return;
      }

      const unitImage = unit.getMapUnitImage();
      unitImage.setInteractive({ cursor: "pointer" });

      unitImage.on("pointerdown", () => {
        // Reset the selected plot if it was already selected
        if (this.selectedMapUnit) {
          this.selectedMapUnit.setSelected(false);
          this.selectedMapUnit = null;
        }

        this.selectedMapUnit = unit;
        unit.setSelected(true);
        const unitData = unit.getData();

        const { type } = unitData;

        if (this.engineOptions?.displayMode === "main") {
          useSettingsStore.getState().setSelectedMapUnit({
            num: asNonNegativeNumber(
              type === "plot" ? unitData.plot_num : (unitData.type === "house" && unitData.house_num) || 0
            ),
            type,
          });
        } else if (this.engineOptions?.displayMode === "market" && unitData.type === "plot") {
          useSettingsStore.getState().setSelectedMarketPlot({
            num: asNonNegativeNumber(unitData.plot_num || 0),
            type,
          });
        }
      });

      unitImage.on("pointerover", () => {
        this.scene.input.setDefaultCursor("pointer");
      });

      unitImage.on("pointerout", () => {
        this.scene.input.setDefaultCursor("default");
      });
    });
  }

  public updateMapUnitSelection() {
    const settingsState = useSettingsStore.getState();
    if (this.engineOptions?.displayMode === "followup") return;

    const storeSelected =
      this.engineOptions?.displayMode === "market" ? settingsState.selectedMarketPlot : settingsState.selectedMapUnit;

    if (!storeSelected) {
      // Reset selection if nothing is selected
      if (this.selectedMapUnit) {
        this.selectedMapUnit.setSelected(false);
        this.selectedMapUnit = null;
      }
      return;
    }

    // Find among created plots the one whose coordinates match the values from the store
    const foundMapUnit = this.MapUnits.find((plotOrHouse) => {
      const data = plotOrHouse.getData();

      return (
        (data.type === "plot" ? data.plot_num : data.house_num) === Number(storeSelected.num) &&
        data.type === storeSelected.type
      );
    });

    if (foundMapUnit) {
      // Reset selection of the previous unit if it exists
      if (this.selectedMapUnit && this.selectedMapUnit !== foundMapUnit) {
        this.selectedMapUnit.setSelected(false);
      }

      this.selectedMapUnit = foundMapUnit;
      foundMapUnit.setSelected(true);
    } else {
      toast({ title: "Selected map unit not found", variant: "destructive" });
    }
  }

  private createNeighborLinks() {
    // Check if scene is still valid
    if (!this.scene || !this.scene.add) {
      console.warn('Map: Scene is not available, skipping neighbor links creation');
      return;
    }

    // Clear existing links
    this.neighborLinks.forEach(link => link.destroy());
    this.neighborLinks = [];

    // Create a map of houses by plot numbers for quick lookup
    const housesByPlotNum = new globalThis.Map<number, House>();

    this.MapUnits.forEach(unit => {
      if (unit instanceof House) {
        const houseData = unit.getData();
        if (houseData.plot_num !== undefined) {
          housesByPlotNum.set(houseData.plot_num, unit);
        }
      }
    });

    // Go through all matches and create links
    this.matches.forEach((match, plotNum) => {
      const house1 = housesByPlotNum.get(plotNum);
      const house2 = housesByPlotNum.get(match.neighbor_plot);

      // Check that both houses exist and link is not yet created
      if (house1 && house2 && plotNum < match.neighbor_plot) {
        // Create link only once (check plotNum < match.neighbor_plot)
        const link = new NeighborLink(this.scene, house1, house2, match, 20, 0xff0000);
        this.neighborLinks.push(link);
      }
    });
  }

  updateRoads(roads: IRoad[]) {
    this.roadsData = roads;
  }

  updateMapUnits(unitData: IMapUnit[]) {
    this.unitsData = unitData;
  }

  updateMatches(matches: globalThis.Map<number, IMatch>) {
    this.matches = matches;
    // Recreate links when updating matches
    if (this.engineOptions) {
      this.createNeighborLinks();
    }
  }

  updateEngineOptions(newOptions: IEngineOptions) {
    this.engineOptions = {};

    this.destroyMapUnits();
    this.destroyNeighborLinks();

    this.createMap(newOptions);
  }

  private destroyMapUnits() {
    this.scene.children.list.forEach(child => {
      if (child instanceof Phaser.GameObjects.Image) {
        const texture = child.texture;
        if (texture && ['plot', 'house', 'plus', 'golden-plot', 'mayor-house'].includes(texture.key)) {
          child.destroy();
        }
      } else if (child instanceof Phaser.GameObjects.Graphics) {
        child.destroy();
      }
    });
    this.MapUnits = [];
  }

  private destroyNeighborLinks() {
    this.neighborLinks.forEach(link => {
      if (link && typeof link.destroy === 'function') {
        link.destroy();
      }
    });
    this.neighborLinks = [];
  }

  public getNeighborLinks(): NeighborLink[] {
    return this.neighborLinks;
  }
}

