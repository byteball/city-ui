import Phaser from "phaser";

export interface RoadData {
    coordinate: number;
    name: string;
    avenue: boolean;
    orientation: "vertical" | "horizontal";
}

const BASE_LABEL_STEP = 600;
const BASE_ROAD_LINE_WIDTH = 60;

export class Road {
    private scene: Phaser.Scene;
    private data: RoadData;
    private labels: Phaser.GameObjects.Text[] = [];
    private previousZoom: number = 0;

    constructor(
        scene: Phaser.Scene,
        data: RoadData,
        private mapWidth: number,
        private mapHeight: number
    ) {
        this.scene = scene;
        this.data = data;

        this.createRoad();
    }

    private createRoad() {
        const { coordinate, name, avenue, orientation } = this.data;
        const thickness = avenue
            ? BASE_ROAD_LINE_WIDTH * 2
            : BASE_ROAD_LINE_WIDTH;
        const roadColor = avenue ? 0xff0000 : 0x0000ff; // Красный для авеню, синий для улиц

        // Создаем графику для дороги
        const roadGraphics = this.scene.add.graphics();
        roadGraphics.fillStyle(roadColor, 1);

        if (orientation === "vertical") {
            roadGraphics.fillRect(coordinate, 0, thickness, this.mapHeight);

            // Добавляем название дороги вдоль вертикальной линии
            for (let y = 0; y < this.mapHeight; y += BASE_LABEL_STEP) {
                const roadText = this.scene.add.text(
                    coordinate + thickness / 2,
                    y,
                    name,
                    {
                        fontSize: avenue ? "32px" : "20px",
                        color: "#ffffff",
                    }
                );

                roadText.setOrigin(0.5);
                roadText.setAngle(-90);

                this.labels.push(roadText);
            }
        } else if (orientation === "horizontal") {
            roadGraphics.fillRect(0, coordinate, this.mapWidth, thickness);

            // Добавляем название дороги вдоль горизонтальной линии
            for (let x = 0; x < this.mapWidth; x += BASE_LABEL_STEP) {
                const roadText = this.scene.add.text(
                    x,
                    coordinate + thickness / 2,
                    name,
                    {
                        fontSize: avenue ? "32px" : "20px",
                        color: "#ffffff",
                    }
                );

                roadText.setOrigin(0.5);

                this.labels.push(roadText);
            }
        } else {
            throw new Error("Unknown orientation");
        }

        // Добавляем обновление текста в игровой цикл
        this.scene.events.on("update", this.updateLabels, this);
    }

    private updateLabels() {
        const currentZoom = this.scene.cameras.main.zoom;

        if (
            !this.previousZoom ||
            Math.abs(currentZoom - this.previousZoom) >= this.previousZoom * 0.4
        ) {
            const dynamicStep = BASE_LABEL_STEP / currentZoom;

            this.labels.forEach((label, index) => {
                const baseFontSize = this.data.avenue ? 12 : 10; // Базовый размер шрифта
                const newFontSize = baseFontSize / currentZoom; // Увеличиваем текст при уменьшении масштаба

                label.setFontSize(newFontSize);

                // Перемещаем метки в зависимости от динамического шага
                if (this.data.orientation === "vertical") {
                    label.y = index * dynamicStep;
                } else if (this.data.orientation === "horizontal") {
                    label.x = index * dynamicStep;
                }
            });

            this.previousZoom = currentZoom;
        }
    }
}
