import { IRoad } from "@/global";
import Phaser from "phaser";
import { ROAD_THICKNESS } from "./Map";

const BASE_LABEL_STEP = 600;

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
      // Создаем спрайт, который повторяется по вертикали
      this.scene.add.tileSprite(x, 0, thickness, this.mapHeight, "road-vertical").setOrigin(0, 0);

      // Добавляем название дороги вдоль вертикальной линии
      for (let posY = 0; posY < this.mapHeight; posY += BASE_LABEL_STEP) {
        const roadText = this.scene.add.text(x + thickness / 2, posY, name, {
          fontSize: "42px",
          color: "#ffffff",
        });

        roadText.setOrigin(0.5);
        roadText.setAngle(-90);

        this.labels.push(roadText);
      }
    } else if (orientation === "horizontal") {
      this.scene.add.tileSprite(0, y, this.mapWidth, thickness, "road-horizontal").setOrigin(0, 0);

      // Добавляем название дороги вдоль горизонтальной линии
      for (let posX = 0; posX < this.mapWidth; posX += BASE_LABEL_STEP) {
        const roadText = this.scene.add.text(posX, y + thickness / 2, name, {
          fontSize: "24px",
          color: "#ffffff",
        });

        roadText.setOrigin(0.5);

        this.labels.push(roadText);
      }
    } else {
      throw new Error("Unknown orientation");
    }

    // Добавляем обновление текста в игровой цикл
    this.scene.events.on("update", this.updateLabels, this);
  }

  private updateLabels() {
    const currentZoom = this.scene.cameras.main.zoom;

    if (!this.previousZoom || Math.abs(currentZoom - this.previousZoom) >= this.previousZoom * 0.4) {
      const dynamicStep = BASE_LABEL_STEP / currentZoom;

      this.labels.forEach((label, index) => {
        const baseFontSize = 32; // Базовый размер шрифта
        const newFontSize = baseFontSize / currentZoom; // Увеличиваем текст при уменьшении масштаба

        label.setFontSize(newFontSize);

        // Перемещаем метки в зависимости от динамического шага
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

