// src/objects/Plot.ts
import { IMapUnit } from "@/global";
import Phaser from "phaser";

export class Plot {
  private scene: Phaser.Scene;
  private data: IMapUnit;
  private plotSize: number;

  private plotImage: Phaser.GameObjects.Image;
  private outline?: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, data: IMapUnit, plotSize: number) {
    this.scene = scene;
    this.data = data;
    this.plotSize = plotSize;
    this.createPlot();
  }

  private createPlot() {
    const { x, y } = this.data;

    // Use the loaded "plot" SVG asset for the plot
    this.plotImage = this.scene.add.image(x, y, "plot");
    this.plotImage.setDisplaySize(this.plotSize, this.plotSize);
    this.plotImage.setInteractive();
  }

  public setSelected(selected: boolean) {
    if (selected) {
      // Применяем tint к изображению
      // this.plotImage.setTint(0x60a5fa);

      // Добавляем контур с нужной толщиной
      if (!this.outline) {
        this.outline = this.scene.add.graphics();
      }

      this.outline.clear();
      this.outline.lineStyle(20, 0x60a5fa); // здесь 20 - толщина контура
      this.outline.strokeRect(
        this.plotImage.x - this.plotImage.displayWidth / 2,
        this.plotImage.y - this.plotImage.displayHeight / 2,
        this.plotImage.displayWidth,
        this.plotImage.displayHeight
      );

      // Устанавливаем depth выше чем у plotImage
      this.outline.setDepth(this.plotImage.depth + 1);
    } else {
      this.plotImage.clearTint();

      if (this.outline) {
        this.outline.clear();
      }
    }
  }

  public getData() {
    return this.data;
  }

  public getMapUnitImage() {
    return this.plotImage;
  }
}

