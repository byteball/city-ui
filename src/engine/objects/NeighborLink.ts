import Phaser from "phaser";

import { House } from "./House";

import { IMatch } from "@/lib/getMatches";

export class NeighborLink {
  private scene: Phaser.Scene;
  private link: Phaser.GameObjects.Graphics;
  private house1: House;
  private house2: House;
  private match: IMatch;
  private lineWidth: number;
  private lineColor: number;
  private curve: Phaser.Curves.QuadraticBezier;
  private archType: 'low' | 'medium' | 'high';

  constructor(
    scene: Phaser.Scene,
    house1: House,
    house2: House,
    match: IMatch,
    lineWidth: number = 8,
    lineColor: number = 0xff0000
  ) {
    this.scene = scene;
    this.house1 = house1;
    this.house2 = house2;
    this.match = match;
    this.lineWidth = lineWidth;
    this.lineColor = lineColor;

    // Only create link if scene is valid and has add property
    if (this.scene && this.scene.add && this.scene.add !== null) {
      this.createLink();
    } else {
      console.warn('NeighborLink: Scene is not available during construction, skipping link creation');
    }
  }

  private createLink() {
    // Check if scene is still valid and has the add property
    if (!this.scene || !this.scene.add || this.scene.add === null) {
      console.warn('NeighborLink: Scene is not available, skipping link creation');
      return;
    }

    // Get the coordinates of the rooftops of the houses
    const roof1 = this.house1.getRooftopCoordinates();
    const roof2 = this.house2.getRooftopCoordinates();

    const x1 = roof1.x;
    const y1 = roof1.y;
    const x2 = roof2.x;
    const y2 = roof2.y;

    try {
      // Create a graphics object for the line
      this.link = this.scene.add.graphics();
    } catch (error) {
      console.warn('NeighborLink: Failed to create graphics object, scene may be destroyed:', error);
      return;
    }
    this.link.setDepth(60); // Set depth above houses
    this.link.setAlpha(0.8);
    // Configure line style - red, rounded
    this.link.lineStyle(this.lineWidth, this.lineColor, 1);

    // Draw a smooth curve between house rooftops
    const midX = (x1 + x2) / 2;
    const midY = (y1 + y2) / 2;

    // Add vertical offset upward for a beautiful arch above houses
    const distance = Phaser.Math.Distance.Between(x1, y1, x2, y2);

    // Determine arch type based on distance
    if (distance < 200) {
      this.archType = 'low';
    } else if (distance < 500) {
      this.archType = 'medium';
    } else {
      this.archType = 'high';
    }

    // Configure arch parameters for rainbow-like semicircle
    let archHeight: number;

    switch (this.archType) {
      case 'low':
        // Perfect semicircle height = radius = distance/2
        archHeight = Math.max(distance * 0.5, 120);
        break;
      case 'medium':
        archHeight = Math.max(distance * 0.5, 150);
        break;
      case 'high':
        archHeight = Math.max(distance * 0.5, 200);
        break;
    }

    // For perfect rainbow semicircle, control point should be directly above midpoint
    const controlX = midX;
    const controlY = midY - archHeight; // Move control point directly upward

    // Create a smooth curve using Path
    this.curve = new Phaser.Curves.QuadraticBezier(
      new Phaser.Math.Vector2(x1, y1),
      new Phaser.Math.Vector2(controlX, controlY),
      new Phaser.Math.Vector2(x2, y2)
    );

    // Draw curve with more points for smoother arch
    const curvePoints = this.curve.getPoints(140);

    this.drawSimpleArch(curvePoints);
  }

  private drawSimpleArch(points: Phaser.Math.Vector2[]) {
    this.link.lineStyle(this.lineWidth, this.lineColor, 0.8);
    this.link.strokePoints(points);
  }

  public destroy() {
    try {
      if (this.link && typeof this.link.destroy === 'function') {
        this.link.destroy();
      }
    } catch (error) {
      console.warn('NeighborLink: Error during link destruction:', error);
    } finally {
      this.link = null as any; // Clear reference
    }
  }

  public getMatch(): IMatch {
    return this.match;
  }

  public getHouses(): [House, House] {
    return [this.house1, this.house2];
  }

  public getArchType(): 'low' | 'medium' | 'high' {
    return this.archType;
  }

  public setVisible(visible: boolean) {
    if (this.isValid()) {
      this.link.setVisible(visible);
    }
  }

  public setAlpha(alpha: number) {
    if (this.isValid()) {
      this.link.setAlpha(alpha);
    }
  }

  public updateStyle(lineWidth?: number, lineColor?: number) {
    if (lineWidth !== undefined) {
      this.lineWidth = lineWidth;
    }
    if (lineColor !== undefined) {
      this.lineColor = lineColor;
    }

    if (this.link) {
      this.link.destroy();
      this.createLink();
    }
  }

  public isValid(): boolean {
    return !!(this.scene && this.scene.add && this.link);
  }
}
