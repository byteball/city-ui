import appConfig from "@/appConfig";
import { Decimal } from "decimal.js";
import Phaser from "phaser";

const OVERFLOW = 50; // Extra space around the map to prevent camera from going out of bounds

export default class CameraController {
  private scene: Phaser.Scene;
  private camera: Phaser.Cameras.Scene2D.Camera;
  private BASE_MAP_SIZE: Decimal;

  constructor(scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera) {
    this.scene = scene;
    this.camera = camera;

    this.BASE_MAP_SIZE = Decimal(1_000_000).mul(appConfig.MAP_SCALE);

    this.camera.setBounds(-OVERFLOW, -OVERFLOW,
      this.BASE_MAP_SIZE.toNumber() + OVERFLOW * 2,
      this.BASE_MAP_SIZE.toNumber() + OVERFLOW * 2);

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
    const zoomX = this.camera.width / (this.BASE_MAP_SIZE.toNumber() + OVERFLOW * 2);
    const zoomY = this.camera.height / (this.BASE_MAP_SIZE.toNumber() + OVERFLOW * 2);
    const minZoom = Math.min(zoomX, zoomY);
    const maxZoom = 1.5;

    this.camera.setZoom(minZoom);

    this.scene.input.on("wheel", (pointer: Phaser.Input.Pointer, _: any, __: any, deltaY: number) => {
      const oldZoom = this.camera.zoom;
      const zoomChange = deltaY > 0 ? -0.02 : 0.01;
      const newZoom = Phaser.Math.Clamp(oldZoom + zoomChange, minZoom, maxZoom);

      // Center of the screen
      const cx = this.camera.width / 2;
      const cy = this.camera.height / 2;

      // World width/height of the area visible by the camera
      const oldWorldWidth = this.camera.width / oldZoom;
      const newWorldWidth = this.camera.width / newZoom;
      const oldWorldHeight = this.camera.height / oldZoom;
      const newWorldHeight = this.camera.height / newZoom;

      // Mouse offset from the center (in screen pixels)
      const dxScreen = pointer.x - cx;
      const dyScreen = pointer.y - cy;

      // Offset ratios from the center
      const rx = dxScreen / this.camera.width;
      const ry = dyScreen / this.camera.height;

      // Change in the world that "appeared" along the axes
      const dw = oldWorldWidth - newWorldWidth;
      const dh = oldWorldHeight - newWorldHeight;

      // Adjust scroll so the point stays under the cursor
      this.camera.scrollX += dw * rx;
      this.camera.scrollY += dh * ry;

      // Apply the new zoom
      this.camera.setZoom(newZoom);
    });
  }
}

