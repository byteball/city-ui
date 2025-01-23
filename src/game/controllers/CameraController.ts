import Phaser from 'phaser';

export default class CameraController {
    private scene: Phaser.Scene;
    private camera: Phaser.Cameras.Scene2D.Camera;

    constructor(scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera) {
        this.scene = scene;
        this.camera = camera;

        // Устанавливаем границы камеры
        this.camera.setBounds(0, 0, 10_000, 10_000);

        // Центрируем камеру на центре карты
        this.camera.centerOn(10_000 / 2, 10_000 / 2);

        this.initDrag();
        this.initZoom();
    }

    private initDrag(): void {
        this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
            if (pointer.isDown) {
                this.camera.scrollX -= (pointer.x - pointer.prevPosition.x) / this.camera.zoom;
                this.camera.scrollY -= (pointer.y - pointer.prevPosition.y) / this.camera.zoom;
            }
        });
    }

    private initZoom(): void {

        const zoomX = this.camera.width / 10_000;
        const zoomY = this.camera.height / 10_000;
        const zoom = Math.min(zoomX, zoomY);
        this.camera.setZoom(zoom);

        this.scene.input.on('wheel', (pointer: Phaser.Input.Pointer, currentlyOver: Phaser.GameObjects.GameObject[], deltaX: number, deltaY: number, deltaZ: number) => {
            const zoomFactor = 0.001;
            this.camera.zoom -= deltaY * zoomFactor;

            const zoomX = this.scene.cameras.main.width / 10_000 as number;
            const zoomY = this.scene.cameras.main.height / 10_000 as number;

            const minZoom = Math.min(zoomX, zoomY);

            this.camera.zoom = Phaser.Math.Clamp(this.camera.zoom, minZoom, 1.5);
        });
    }
}