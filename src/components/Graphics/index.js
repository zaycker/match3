/* global PIXI */

export default class Graphics extends PIXI.Graphics {
  _highlighted = false;

  get highlight() {
    return this._highlighted;
  }

  set highlight(state) {
    this.graphicsData.forEach(gD => {
      gD.lineWidth = state ? 1 : this.lineWidth;
      gD.lineColor = state ? 0xFFF00B : this.lineColor;
      gD.lineAlpha = state ? 0.9 : this.lineAlpha;
    });

    this._highlighted = state;
    this.dirty++;
    this.clearDirty++;
  }

  constructor(options = {}) {
    super(options.nativeLines);
    this.options = options;
  }

  toggleHighlight() {
    this.highlight = !this.highlight;
  }
}
