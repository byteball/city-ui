// src/objects/House.ts
import Phaser from "phaser";

import { IHouse } from "@/global";

export class House {
  private scene: Phaser.Scene;
  private data: IHouse;
  private plotSize: number;
  private disabled: boolean;

  private houseImage: Phaser.GameObjects.Image;
  private outline?: Phaser.GameObjects.Graphics;

  constructor(scene: Phaser.Scene, data: IHouse, plotSize: number, disabled: boolean = false) {
    this.scene = scene;
    this.data = data;
    this.plotSize = plotSize;
    this.disabled = disabled;
    this.createHouse();
  }

  private createHouse() {
    const { x, y } = this.data;

    // Use the loaded "plot" SVG asset for the plot
    this.houseImage = this.scene.add.image(x, y, "house");
    this.houseImage.setDisplaySize(this.plotSize, this.plotSize);
    this.houseImage.setInteractive();
  }

  public setSelected(selected: boolean) {
    if (this.disabled) return;

    if (selected) {
      // Применяем tint к изображению
      this.houseImage.setTint(0xffff00);

      // Добавляем контур с нужной толщиной
      if (!this.outline) {
        this.outline = this.scene.add.graphics();
      }

      this.outline.clear();
      this.outline.lineStyle(4, 0xffff00); // здесь 4 - толщина контура
      this.outline.strokeRect(
        this.houseImage.x - this.houseImage.displayWidth / 2,
        this.houseImage.y - this.houseImage.displayHeight / 2,
        this.houseImage.displayWidth,
        this.houseImage.displayHeight
      );

      // Устанавливаем depth выше чем у houseImage
      this.outline.setDepth(this.houseImage.depth + 1);
    } else {
      this.houseImage.clearTint();

      if (this.outline) {
        this.outline.clear();
      }
    }
  }

  public getData() {
    return this.data;
  }

  public getMapUnitImage() {
    return this.houseImage;
  }
}

