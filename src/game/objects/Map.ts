// src/objects/Map.ts
import Phaser from "phaser";
import { HouseData, Plot } from "./Plot";
import { Road, RoadData } from "./Road";

export const AVENUE_THICKNESS = 120;
export const STREET_THICKNESS = 60;

export class Map {
    private scene: Phaser.Scene;
    private roadsData: RoadData[];
    private housesData: HouseData[];
    private allCitySupply: number;
    private selectedPlot: Plot | null = null;

    constructor(scene: Phaser.Scene, roadsData: RoadData[], housesData: HouseData[]) {
        this.scene = scene;
        this.roadsData = roadsData;
        this.housesData = housesData;
        this.allCitySupply = this.housesData.reduce((sum, house) => sum + house.amount, 0);
    }

    public createMap() {
        // 1) Считаем общую толщину вертикальных и горизонтальных дорог
        let totalVerticalThickness = 0;
        let totalHorizontalThickness = 0;

        this.roadsData.forEach((road) => {
            const thickness = road.avenue ? AVENUE_THICKNESS : STREET_THICKNESS;
            if (road.orientation === "vertical") {
                totalVerticalThickness += thickness;
            } else {
                totalHorizontalThickness += thickness;
            }
        });

        // 2) Базовые размеры 10 000 х 10 000
        const MAP_WIDTH = 10000 + totalVerticalThickness;
        const MAP_HEIGHT = 10000 + totalHorizontalThickness;

        this.scene.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

        // 3) Передаём их в функции, создающие дороги и участки
        this.createRoads(MAP_WIDTH, MAP_HEIGHT);
        this.createPlots(MAP_WIDTH, MAP_HEIGHT);
    }

    private createRoads(mapWidth: number, mapHeight: number) {
        this.roadsData.forEach((roadData) => {
            new Road(this.scene, roadData, mapWidth, mapHeight);
        });
    }

    private createPlots(MAP_WIDTH: number, MAP_HEIGHT: number) {
        this.housesData.forEach((houseData) => {
            // 1) Размер участка: та же доля, но умножаем уже на новую площадь
            const { amount, x, y } = houseData;
            const plotFraction = (amount / this.allCitySupply) * 0.1;
            const plotArea = plotFraction * MAP_WIDTH * MAP_HEIGHT;
            const plotSize = Math.sqrt(plotArea);

            // 2) Учитываем смещение
            let finalX = x;
            let finalY = y;

            // while (overlapping) — пока мы не убедились, что участок не пересекается ни с одной дорогой, мы снова крутим цикл.
            // for (const road of this.roadsData) — обходим все дороги:
            // •	Считаем, что дорога тянется от coordinate до coordinate + thickness.
            // •	Сверяемся, пересекаются ли эти диапазоны с краями участка (leftEdge / rightEdge или topEdge / bottomEdge).
            // Если пересечение есть — сдвигаем участок на thickness и ставим overlapping = true, чтобы при выходе из цикла дорог вернуться к while и снова проверить все дороги на новой позиции.

            let overlapping = true;
            while (overlapping) {
                overlapping = false; // предположим, что пересечений нет

                // каждый раз после смещения нужно пересчитать границы участка
                let leftEdge = finalX - plotSize / 2;
                let rightEdge = finalX + plotSize / 2;
                let topEdge = finalY - plotSize / 2;
                let bottomEdge = finalY + plotSize / 2;

                // Проходим по всем дорогам
                for (const road of this.roadsData) {
                    const thickness = road.avenue ? AVENUE_THICKNESS : STREET_THICKNESS;
                    const roadStart = road.coordinate;
                    const roadEnd = road.coordinate + thickness;

                    if (road.orientation === "vertical") {
                        // если есть пересечение по оси X
                        if (rightEdge >= roadStart && leftEdge < roadEnd) {
                            // смещаем участок вправо
                            finalX += thickness;
                            // помечаем, что надо заново проверить
                            overlapping = true;
                            // прерываем цикл for, чтобы начать заново с новой координатой
                            break;
                        }
                    } else {
                        // горизонтальная дорога
                        if (bottomEdge >= roadStart && topEdge < roadEnd) {
                            // смещаем участок вниз
                            finalY += thickness;
                            overlapping = true;
                            break;
                        }
                    }
                }
            } // конец while

            // Создаём участок с новой позицией и размерами
            const plot = new Plot(this.scene, { ...houseData, x: finalX, y: finalY }, plotSize);

            // Обработка клика по участку
            const plotGraphics = plot.getPlotGraphics();

            plotGraphics.setInteractive({ cursor: "pointer" }); // Меняем курсор на "указатель"

            plotGraphics.on("pointerdown", () => {
                // Сбрасываем состояние предыдущего участка
                if (this.selectedPlot) {
                    this.selectedPlot.setSelected(false);
                }

                // Запоминаем текущий выбранный участок
                this.selectedPlot = plot;
                plot.setSelected(true);

                // Отображаем информацию о доме
                const { city, amount } = plot.getData();
                console.log(`Selected House: ${city} Cost: ${amount}`);
            });

            plotGraphics.on("pointerover", () => {
                this.scene.input.setDefaultCursor("pointer");
            });

            plotGraphics.on("pointerout", () => {
                this.scene.input.setDefaultCursor("default");
            });
        });
    }
}
