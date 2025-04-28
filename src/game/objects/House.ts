// src/objects/House.ts
import Phaser from "phaser";

import { IHouse } from "@/global";

export class House {
  private scene: Phaser.Scene;
  private data: IHouse;
  private plotSize: number;
  private disabled: boolean;
  private address: string;

  private houseImage: Phaser.GameObjects.Image;
  private outline?: Phaser.GameObjects.Graphics;
  private tooltipDom?: HTMLDivElement;

  constructor(scene: Phaser.Scene, data: IHouse, plotSize: number, disabled: boolean = false, address: string) {
    this.scene = scene;
    this.data = data;
    this.plotSize = plotSize;
    this.disabled = disabled;
    this.address = address;

    this.createHouse();
  }

  private createHouse() {
    const { x, y } = this.data;

    this.houseImage = this.scene.add.image(x, y, "house");
    this.houseImage.setDisplaySize(this.plotSize, this.plotSize);
    this.houseImage.setInteractive();

    // Remove Phaser tooltip and add DOM tooltip handlers
    this.houseImage.on("pointerover", (pointer: Phaser.Input.Pointer) => {
      if (this.tooltipDom) return;
      const div = document.createElement("div");
      div.innerText = this.address;
      Object.assign(div.style, {
        position: "absolute",
        background: "#fff",
        color: "rgba(0,0,0,0.75)",
        padding: "4px 8px",
        borderRadius: "4px",
        whiteSpace: "pre-wrap",
        maxWidth: "240px",
        pointerEvents: "none",
        zIndex: "1000",
      });

      div.className = "";

      document.body.appendChild(div);
      this.tooltipDom = div;
      div.style.left = pointer.event.clientX + "px";
      div.style.top = pointer.event.clientY + "px";
    });
    this.houseImage.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.tooltipDom) {
        this.tooltipDom.style.left = pointer.event.clientX + "px";
        this.tooltipDom.style.top = pointer.event.clientY + "px";
      }
    });
    this.houseImage.on("pointerout", () => {
      if (this.tooltipDom) {
        document.body.removeChild(this.tooltipDom);
        this.tooltipDom = undefined;
      }
    });
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

