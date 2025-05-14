import appConfig from "@/appConfig";
import { Decimal } from "decimal.js";
import Phaser from "phaser";

export default class CameraController {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private BASE_MAP_SIZE: Decimal;

  constructor(scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera) {
    this.scene = scene;
    this.camera = camera;

    this.BASE_MAP_SIZE = Decimal(1_000_000).mul(appConfig.MAP_SCALE);

    // Устанавливаем границы камеры
    this.camera.setBounds(0, 0, this.BASE_MAP_SIZE.toNumber(), this.BASE_MAP_SIZE.toNumber());

    // Центрируем камеру на центре карты
    this.camera.centerOn(this.BASE_MAP_SIZE.div(2).toNumber(), this.BASE_MAP_SIZE.div(2).toNumber());

    this.initDrag();
    this.initZoom();
  }

  private initDrag(): void {
    this.scene.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (pointer.isDown) {
        this.camera.scrollX -= (pointer.x - pointer.prevPosition.x) / this.camera.zoom;
        this.camera.scrollY -= (pointer.y - pointer.prevPosition.y) / this.camera.zoom;
      }
    });
  }

  private initZoom(): void {
    const zoomX = this.camera.width / this.BASE_MAP_SIZE.toNumber();
    const zoomY = this.camera.height / this.BASE_MAP_SIZE.toNumber();
    const zoom = Math.min(zoomX, zoomY);
    this.camera.setZoom(zoom);

    this.scene.input.on(
      "wheel",
      (
        _pointer: Phaser.Input.Pointer,
        _currentlyOver: Phaser.GameObjects.GameObject[],
        _deltaX: number,
        deltaY: number,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _deltaZ: number
      ) => {
        const zoomFactor = 0.001;
        this.camera.zoom -= deltaY * zoomFactor;

        const zoomX = (this.scene.cameras.main.width / this.BASE_MAP_SIZE.toNumber()) as number;
        const zoomY = (this.scene.cameras.main.height / this.BASE_MAP_SIZE.toNumber()) as number;

        const minZoom = Math.min(zoomX, zoomY);

        this.camera.zoom = Phaser.Math.Clamp(this.camera.zoom, minZoom, 1.5);
      }
    );
  }
}

