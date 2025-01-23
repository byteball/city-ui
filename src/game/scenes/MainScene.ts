// src/scenes/MapScene.ts
import Phaser from 'phaser';

interface HouseData {
    city: string;
    amount: number; // Стоимость участка
    x: number; // Координата x (диапазон 0 - 10000)
    y: number; // Координата y (диапазон 0 - 10000)
    ts: number; // Временная метка
}

interface RoadData {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    name: string;
    avenue: boolean;
}

const roads: RoadData[] = [
    { x1: 2000, y1: 2000, x2: 2000, y2: 5000, name: "Tonych Avenue", avenue: true },
    { x1: 2000, y1: 8000, x2: 7000, y2: 8000, name: "Taump Street", avenue: false },
];



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

        // Создаем контейнер для всей карты
        const map = this.add.container(0, 0);

        // Создаем группу для хранения графики участков
        const plotsGroup = this.add.group();

        // Функция проверки, находится ли точка в пределах дороги
        const isPointOnRoad = (x: number, y: number) => {
            return roads.some(({ x1, y1, x2, y2, avenue }) => {
                const thickness = avenue ? 40 : 20;
                if (x1 === x2) {
                    // Вертикальная дорога
                    return Math.abs(x - x1) <= thickness / 2 && y >= y1 && y <= y2;
                } else {
                    // Горизонтальная дорога
                    return Math.abs(y - y1) <= thickness / 2 && x >= x1 && x <= x2;
                }
            });
        };

        // Создаем дороги и авеню
        roads.forEach((road) => {
            const { x1, y1, x2, y2, name, avenue } = road;
            const thickness = avenue ? 80 : 40;
            const roadColor = avenue ? 0xff0000 : 0x0000ff; // Красный для авеню, синий для улиц

            // Создаем графику для дороги
            const roadGraphics = this.add.graphics();
            roadGraphics.fillStyle(roadColor, 1);
            if (x1 === x2) {
                // Вертикальная линия (авеню)
                roadGraphics.fillRect(x1 - thickness / 2, y1, thickness, y2 - y1);
            } else {
                // Горизонтальная линия (дорога)
                roadGraphics.fillRect(x1, y1 - thickness / 2, x2 - x1, thickness);
            }

            map.add(roadGraphics);

            // Отображаем название дороги
            const roadText = this.add.text(
                (x1 + x2) / 2,
                (y1 + y2) / 2,
                name,
                { fontSize: '12px', color: '#ffffff', align: 'center' }
            );

            roadText.setOrigin(0.5);

            map.add(roadText);
        });

        let selectedPlot: { plot: Phaser.GameObjects.Graphics; x: number; y: number; size: number } | null = null;

        this.housesData.forEach((house) => {
            let { x, y, amount, city } = house;

            // Проверяем, чтобы участок не находился на дороге
            while (isPointOnRoad(x, y)) {
                x += 50; // Сдвигаем участок вправо, если он пересекается с дорогой
                y += 50; // Сдвигаем участок вниз, если он пересекается с дорогой
            }

            // Вычисляем долю площади участка
            const plotFraction = (1 / ALL_CITY_SUPPLY) * amount * 0.1;

            // Вычисляем площадь участка
            const plotArea = plotFraction * MAP_WIDTH * MAP_HEIGHT;

            // Предположим, что участки квадратные
            const plotSize = Math.sqrt(plotArea);

            // Создаем графику для участка
            const plot = this.add.graphics();
            plot.fillStyle(0x228b22, 1); // Цвет участка (зелёный)
            plot.fillRect(x - plotSize / 2, y - plotSize / 2, plotSize, plotSize);
            plot.setInteractive(new Phaser.Geom.Rectangle(x - plotSize / 2, y - plotSize / 2, plotSize, plotSize), Phaser.Geom.Rectangle.Contains);

            // Создаем графику для дома в центре участка
            const houseGraphics = this.add.graphics();
            houseGraphics.fillStyle(0x8b4513, 1); // Цвет дома (коричневый)
            const houseSize = plotSize / 4; // Размер дома относительно участка
            houseGraphics.fillRect(x - houseSize / 2, y - houseSize / 2, houseSize, houseSize);

            // Добавляем участок в группу
            plotsGroup.add(plot);
            // // Добавляем участок и дом в контейнер карты
            // map.add(plot);
            // map.add(houseGraphics);

            // Добавляем участок и дом в сцену
            this.add.existing(plot);
            this.add.existing(houseGraphics);

            // Обработка клика по участку
            plot.on('pointerdown', (p: Phaser.Input.Pointer) => {
                // Сбрасываем состояние предыдущего участка
                if (selectedPlot) {
                    const { plot, x, y, size } = selectedPlot;
                    plot.clear();
                    plot.fillStyle(0x228b22, 1); // Зеленый цвет для участков
                    plot.fillRect(x - size / 2, y - size / 2, size, size);
                }

                // Запоминаем текущий выбранный участок
                selectedPlot = {
                    plot,
                    x,
                    y,
                    size: plotSize,
                };

                // Выделяем выбранный участок
                plot.clear();
                plot.fillStyle(0xffff00, 1); // Желтый цвет для выделения
                plot.fillRect(x - plotSize / 2, y - plotSize / 2, plotSize, plotSize);

                // Отображаем информацию о доме
                console.log(`Selected House: ${city} Cost: ${amount}`);
            });
        });

        // Устанавливаем границы камеры
        this.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        // this.cameras.main.centerOn(MAP_WIDTH / 2, MAP_HEIGHT / 2);

        // Устанавливаем масштаб камеры, чтобы вся карта была видна
        const zoomX = this.cameras.main.width / MAP_WIDTH;
        const zoomY = this.cameras.main.height / MAP_HEIGHT;

        const zoom = Math.min(zoomX, zoomY);
        this.cameras.main.setZoom(zoom);

        // Центрируем камеру на центре карты
        this.cameras.main.centerOn(MAP_WIDTH / 2, MAP_HEIGHT / 2);

        // Включаем возможность перетаскивания карты
        this.input.on(
            'pointermove',
            (pointer) => {
                if (pointer.isDown) {
                    this.cameras.main.scrollX -= (pointer.x - pointer.prevPosition.x) / this.cameras.main.zoom;
                    this.cameras.main.scrollY -= (pointer.y - pointer.prevPosition.y) / this.cameras.main.zoom;
                }
            },
            this
        );

        // Включаем масштабирование колесиком мыши
        this.input.on(
            'wheel',
            (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
                const zoomFactor = 0.001;
                this.cameras.main.zoom -= deltaY * zoomFactor;

                const zoomX = this.cameras.main.width / MAP_WIDTH;
                const zoomY = this.cameras.main.height / MAP_HEIGHT;
                const zoom = Math.min(zoomX, zoomY);

                this.cameras.main.zoom = Phaser.Math.Clamp(this.cameras.main.zoom, zoom, 1.5);
            },
            this
        );

    }
}