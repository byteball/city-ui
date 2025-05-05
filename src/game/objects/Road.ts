import { IRoad } from "@/global";
import Phaser from "phaser";
import { ROAD_THICKNESS } from "./Map";

const BASE_LABEL_STEP = 650;

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
      this.scene.add.tileSprite(x, 0, thickness, this.mapHeight, "road-vertical").setOrigin(0, 0);

      for (let posY = 0; posY < this.mapHeight; posY += BASE_LABEL_STEP) {
        const roadText = this.scene.add.text(x + thickness / 2 + thickness + 10, posY, name, {
          fontSize: "26px",
          color: "#89a4a6",
          fontFamily: "Inter",
        });

        roadText.setOrigin(0);
        roadText.setAngle(-90);
        roadText.setDepth(0);

        this.labels.push(roadText);
      }
    } else if (orientation === "horizontal") {
      this.scene.add.tileSprite(0, y, this.mapWidth, thickness, "road-horizontal").setOrigin(0, 0);

      for (let posX = 0; posX < this.mapWidth; posX += BASE_LABEL_STEP) {
        const roadText = this.scene.add.text(posX, y + thickness / 2 + thickness + 10, name, {
          fontSize: "26px",
          fontFamily: "Inter",
          color: "#89a4a6",
        });

        roadText.setOrigin(0);
        roadText.setAngle(0);
        roadText.setDepth(0);

        this.labels.push(roadText);
      }
    } else {
      throw new Error("Unknown orientation");
    }

    this.scene.events.on("update", this.updateLabels, this);
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
  }
}

