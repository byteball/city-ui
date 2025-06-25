import Phaser from "phaser";

export class RoadPipeline extends Phaser.Renderer.WebGL.Pipelines.MultiPipeline {
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
      name: 'RoadPipeline'
    });
  }
}
