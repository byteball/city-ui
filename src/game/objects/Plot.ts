// src/objects/Plot.ts
import { IMapUnit } from "@/global";
import Phaser from "phaser";

const PLUS_SIZE = 150;
export class Plot {
  private scene: Phaser.Scene;
  private data: IMapUnit;
  private plotSize: number;
  private address: string;
  private view?: string;

  private plotImage: Phaser.GameObjects.Image;
  private outline?: Phaser.GameObjects.Graphics;
  private tooltipDom?: HTMLDivElement;

  constructor(scene: Phaser.Scene, data: IMapUnit, plotSize: number, address: string, view = "plot") {
    this.scene = scene;
    this.data = data;
    this.plotSize = plotSize;
    this.address = address;
    this.view = view;

    this.createPlot();
  }

  private createPlot() {
    const { x, y } = this.data;

    if (this.view === "plus") {
      this.plotImage = this.scene.add.image(x, y, "plus");
      this.plotImage.setDisplaySize(PLUS_SIZE, PLUS_SIZE);
      this.plotImage.setDepth(this.plotImage.depth + 20);

      // const redDot = this.scene.add.graphics();
      // redDot.fillStyle(0xff0000, 1);
      // redDot.fillCircle(x, y, 10);
      // redDot.setDepth(this.plotImage.depth + 30);
    } else {
      this.plotImage = this.scene.add.image(x, y, this.view ?? "plot");
      this.plotImage.setDepth(this.plotImage.depth + (this.view === "plot" ? 0 : 20));
      this.plotImage.setDisplaySize(this.plotSize, this.plotSize);
      this.plotImage.setInteractive();
    }

    // Use DOM-based block tooltip
    this.plotImage.on("pointerover", (pointer: Phaser.Input.Pointer) => {
      // do not show tooltip when a dialog is open
      if ((window as any).isDialogOpen) return;
      if (this.tooltipDom) return;
      const div = document.createElement("div");
      let name = "";

      if (this.data.info && typeof this.data.info === "object") {
        name = this.data.info.name;
      } else if (typeof this.data.info === "string") {
        name = this.data.info;
      }

      div.innerHTML = (name ? `<b>${name}</b><br>` : "") + `Address: ${this.address}`;

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

    // Remove tooltip when mouse leaves the canvas
    this.scene.game.canvas.addEventListener("mouseleave", () => {
      if (this.tooltipDom) {
        document.body.removeChild(this.tooltipDom);
        this.tooltipDom = undefined;
      }
    });
  }

  public setSelected(selected: boolean) {
    if (selected) {
      if (!this.outline) {
        this.outline = this.scene.add.graphics();
      }

      this.outline.clear();
      this.outline.lineStyle(20, 0x60a5fa);
      this.outline.strokeRect(
        this.plotImage.x - this.plotImage.displayWidth / 2,
        this.plotImage.y - this.plotImage.displayHeight / 2,
        this.plotImage.displayWidth,
        this.plotImage.displayHeight
      );

      this.outline.setDepth(this.plotImage.depth);
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

