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
      // Skip drag when multi-touch (used for pinch zoom)
      if ((this as any)._activePointersCount === 1 && pointer.isDown) {
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

    // Ensure we have at least 2 pointers (adds a second pointer object for multi-touch)
    this.scene.input.addPointer(1);

    // Track active pointers manually (since type defs may not expose .pointers)
    const activePointers: Map<number, Phaser.Input.Pointer> = new Map();
    (this as any)._activePointersCount = 0; // used in drag logic above

    // Pinch zoom state
    let pinchInitialDistance: number | null = null;
    let pinchInitialZoom = minZoom;

    const updateActiveCount = () => (this as any)._activePointersCount = activePointers.size;

    this.scene.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      activePointers.set(pointer.id, pointer);
      updateActiveCount();
      if (activePointers.size === 2) {
        const it = Array.from(activePointers.values());
        pinchInitialDistance = Phaser.Math.Distance.Between(it[0].x, it[0].y, it[1].x, it[1].y);
        pinchInitialZoom = this.camera.zoom;
      }
    });

    const clearPinchIfNeeded = () => {
      if (activePointers.size < 2) {
        pinchInitialDistance = null;
      }
    };

    this.scene.input.on("pointerup", (pointer: Phaser.Input.Pointer) => {
      activePointers.delete(pointer.id);
      updateActiveCount();
      clearPinchIfNeeded();
    });
    this.scene.input.on("pointerupoutside", (pointer: Phaser.Input.Pointer) => {
      activePointers.delete(pointer.id);
      updateActiveCount();
      clearPinchIfNeeded();
    });

    this.scene.input.on("pointermove", () => {
      if (pinchInitialDistance && activePointers.size === 2) {
        const it = Array.from(activePointers.values());
        const p1 = it[0];
        const p2 = it[1];
        const currentDistance = Phaser.Math.Distance.Between(p1.x, p1.y, p2.x, p2.y);
        if (currentDistance <= 0) return;
        const scale = currentDistance / pinchInitialDistance;
        let newZoom = pinchInitialZoom * scale;
        newZoom = Phaser.Math.Clamp(newZoom, minZoom, maxZoom);
        const oldZoom = this.camera.zoom;
        if (Math.abs(newZoom - oldZoom) < 0.0001) return;

        const pinchCenterX = (p1.x + p2.x) / 2;
        const pinchCenterY = (p1.y + p2.y) / 2;

        // World width/height before and after
        const oldWorldWidth = this.camera.width / oldZoom;
        const newWorldWidth = this.camera.width / newZoom;
        const oldWorldHeight = this.camera.height / oldZoom;
        const newWorldHeight = this.camera.height / newZoom;

        // Offset from screen center
        const dxScreen = pinchCenterX - this.camera.width / 2;
        const dyScreen = pinchCenterY - this.camera.height / 2;
        const rx = dxScreen / this.camera.width;
        const ry = dyScreen / this.camera.height;

        const dw = oldWorldWidth - newWorldWidth;
        const dh = oldWorldHeight - newWorldHeight;
        this.camera.scrollX += dw * rx;
        this.camera.scrollY += dh * ry;
        this.camera.setZoom(newZoom);
      }
    });

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

