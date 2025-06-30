import Phaser from "phaser";

import { IRoad } from "@/global";
import { ROAD_THICKNESS } from "./Map";

const BASE_LABEL_STEP = 900;

export class Road {
  private scene: Phaser.Scene;
  private data: IRoad;
  private roadTile: Phaser.GameObjects.TileSprite;
  // use image labels for caching
  private labels: Phaser.GameObjects.Image[] = [];
  private previousZoom: number = 0;
  private lastViewRect: Phaser.Geom.Rectangle;

  constructor(scene: Phaser.Scene, data: IRoad, private mapWidth: number, private mapHeight: number) {
    this.scene = scene;
    this.data = data;

    this.createRoad();
    this.scene.events.on(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
  }

  private applyPipeline(orientation: "vertical" | "horizontal") {
    const renderer = this.scene.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
    if (!renderer.pipelines) return;

    const pipelineName = orientation === "vertical" ? "VerticalRoadPipeline" : "HorizontalRoadPipeline";

    if (renderer.pipelines.get(pipelineName)) {
      this.roadTile.setPipeline(pipelineName);
    } else if (renderer.pipelines.get("RoadPipeline")) {
      this.roadTile.setPipeline("RoadPipeline");
    }
  }

  private createRoad() {
    const { x, y, name, orientation } = this.data;

    // prepare cached label texture for this road name
    const rtKey = `roadLabel_${name}`;
    if (!this.scene.textures.exists(rtKey)) {
      // measure text
      const baseFontSize = 32;
      const tempText = this.scene.make.text({ text: name, style: { fontSize: `${baseFontSize}px`, fontFamily: 'Inter', color: '#fff' }, add: false });
      const bounds = tempText.getBounds();
      const width = Math.ceil(bounds.width);
      const height = Math.ceil(bounds.height);
      // create canvas texture
      const canvasTex = this.scene.textures.createCanvas(rtKey, width, height);
      if (canvasTex) {
        const ctx = canvasTex.context;
        ctx.font = `${baseFontSize}px Inter`;
        ctx.fillStyle = '#fff';
        ctx.textBaseline = 'top';
        ctx.fillText(name, 0, 0);
        canvasTex.refresh();
      }
      tempText.destroy();
    }

    const thickness = ROAD_THICKNESS;

    if (orientation === "vertical") {
      // add road tile and apply pipeline
      this.roadTile = this.scene.add
        .tileSprite(x, 0, thickness, this.mapHeight, "road-vertical")
        .setOrigin(0, 0)
        .setDepth(25)
        .setAlpha(1);
      this.applyPipeline(orientation);

      // place cached label images
      for (let idx = 0; idx * BASE_LABEL_STEP < this.mapHeight; idx++) {
        const posY = idx * BASE_LABEL_STEP;
        // origin at middle vertically for consistent gap
        const label = this.scene.add.image(x + thickness / 3 + thickness + 10, posY, rtKey)
          .setOrigin(0)
          .setAngle(-90)
          .setDepth(26)
          .setAlpha(0.3);
        this.labels.push(label);
      }
    } else if (orientation === "horizontal") {
      // add road tile and apply pipeline
      this.roadTile = this.scene.add
        .tileSprite(0, y, this.mapWidth, thickness, "road-horizontal")
        .setOrigin(0, 0)
        .setDepth(25)
        .setAlpha(1);
      this.applyPipeline(orientation);

      // place cached label images
      for (let idx = 0; idx * BASE_LABEL_STEP < this.mapWidth; idx++) {
        const posX = idx * BASE_LABEL_STEP;
        // origin at middle horizontally for consistent gap
        const label = this.scene.add.image(posX, y + thickness / 3 + thickness + 10, rtKey)
          .setOrigin(0)
          .setAngle(0)
          .setDepth(26)
          .setAlpha(0.3);
        this.labels.push(label);
      }
    } else {
      throw new Error("Unknown orientation");
    }

    this.scene.events.on("update", this.updateLabels, this);
    // Initial clip to hide labels outside the initial camera view
    this.updateLabels();
  }

  public destroy() {
    this.scene.events.off(Phaser.Scenes.Events.SHUTDOWN, this.destroy, this);
    this.scene.events.off("update", this.updateLabels, this);

    if (this.roadTile) {
      this.roadTile.destroy();
    }

    this.labels.forEach((label) => label.destroy());
    this.labels = [];
  }

  private updateLabels() {
    const currentZoom = this.scene.cameras.main.zoom;
    const viewRect = this.scene.cameras.main.worldView;

    const viewChanged = !this.lastViewRect || !Phaser.Geom.Rectangle.Equals(this.lastViewRect, viewRect);

    if (viewChanged) {
      // Show labels only when they are fully inside the camera view
      this.labels.forEach((label) => {
        const b = label.getBounds();
        const fullyVisible = viewRect.contains(b.left, b.top) && viewRect.contains(b.right, b.bottom);
        label.setVisible(fullyVisible);
      });
    }

    if (!this.previousZoom || Math.abs(currentZoom - this.previousZoom) >= this.previousZoom * 0.5) {
      const dynamicStep = BASE_LABEL_STEP / currentZoom;
      // scale so that height = baseFontSize/(zoom*1.07)
      const scale = 1 / (currentZoom * 1.07);
      this.labels.forEach((label, index) => {
        label.setScale(scale);
        if (this.data.orientation === "vertical") {
          label.y = index * dynamicStep;
        } else {
          label.x = index * dynamicStep;
        }
      });

      this.previousZoom = currentZoom;
    }

    if (viewChanged) {
      this.lastViewRect = Phaser.Geom.Rectangle.Clone(viewRect);
    }
  }
}

