import Phaser from 'phaser';

export interface RoadData {
    coordinate: number;
    name: string;
    avenue: boolean;
    orientation: 'vertical' | 'horizontal';
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
        const { coordinate, name, avenue, orientation } = this.data;
        const thickness = avenue ? 100 : 50;
        const roadColor = avenue ? 0xff0000 : 0x0000ff; // Красный для авеню, синий для улиц

        // Создаем графику для дороги
        const roadGraphics = this.scene.add.graphics();
        roadGraphics.fillStyle(roadColor, 1);

        if (orientation === 'vertical') {
            roadGraphics.fillRect(coordinate, 0, thickness, 10_000);
        } else if (orientation === 'horizontal') {
            roadGraphics.fillRect(0, coordinate, 10_000, thickness);
        } else {
            throw new Error('Unknown orientation');
        }

        // Отображаем название дороги
        // const roadText = this.scene.add.text(
        //     (x1 + x2) / 2,
        //     (y1 + y2) / 2,
        //     name,
        //     { fontSize: '12px', color: '#ffffff', align: 'center' }
        // );

        // roadText.setOrigin(0.5);
    }
}