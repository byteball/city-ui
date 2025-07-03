import Phaser from "phaser";

export class VerticalRoadPipeline extends Phaser.Renderer.WebGL.Pipelines.SinglePipeline {
  constructor(game: Phaser.Game) {
    super({
      game,
      fragShader: `
        precision mediump float;
        uniform sampler2D uMainSampler;

        varying vec2 outTexCoord;
        varying vec4 outTint;

        void main() {
          gl_FragColor = texture2D(uMainSampler, outTexCoord) * outTint;
        }
      `,
      name: 'VerticalRoadPipeline'
    });
  }
}
