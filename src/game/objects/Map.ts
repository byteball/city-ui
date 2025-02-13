// src/objects/Map.ts

import { Decimal } from "decimal.js";
import Phaser from "phaser";

import { IMapUnit, IRoad } from "@/global";
import { asNonNegativeNumber } from "@/lib/asNonNegativeNumber";
import { useSettingsStore } from "@/store/settings-store";

import { Plot } from "./Plot";
import { Road } from "./Road";

import appConfig from "@/appConfig";

export const ROAD_THICKNESS = 30;

export class Map {
  private scene: Phaser.Scene;
  private roadsData: IRoad[];
  private unitsData: IMapUnit[];
  private allCitySupply: number;
  private selectedMapUnit: Plot | null = null;

  constructor(scene: Phaser.Scene, roadsData: IRoad[], unitsData: IMapUnit[]) {
    this.scene = scene;
    this.roadsData = roadsData;
    this.unitsData = unitsData;
    this.allCitySupply = this.unitsData.reduce((sum, house) => sum + house.amount, 0);
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

    // 3) Передаём их в функции, создающие дороги и участки
    this.createRoads(MAP_WIDTH, MAP_HEIGHT);
    this.createPlots(MAP_WIDTH, MAP_HEIGHT);
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

  private createPlots(MAP_WIDTH: number, MAP_HEIGHT: number) {
    const thickness = asNonNegativeNumber(ROAD_THICKNESS);

    this.unitsData.forEach((unitData) => {
      // 1) Вычисляем размер участка
      const { amount, x, y } = unitData;
      const plotFraction = (amount / this.allCitySupply) * 0.1;
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
      const unit = new Plot(this.scene, { ...unitData, x: finalX, y: finalY }, plotSize);

      // Настраиваем интерактивность
      const unitImage = unit.getPlotImage();
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
}

