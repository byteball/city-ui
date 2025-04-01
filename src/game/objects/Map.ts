// src/objects/Map.ts

import { Decimal } from "decimal.js";
import Phaser from "phaser";

import { IMapUnit, IRoad } from "@/global";
import { asNonNegativeNumber } from "@/lib";
import { defaultAaParams, useAaStore } from "@/store/aa-store";
import { useSettingsStore } from "@/store/settings-store";

import { Plot } from "./Plot";
import { Road } from "./Road";

import { getMapUnitSize } from "@/aaLogic/getMapUnitSize";
import { toast } from "@/hooks/use-toast";
import { House } from "./House";

import appConfig from "@/appConfig";

export const ROAD_THICKNESS = 30;

export class Map {
  private scene: Phaser.Scene;
  private roadsData: IRoad[];
  private unitsData: IMapUnit[];
  private totalSize: number;
  private selectedMapUnit: Plot | House | null = null;
  private MapUnits: (Plot | House)[] = [];

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

  public createMap() {
    // 1) Считаем общую толщину вертикальных и горизонтальных дорог
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

    // 2) Базовые размеры 1 000 000 х 1 000 000
    const MAP_WIDTH = BASE_MAP_SIZE.plus(totalVerticalThickness).toNumber();
    const MAP_HEIGHT = BASE_MAP_SIZE.plus(totalHorizontalThickness).toNumber();

    this.scene.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

    // this.scene.add.rectangle(0, 0, MAP_WIDTH, MAP_HEIGHT, 0x282826).setOrigin(0).setDepth(-10);

    // 3) Передаём их в функции, создающие дороги и участки
    this.createRoads(MAP_WIDTH, MAP_HEIGHT);
    this.createMapUnits(MAP_WIDTH, MAP_HEIGHT);

    this.updatePlotSelection();
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

  private createMapUnits(MAP_WIDTH: number, MAP_HEIGHT: number) {
    const thickness = asNonNegativeNumber(ROAD_THICKNESS);
    const state = useAaStore.getState().state;

    const referralBoost = state.city_city?.referral_boost ?? state.variables?.referral_boost ?? defaultAaParams.referral_boost;

    this.unitsData.forEach((unitData) => {
      if (unitData.type === "plot" && unitData.status === "pending") return;

      // 1) Вычисляем размер участка
      const { x, y, type } = unitData;

      const totalAmount = getMapUnitSize(unitData);

      const plotFraction = (totalAmount / this.totalSize) * 0.1 * (1 + referralBoost); // TODO: fix 0.1 to params

      const plotArea = plotFraction * MAP_WIDTH * MAP_HEIGHT;
      const plotSize = Math.sqrt(plotArea);

      // 2) Начальная позиция
      let finalX = asNonNegativeNumber(Decimal(x).mul(appConfig.MAP_SCALE).toNumber());
      let finalY = asNonNegativeNumber(Decimal(y).mul(appConfig.MAP_SCALE).toNumber());
      let overlapping = true;

      // Цикл для поиска не пересекающейся позиции
      while (overlapping) {
        overlapping = false;
        const leftEdge = finalX - plotSize / 2;
        const rightEdge = finalX + plotSize / 2;
        const topEdge = finalY - plotSize / 2;
        const bottomEdge = finalY + plotSize / 2;

        // Проходим по всем дорогам
        for (const road of this.roadsData) {
          if (road.orientation === "vertical") {
            // Используем координату x дороги
            const roadStart = road.x;
            const roadEnd = road.x + thickness;

            if (rightEdge >= roadStart && leftEdge < roadEnd) {
              finalX = asNonNegativeNumber(finalX + thickness);
              overlapping = true;
              break;
            }
          } else {
            // Горизонтальная дорога: используем координату y дороги
            const roadStart = road.y;
            const roadEnd = road.y + thickness;

            if (bottomEdge >= roadStart && topEdge < roadEnd) {
              finalY = asNonNegativeNumber(finalY + thickness);
              overlapping = true;
              break;
            }
          }
        }
      } // конец while

      // Создаем новый участок (unit)
      let unit: Plot | House;

      if (type === "house") {
        unit = new House(this.scene, { ...unitData, x: finalX, y: finalY }, plotSize);
      } else if (type === "plot") {
        unit = new Plot(this.scene, { ...unitData, x: finalX, y: finalY }, plotSize);
      } else {
        throw new Error(`Unknown unit type: ${type}`);
      }

      // const
      this.MapUnits.push(unit);

      // Настраиваем интерактивность
      const unitImage = unit.getMapUnitImage();
      unitImage.setInteractive({ cursor: "pointer" });

      unitImage.on("pointerdown", () => {
        // Сбрасываем выбранный участок, если он уже был выбран
        if (this.selectedMapUnit) {
          this.selectedMapUnit.setSelected(false);
        }

        this.selectedMapUnit = unit;
        unit.setSelected(true);

        const { x, y } = unit.getData();

        useSettingsStore.getState().setSelectedMapUnit({
          x: asNonNegativeNumber(Decimal(x).div(appConfig.MAP_SCALE).toNumber()),
          y: asNonNegativeNumber(Decimal(y).div(appConfig.MAP_SCALE).toNumber()),
        });
      });

      unitImage.on("pointerover", () => {
        this.scene.input.setDefaultCursor("pointer");
      });

      unitImage.on("pointerout", () => {
        this.scene.input.setDefaultCursor("default");
      });
    });
  }

  // Метод для обновления выделения на основе состояния из SettingsState
  public updatePlotSelection() {
    const storeSelected = useSettingsStore.getState().selectedMapUnit;

    if (!storeSelected) {
      // Сбрасываем выделение, если ничего не выбрано
      if (this.selectedMapUnit) {
        this.selectedMapUnit.setSelected(false);
        this.selectedMapUnit = null;
      }
      return;
    }

    // Ищем среди созданных участков тот, у которого координаты совпадают со значениями из стора
    const foundPlot = this.MapUnits.find((plot) => {
      const data = plot.getData();
      return (
        Decimal(data.x).div(appConfig.MAP_SCALE).toNumber() === Number(storeSelected.x) &&
        Decimal(data.y).div(appConfig.MAP_SCALE).toNumber() === Number(storeSelected.y)
      );
    });

    if (foundPlot) {
      // Сбрасываем выделение предыдущего участка, если он есть
      if (this.selectedMapUnit && this.selectedMapUnit !== foundPlot) {
        this.selectedMapUnit.setSelected(false);
      }

      this.selectedMapUnit = foundPlot;
      foundPlot.setSelected(true);
    } else {
      toast({ title: "Selected map unit not found", variant: "destructive" });
      console.log("log(Map): Selected map unit not found", storeSelected);
    }
  }

  updateRoads(roads: IRoad[]) {
    this.roadsData = roads;
  }

  updateMapUnits(unitData: IMapUnit[]) {
    this.unitsData = unitData;
  }
}

