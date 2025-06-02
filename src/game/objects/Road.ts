import Phaser from "phaser";

import { IRoad } from "@/global";
import { ROAD_THICKNESS } from "./Map";

const BASE_LABEL_STEP = 900;

export class Road {
  private scene: Phaser.Scene;
  private data: IRoad;
  private labels: Phaser.GameObjects.Text[] = [];
  private previousZoom: number = 0;

  constructor(scene: Phaser.Scene, data: IRoad, private mapWidth: number, private mapHeight: number) {
    this.scene = scene;
    this.data = data;

    this.createRoad();
  }

  private createRoad() {
    const { x, y, name, orientation } = this.data;

    const thickness = ROAD_THICKNESS;

    if (orientation === "vertical") {
      this.scene.add.tileSprite(x, 0, thickness, this.mapHeight, "road-vertical")
        .setOrigin(0, 0)
        .setDepth(25)
        .setAlpha(0.4);
      for (let posY = 0; posY < this.mapHeight; posY += BASE_LABEL_STEP) {
        const roadText = this.scene.add.text(x + thickness / 2 + thickness + 10, posY, name, {
          fontSize: "26px",
          color: "#fff",
          fontFamily: "Inter",
        });

        roadText.setOrigin(0);
        roadText.setAngle(-90);
        roadText.setDepth(26);
        roadText.setAlpha(0.5);

        this.labels.push(roadText);
      }
    } else if (orientation === "horizontal") {
      this.scene.add.tileSprite(0, y, this.mapWidth, thickness, "road-horizontal")
        .setOrigin(0, 0)
        .setDepth(25)
        .setAlpha(0.4);

      for (let posX = 0; posX < this.mapWidth; posX += BASE_LABEL_STEP) {
        const roadText = this.scene.add.text(posX, y + thickness / 2 + thickness + 10, name, {
          fontSize: "26px",
          fontFamily: "Inter",
          color: "#fff",
        });

        roadText.setOrigin(0);
        roadText.setAngle(0);
        roadText.setDepth(26);
        roadText.setAlpha(0.5);

        this.labels.push(roadText);
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

      this.labels.forEach((label, index) => {
        const baseFontSize = 32;
        const newFontSize = baseFontSize / (currentZoom * 1.1);

        label.setFontSize(newFontSize);

        if (this.data.orientation === "vertical") {
          label.y = index * dynamicStep;
        } else if (this.data.orientation === "horizontal") {
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

