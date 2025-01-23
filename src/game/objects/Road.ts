// src/objects/Road.ts
import Phaser from 'phaser';

export interface RoadData {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    name: string;
    avenue: boolean;
}

export class Road {
    private scene: Phaser.Scene;
    private data: RoadData;

    constructor(scene: Phaser.Scene, data: RoadData) {
        this.scene = scene;
        this.data = data;
        this.createRoad();
    }

    private createRoad() {
        const { x1, y1, x2, y2, name, avenue } = this.data;
        const thickness = avenue ? 80 : 40;
        const roadColor = avenue ? 0xff0000 : 0x0000ff; // Красный для авеню, синий для улиц

        // Создаем графику для дороги
        const roadGraphics = this.scene.add.graphics();
        roadGraphics.fillStyle(roadColor, 1);
        if (x1 === x2) {
            // Вертикальная линия (авеню)
            roadGraphics.fillRect(x1 - thickness / 2, y1, thickness, y2 - y1);
        } else {
            // Горизонтальная линия (дорога)
            roadGraphics.fillRect(x1, y1 - thickness / 2, x2 - x1, thickness);
        }

        // Отображаем название дороги
        const roadText = this.scene.add.text(
            (x1 + x2) / 2,
            (y1 + y2) / 2,
            name,
            { fontSize: '12px', color: '#ffffff', align: 'center' }
        );
        roadText.setOrigin(0.5);
    }
}