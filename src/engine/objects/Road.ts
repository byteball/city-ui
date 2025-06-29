import Phaser from "phaser";

import { IRoad } from "@/global";
import { ROAD_THICKNESS } from "./Map";

const BASE_LABEL_STEP = 900;

export class Road {
  private scene: Phaser.Scene;
  private data: IRoad;
  // use image labels for caching
  private labels: Phaser.GameObjects.Image[] = [];
  private previousZoom: number = 0;

  constructor(scene: Phaser.Scene, data: IRoad, private mapWidth: number, private mapHeight: number) {
    this.scene = scene;
    this.data = data;

    this.createRoad();
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
      const roadTile = this.scene.add.tileSprite(x, 0, thickness, this.mapHeight, "road-vertical")
        .setOrigin(0, 0)
        .setDepth(25)
        .setAlpha(1);
      const renderer = this.scene.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
      if (renderer.pipelines) {
        if (renderer.pipelines.get('VerticalRoadPipeline')) {
          roadTile.setPipeline('VerticalRoadPipeline');
        } else if (renderer.pipelines.get('RoadPipeline')) {
          roadTile.setPipeline('RoadPipeline');
        }
      }
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
      const roadTile = this.scene.add.tileSprite(0, y, this.mapWidth, thickness, "road-horizontal")
        .setOrigin(0, 0)
        .setDepth(25)
        .setAlpha(1);
      const renderer = this.scene.game.renderer as Phaser.Renderer.WebGL.WebGLRenderer;
      if (renderer.pipelines) {
        if (renderer.pipelines.get('HorizontalRoadPipeline')) {
          roadTile.setPipeline('HorizontalRoadPipeline');
        } else if (renderer.pipelines.get('RoadPipeline')) {
          roadTile.setPipeline('RoadPipeline');
        }
      }
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

  private updateLabels() {
    const currentZoom = this.scene.cameras.main.zoom;

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

    // Show labels only when they are fully inside the camera view
    const viewRect = this.scene.cameras.main.worldView;
    this.labels.forEach(label => {
      const b = label.getBounds();
      const fullyVisible = viewRect.contains(b.left, b.top) && viewRect.contains(b.right, b.bottom);
      label.setVisible(fullyVisible);
    });
  }
}

