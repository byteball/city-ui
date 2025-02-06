// src/objects/Plot.ts
import Phaser from "phaser";

export interface HouseData {
  city: string;
  amount: number;
  x: number;
  y: number;
  ts: number;
}

export class Plot {
  private scene: Phaser.Scene;
  private data: HouseData;
  private plotSize: number;

  private plotImage: Phaser.GameObjects.Image;
  private outline?: Phaser.GameObjects.Graphics;

  private houseGraphics: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, data: HouseData, plotSize: number) {
    this.scene = scene;
    this.data = data;
    this.plotSize = plotSize;
    this.houseGraphics = this.scene.add.graphics();
    this.createPlot();
  }

  private createPlot() {
    const { x, y } = this.data;

    // Use the loaded "plot" SVG asset for the plot
    this.plotImage = this.scene.add.image(x, y, "plot");
    this.plotImage.setDisplaySize(this.plotSize, this.plotSize);
    this.plotImage.setInteractive();

    // Создаем графику для дома в центре участка
    const houseSize = this.plotSize / 4; // Размер дома относительно участка
    this.houseGraphics.fillStyle(0x8b4513, 1); // Цвет дома (коричневый)
    this.houseGraphics.fillRect(x - houseSize / 2, y - houseSize / 2, houseSize, houseSize);
  }

  public setSelected(selected: boolean) {
    if (selected) {
      // Применяем tint к изображению
      this.plotImage.setTint(0xffff00);

      // Добавляем контур с нужной толщиной
      if (!this.outline) {
        this.outline = this.scene.add.graphics();
      }

      this.outline.clear();
      this.outline.lineStyle(4, 0xffff00); // здесь 4 - толщина контура
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

  public getPlotImage() {
    return this.plotImage;
  }
}

