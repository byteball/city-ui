// src/objects/Map.ts
import Phaser from 'phaser';
import { Road, RoadData } from './Road';
import { Plot, HouseData } from './Plot';

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
        this.createRoads();
        this.createPlots();
    }

    private createRoads() {
        this.roadsData.forEach((roadData) => {
            new Road(this.scene, roadData);
        });
    }

    private createPlots() {
        const MAP_WIDTH = 10000;
        const MAP_HEIGHT = 10000;

        this.housesData.forEach((houseData) => {
            const { x, y, amount } = houseData;

            // Вычисляем долю площади участка
            const plotFraction = (1 / this.allCitySupply) * amount * 0.1;

            // Вычисляем площадь участка
            const plotArea = plotFraction * MAP_WIDTH * MAP_HEIGHT;

            // Предположим, что участки квадратные
            const plotSize = Math.sqrt(plotArea);

            const plot = new Plot(this.scene, houseData, plotSize);

            // Обработка клика по участку
            plot.getPlotGraphics().on('pointerdown', () => {
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
        });
    }
}