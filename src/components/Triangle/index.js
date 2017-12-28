import Graphics from 'components/Graphics';

export default class Triangle extends Graphics {
  type = 'Triangle';

  constructor(options = {}) {
    super(options);

    this.draw();

    this.interactive = true;
    this.cursor = 'pointer';

    if (options.onClick) {
      this.on('click', options.onClick);
    }
  }

  draw() {
    this.beginFill(0x0BFF70, 1);
    this.lineStyle(this.lineWidth, this.lineColor);
    this.moveTo(0, 0);
    this.lineTo(10, 0);
    this.lineTo(5, -8.66);
    this.lineTo(0, 0);
    this.pivot.set(5, -5);
    this.endFill();
  }
}
