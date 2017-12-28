import Graphics from 'components/Graphics';

export default class Square extends Graphics {
  type = 'Square';

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
    this.beginFill(0x0B70FF, 1);
    this.lineStyle(this.lineWidth, this.lineColor);
    this.drawRect(0, 0, 10, 10);
    this.pivot.set(5, 5);
    this.endFill();
  }
}
