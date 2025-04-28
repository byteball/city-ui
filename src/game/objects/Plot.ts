// src/objects/Plot.ts
import { IMapUnit } from "@/global";
import Phaser from "phaser";

export class Plot {
  private scene: Phaser.Scene;
  private data: IMapUnit;
  private plotSize: number;
  private address: string;

  private plotImage: Phaser.GameObjects.Image;
  private outline?: Phaser.GameObjects.Graphics;
  private tooltipDom?: HTMLDivElement;

  constructor(scene: Phaser.Scene, data: IMapUnit, plotSize: number, address: string) {
    this.scene = scene;
    this.data = data;
    this.plotSize = plotSize;
    this.address = address;

    this.createPlot();
  }

  private createPlot() {
    const { x, y } = this.data;

    this.plotImage = this.scene.add.image(x, y, "plot");
    this.plotImage.setDisplaySize(this.plotSize, this.plotSize);
    this.plotImage.setInteractive();

    // Use DOM-based block tooltip
    this.plotImage.on("pointerover", (pointer: Phaser.Input.Pointer) => {
      if (this.tooltipDom) return;
      const div = document.createElement("div");
      div.innerText = this.address;
      Object.assign(div.style, {
        position: "fixed",
        background: "#fff",
        color: "rgba(0,0,0,0.75)",
        padding: "4px 8px",
        borderRadius: "4px",
        whiteSpace: "pre-wrap",
        maxWidth: "240px",
        pointerEvents: "none",
        zIndex: "1000",
      });
      document.body.appendChild(div);
      this.tooltipDom = div;
      div.style.left = pointer.event.clientX + "px";
      div.style.top = pointer.event.clientY + "px";
    });
    this.plotImage.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.tooltipDom) {
        this.tooltipDom.style.left = pointer.event.clientX + "px";
        this.tooltipDom.style.top = pointer.event.clientY + "px";
      }
    });
    this.plotImage.on("pointerout", () => {
      if (this.tooltipDom) {
        document.body.removeChild(this.tooltipDom);
        this.tooltipDom = undefined;
      }
    });
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

