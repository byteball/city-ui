import Phaser from "phaser";

export class PlotPipeline extends Phaser.Renderer.WebGL.Pipelines.MultiPipeline {
  constructor(game: Phaser.Game) {
    super({
      game,
      fragShader: `
        precision mediump float;
        uniform sampler2D uMainSampler;
        
        varying vec2 outTexCoord;
        varying vec4 outTint;
        
        void main() {
          vec4 color = texture2D(uMainSampler, outTexCoord) * outTint;
          gl_FragColor = color;
        }
      `,
      name: 'PlotPipeline'
    });
  }
}
