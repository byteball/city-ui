// src/objects/Map.ts

import { Decimal } from "decimal.js";
import Phaser from "phaser";

import { IGameOptions, IMapUnit, IRoad } from "@/global";
import { asNonNegativeNumber, getAddressFromNearestRoad } from "@/lib";
import { useSettingsStore } from "@/store/settings-store";

import { Plot } from "./Plot";
import { Road } from "./Road";

import { getMapUnitSize } from "@/aaLogic/getMapUnitSize";
import { toast } from "@/hooks/use-toast";
import { House } from "./House";

import appConfig from "@/appConfig";

export const ROAD_THICKNESS = 80;

export class Map {
  private scene: Phaser.Scene;
  private roadsData: IRoad[];
  private unitsData: IMapUnit[];
  private totalSize: number;
  private selectedMapUnit: House | Plot | null = null;
  private MapUnits: (Plot | House)[] = [];
  private gameOptions: IGameOptions | null = null;

  constructor(scene: Phaser.Scene, roadsData: IRoad[], unitsData: IMapUnit[]) {
    this.scene = scene;
    this.roadsData = roadsData;
    this.unitsData = unitsData;

    if (unitsData.length === 0) {
      this.totalSize = 1; // Or handle empty data explicitly
    } else {
      this.totalSize = this.unitsData.reduce((sum, unit) => sum + getMapUnitSize(unit), 0);
    }
  }

  public createMap(options: IGameOptions) {
    this.gameOptions = options;
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

    this.scene.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // 3) Pass them to the functions that create roads and plots
    this.createRoads(MAP_WIDTH, MAP_HEIGHT);
    this.createMapUnits(MAP_WIDTH, MAP_HEIGHT, options.displayMode || "main");
    this.updateMapUnitSelection();
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

  private createMapUnits(MAP_WIDTH: number, MAP_HEIGHT: number, sceneType: IGameOptions["displayMode"]) {
    const thickness = asNonNegativeNumber(ROAD_THICKNESS);

    this.unitsData.forEach((unitData) => {
      if (unitData.type === "plot" && unitData.status === "pending") return;

      if (this.gameOptions?.displayMode === "claim") {
        if (unitData.type === "plot" && !this.gameOptions.claimNeighborPlotNumbers?.includes(unitData.plot_num)) return;
      }

      if (sceneType === "market" && !(unitData.type === "plot" ? unitData.sale_price : true)) return; // Only plots with sale price

      const { x, y, type } = unitData;

      const totalAmount = getMapUnitSize(unitData);

      const plotFraction = (totalAmount / this.totalSize) * 0.1;

      const plotArea = plotFraction * MAP_WIDTH * MAP_HEIGHT;
      const plotSize = Math.sqrt(plotArea);

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
              finalX = asNonNegativeNumber(finalX + thickness);
              overlapping = true;
              break;
            }
          } else {
            // Horizontal road: use y coordinate of the road
            const roadStart = road.y;
            const roadEnd = road.y + thickness;

            if (bottomEdge >= roadStart && topEdge < roadEnd) {
              finalY = asNonNegativeNumber(finalY + thickness);
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
        const houseFraction = ((this.gameOptions?.params?.plot_price ?? 0) / this.totalSize) * 0.1;
        const houseArea = houseFraction * MAP_WIDTH * MAP_HEIGHT;
        const houseSize = Math.sqrt(houseArea);

        unit = new House(
          this.scene,
          { ...unitData, x: finalX, y: finalY },
          houseSize,
          this.gameOptions?.displayMode && ["market", "claim"].includes(this.gameOptions?.displayMode),
          address
        );
      } else if (type === "plot") {
        unit = new Plot(this.scene, { ...unitData, x: finalX, y: finalY }, plotSize, address);
      } else {
        throw new Error(`Unknown unit type: ${type}`);
      }

      this.MapUnits.push(unit);

      if (
        (this.gameOptions?.displayMode === "market" && type === "house") ||
        this.gameOptions?.displayMode === "claim"
      ) {
        return;
      }

      const unitImage = unit.getMapUnitImage();
      unitImage.setInteractive({ cursor: "pointer" });

      unitImage.on("pointerdown", () => {
        // Reset the selected plot if it was already selected
        if (this.selectedMapUnit) {
          this.selectedMapUnit.setSelected(false);
        }

        this.selectedMapUnit = unit;
        unit.setSelected(true);
        const unitData = unit.getData();

        const { type } = unitData;

        if (this.gameOptions?.displayMode === "main") {
          useSettingsStore.getState().setSelectedMapUnit({
            num: asNonNegativeNumber(
              type === "plot" ? unitData.plot_num : (unitData.type === "house" && unitData.house_num) || 0
            ),
            type,
          });
        } else if (this.gameOptions?.displayMode === "market" && unitData.type === "plot") {
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

    const storeSelected =
      this.gameOptions?.displayMode === "market" ? settingsState.selectedMarketPlot : settingsState.selectedMapUnit;

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

  updateRoads(roads: IRoad[]) {
    this.roadsData = roads;
  }

  updateMapUnits(unitData: IMapUnit[]) {
    this.unitsData = unitData;
  }
}

