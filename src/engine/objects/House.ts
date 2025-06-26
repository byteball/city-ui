// src/objects/House.ts
import Phaser from "phaser";

import { IHouse } from "@/global";

export class House {
  private scene: Phaser.Scene;
  private data: IHouse;
  private plotSize: number;
  private disabled: boolean;
  private address: string;
  private isMayorHouse: boolean = false;
  private defaultDepth = 35; // Default depth for houses

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
    const { x, y, amount } = this.data;
    this.isMayorHouse = amount === 0;

    this.houseImage = this.scene.add.image(x, y, this.isMayorHouse ? "mayor-house" : "house");
    this.houseImage.setDepth(this.defaultDepth);

    if (this.isMayorHouse) {
      this.houseImage.setDisplaySize(Math.min(this.plotSize, 400), Math.min(this.plotSize * 1.293, 400 * 1.293));
    } else {
      this.houseImage.setDisplaySize(400, 400);
    }

    this.houseImage.setInteractive();
    // Apply appropriate pipeline: mayor's house or default house pipeline
    const renderer = this.scene.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    if (renderer.pipelines) {
      if (this.isMayorHouse && renderer.pipelines.get('MayorHousePipeline')) {
        this.houseImage.setPipeline('MayorHousePipeline');
      } else if (renderer.pipelines.get('HousePipeline')) {
        this.houseImage.setPipeline('HousePipeline');
      }
    }

    this.houseImage.on("pointerover", (pointer: Phaser.Input.Pointer) => {
      if ((window as any).isDialogOpen) return;
      if (this.tooltipDom || !this.address) return;
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

      div.className = "";

      document.body.appendChild(div);
      this.tooltipDom = div;
      const evt = pointer.event as MouseEvent;
      div.style.left = evt.clientX + "px";
      div.style.top = evt.clientY + "px";
    });

    this.houseImage.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.tooltipDom) {
        const evtMove = pointer.event as MouseEvent;
        this.tooltipDom.style.left = evtMove.clientX + "px";
        this.tooltipDom.style.top = evtMove.clientY + "px";
      }
    });

    this.houseImage.on("pointerout", () => {
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
    if (this.disabled) return;

    if (selected) {
      this.houseImage.setTint(0x58a7ff);

      if (!this.outline) {
        this.outline = this.scene.add.graphics();
      }

      this.outline.clear();
      this.outline.lineStyle(15, 0x58a7ff);
      this.outline.strokeRect(
        this.houseImage.x - this.houseImage.displayWidth / 2,
        this.houseImage.y - this.houseImage.displayHeight / 2,
        this.houseImage.displayWidth,
        this.houseImage.displayHeight
      );

      this.outline.setDepth(this.defaultDepth + 2);
      this.houseImage.setDepth(this.defaultDepth + 1);
    } else {
      this.houseImage.clearTint();
      this.houseImage.setDepth(this.defaultDepth);
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

