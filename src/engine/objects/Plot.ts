// src/objects/Plot.ts
import appConfig from "@/appConfig";
import { IMapUnit } from "@/global";
import { asNonNegativeNumber } from "@/lib";
import Phaser from "phaser";

const PLUS_SIZE = 150;
export class Plot {
  private scene: Phaser.Scene;
  private data: IMapUnit;
  private plotSize: number;
  private address: string;
  private view?: string;
  private isGolden: boolean = false;
  private defaultDepth = 20; // Default depth for plots (higher than houses)
  private plotImage: Phaser.GameObjects.Image;
  private outline?: Phaser.GameObjects.Graphics;
  private tooltipDom?: HTMLDivElement;

  constructor(scene: Phaser.Scene, data: IMapUnit, plotSize: number, address: string, view = "plot") {
    this.scene = scene;
    this.data = data;
    this.plotSize = plotSize;
    this.address = address;
    this.view = view;
    this.isGolden = appConfig.GOLDEN_PLOTS.map(asNonNegativeNumber).includes(data.plot_num);

    this.createPlot();
  }

  private createPlot() {
    const { x, y } = this.data;

    if (this.view === "plus") {
      this.plotImage = this.scene.add.image(x, y, "plus");
      this.plotImage.setDisplaySize(PLUS_SIZE, PLUS_SIZE);
      this.plotImage.setDepth(40);

      // Apply appropriate pipeline: use PlusPipeline for "plus" view
      const renderer = this.scene.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
      if (renderer.pipelines) {
        if (renderer.pipelines.get('PlusPipeline')) {
          this.plotImage.setPipeline('PlusPipeline');
        } else if (this.isGolden && renderer.pipelines.get('GoldenPlotPipeline')) {
          this.plotImage.setPipeline('GoldenPlotPipeline');
        } else if (renderer.pipelines.get('PlotPipeline')) {
          this.plotImage.setPipeline('PlotPipeline');
        }
      }
    } else {
      if (this.isGolden) {
        this.plotImage = this.scene.add.image(x, y, "golden-plot");
      } else {
        this.plotImage = this.scene.add.image(x, y, this.view ?? "plot");
      }

      this.plotImage.setDepth(this.defaultDepth);
      this.plotImage.setDisplaySize(this.plotSize, this.plotSize);
      this.plotImage.setInteractive();
      // Apply appropriate pipeline
      const renderer = this.scene.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
      if (renderer.pipelines) {
        if (this.isGolden && renderer.pipelines.get('GoldenPlotPipeline')) {
          this.plotImage.setPipeline('GoldenPlotPipeline');
        } else if (renderer.pipelines.get('PlotPipeline')) {
          this.plotImage.setPipeline('PlotPipeline');
        }
      }
    }

    // Use DOM-based block tooltip
    this.plotImage.on("pointerover", (pointer: Phaser.Input.Pointer) => {
      // do not show tooltip when a dialog is open
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
      document.body.appendChild(div);
      this.tooltipDom = div;
      // position tooltip using MouseEvent
      const evt = pointer.event as MouseEvent;
      div.style.left = evt.clientX + "px";
      div.style.top = evt.clientY + "px";
    });
    this.plotImage.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (this.tooltipDom) {
        const evtMove = pointer.event as MouseEvent;
        this.tooltipDom.style.left = evtMove.clientX + "px";
        this.tooltipDom.style.top = evtMove.clientY + "px";
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

      // Set extremely high depth values to ensure it's always on top
      this.plotImage.setDepth(this.defaultDepth + 100);
      this.outline.setDepth(this.defaultDepth + 101);

      // Force move to top of display list with a small delay to ensure it works
      setTimeout(() => {
        this.scene.children.bringToTop(this.plotImage);
        if (this.outline) {
          this.scene.children.bringToTop(this.outline);
        }
      }, 0);
    } else {
      this.plotImage.clearTint();
      this.plotImage.setDepth(this.defaultDepth);

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

