// src/objects/Plot.ts
import Phaser from "phaser";

export interface HouseData {
    city: string;
    amount: number; // Стоимость участка
    x: number; // Координата x
    y: number; // Координата y
    ts: number; // Временная метка
}

export class Plot {
    private scene: Phaser.Scene;
    private data: HouseData;
    private plotSize: number;
    private plotGraphics: Phaser.GameObjects.Graphics;
    private houseGraphics: Phaser.GameObjects.Graphics;

    constructor(scene: Phaser.Scene, data: HouseData, plotSize: number) {
        this.scene = scene;
        this.data = data;
        this.plotSize = plotSize;
        this.plotGraphics = this.scene.add.graphics();
        this.houseGraphics = this.scene.add.graphics();
        this.createPlot();
    }

    private createPlot() {
        const { x, y } = this.data;

        // Создаем графику для участка
        this.plotGraphics.fillStyle(0x228b22, 1); // Цвет участка (зелёный)
        this.plotGraphics.fillRect(x - this.plotSize / 2, y - this.plotSize / 2, this.plotSize, this.plotSize);
        this.plotGraphics.setInteractive(
            new Phaser.Geom.Rectangle(x - this.plotSize / 2, y - this.plotSize / 2, this.plotSize, this.plotSize),
            Phaser.Geom.Rectangle.Contains
        );

        // Создаем графику для дома в центре участка
        const houseSize = this.plotSize / 4; // Размер дома относительно участка
        this.houseGraphics.fillStyle(0x8b4513, 1); // Цвет дома (коричневый)
        this.houseGraphics.fillRect(x - houseSize / 2, y - houseSize / 2, houseSize, houseSize);
    }

    public setSelected(selected: boolean) {
        const { x, y } = this.data;
        this.plotGraphics.clear();
        if (selected) {
            this.plotGraphics.fillStyle(0xffff00, 1); // Желтый цвет для выделения
        } else {
            this.plotGraphics.fillStyle(0x228b22, 1); // Зеленый цвет для участков
        }
        this.plotGraphics.fillRect(x - this.plotSize / 2, y - this.plotSize / 2, this.plotSize, this.plotSize);
    }

    public getData() {
        return this.data;
    }

    public getPlotGraphics() {
        return this.plotGraphics;
    }
}

