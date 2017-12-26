import Graphics from 'components/Graphics';

export default class Circle extends Graphics {
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
    this.beginFill(0xFF700B, 1);
    this.lineStyle(this.lineWidth, this.lineColor);
    this.drawCircle(0, 0, 5);
    this.endFill();
  }
}
