// src/scenes/MapScene.ts
import Phaser from 'phaser';
import { Road, RoadData } from '../objects/Road';
import { Plot, HouseData } from '../objects/Plot';

import CameraController from '../controllers/CameraController';

export default class MapScene extends Phaser.Scene {
    private housesData: HouseData[] = [
        { city: 'City A', amount: 2.5, x: 1324, y: 6557, ts: 1734023072 },
        { city: 'City B', amount: 3.0, x: 5000, y: 8000, ts: 1734023073 },


        { city: 'City С', amount: 2.5, x: 2324, y: 6557, ts: 1734023072 },
        { city: 'City D', amount: 3.0, x: 500, y: 800, ts: 1734023073 },


        { city: 'City E', amount: 2.5, x: 1324, y: 6557, ts: 1734023072 },
        { city: 'City F', amount: 3.0, x: 5000, y: 6000, ts: 1734023073 },


        { city: 'City G', amount: 2.5, x: 1324, y: 6557, ts: 1734023072 },
        { city: 'City H', amount: 3.0, x: 9000, y: 4000, ts: 1734023073 },


        { city: 'City 1', amount: 1.5, x: 1324, y: 1557, ts: 1734023072 },
        { city: 'City 2', amount: 2.0, x: 2000, y: 2000, ts: 1734023073 },
        { city: 'City 3', amount: 3.5, x: 3324, y: 3557, ts: 1734023072 },
        { city: 'City 4', amount: 4.0, x: 4000, y: 4000, ts: 1734023073 },
        { city: 'City 5', amount: 5.5, x: 5324, y: 5557, ts: 1734023072 },
        { city: 'City 6', amount: 6.0, x: 6000, y: 6000, ts: 1734023073 },
        { city: 'City 7', amount: 7.5, x: 7324, y: 7557, ts: 1734023072 },
        { city: 'City 8', amount: 8.0, x: 8000, y: 8000, ts: 1734023073 },
        { city: 'City 9', amount: 9.5, x: 9324, y: 9557, ts: 1734023072 },
        { city: 'City 10', amount: 10.0, x: 10000, y: 10000, ts: 1734023073 },


        { city: 'City 1', amount: 1, x: 1324, y: 1557, ts: 1734023072 },
        { city: 'City 2', amount: 2, x: 5000, y: 2000, ts: 1734023073 },
        { city: 'City 3', amount: 3, x: 3324, y: 3557, ts: 1734023072 },
        { city: 'City 4', amount: 4, x: 4000, y: 4000, ts: 1734023073 },
        { city: 'City 5', amount: 5, x: 2324, y: 7557, ts: 1734023072 },
        { city: 'City 6', amount: 6, x: 1000, y: 6000, ts: 1734023073 },
        { city: 'City 7', amount: 7, x: 7324, y: 2557, ts: 1734023072 },
        { city: 'City 8', amount: 8, x: 4000, y: 3000, ts: 1734023073 },
        { city: 'City 9', amount: 9, x: 3324, y: 9557, ts: 1734023072 },
        { city: 'City 10', amount: 10, x: 1000, y: 10000, ts: 1734023073 }

    ];

    private roadsData: RoadData[] = [
        { x1: 2000, y1: 2000, x2: 2000, y2: 5000, name: "Tonych Avenue", avenue: true },
        { x1: 2000, y1: 8000, x2: 7000, y2: 8000, name: "Taump Street", avenue: false },
    ];

    private selectedPlot: Plot | null = null;

    constructor() {
        super('MapScene');
    }

    preload() {
        // Загрузка ресурсов, если необходимо
    }

    create() {
        const MAP_WIDTH = 10000;
        const MAP_HEIGHT = 10000;

        // Общая стоимость всех домов
        const ALL_CITY_SUPPLY = this.housesData.reduce((sum, house) => sum + house.amount, 0);

        // Создаем дороги
        this.roadsData.forEach((roadData) => {
            new Road(this, roadData);
        });

        // Создаем участки
        this.housesData.forEach((houseData) => {
            const { x, y, amount } = houseData;

            // Вычисляем долю площади участка
            const plotFraction = (1 / ALL_CITY_SUPPLY) * amount * 0.1;

            // Вычисляем площадь участка
            const plotArea = plotFraction * MAP_WIDTH * MAP_HEIGHT;

            // Предположим, что участки квадратные
            const plotSize = Math.sqrt(plotArea);

            const plot = new Plot(this, houseData, plotSize);

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

        // Устанавливаем границы камеры
        this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);

        // Центрируем камеру на центре карты
        this.cameras.main.centerOn(MAP_WIDTH / 2, MAP_HEIGHT / 2);

        // Инициализируем контроллер камеры
        new CameraController(this, this.cameras.main);
    }
}