/* global PIXI */

export default class Board extends PIXI.Container {
  selected = null;

  score = 0;

  constructor(config) {
    super();

    this.config = config;
    this.init();
  }

  init() {
    this.interactive = true;
    this.on('pointerdown', this.onClick);
    this.fillBoard();
  }

  fillBoard() {
    for (let i = 0; i < this.config.GRID_SIZE[0]; i += 1) {
      for (let j = 0; j < this.config.GRID_SIZE[1]; j += 1) {
        this.addChild(this.getRandomTile(i, j));
      }
    }
  }

  onClick = async (e) => {
    if (typeof e.target.metaIndex === 'undefined') {
      return;
    }

    const isAlreadySelected = this.selected === e.target;

    if (isAlreadySelected) {
      this.toggleActive(this.selected, false);
      this.selected = null;
    } else if (!this.selected) {
      this.selected = e.target;
      this.toggleActive(this.selected, true);
    } else {
      this.toggleActive(this.selected, false);

      if (this.selected.metaIndex !== e.target.metaIndex && this.isSiblings(this.selected, e.target)) {
        const figAIndex = this.getChildIndex(this.selected);
        const figBIndex = this.getChildIndex(e.target);

        await this.swapFigures(this.selected, e.target);

        const figA = this.getChildAt(figAIndex);
        const figB = this.getChildAt(figBIndex);

        const toCollapseWithFigA = this.findFiguresToCollapseFrom(figA);
        const toCollapseWithFigB = this.findFiguresToCollapseFrom(figB);

        if (!toCollapseWithFigA.length && !toCollapseWithFigB.length) {
          await this.swapFigures(figA, figB);
        } else {
          await this.collapseFigures((toCollapseWithFigA.length ? toCollapseWithFigA.concat(figA) : [])
            .concat(toCollapseWithFigB.length ? toCollapseWithFigB.concat(figB) : []));
        }

        this.selected = null;
      } else {
        this.selected = e.target;
        this.toggleActive(this.selected, true);
      }
    }
  };

  getRandomTile(i, j) {
    const metaIndex = Math.floor(Math.random() * this.config.FIGURES_META.length);
    const tile = PIXI.Sprite.fromFrame(this.config.FIGURES_META[metaIndex][1]);

    tile.metaIndex = metaIndex;
    tile.buttonMode = true;
    tile.interactive = true;
    tile.acive = false;

    tile.width = this.config.BOARD_CELL_SIZE;
    tile.height = this.config.BOARD_CELL_SIZE;
    tile.x = i * this.config.BOARD_CELL_SIZE * 1.1;
    tile.y = j * this.config.BOARD_CELL_SIZE * 1.1;

    return tile;
  }

  collapseFigures = async (aFigures) => {
    aFigures.forEach((figure) => {
      this.score += this.config.FIGURES_META[figure.metaIndex][3];
      this.emit('scorechange', { score: this.score });
      figure.texture = PIXI.Texture.EMPTY;
      figure.metaIndex = null;
    });

    return this.fillEmpties();
  };

  async fillEmpties() {
    for (let i = 0; i < this.config.GRID_SIZE[1]; i += 1) {
      await this.fillRowEmpties(i);
    }

    return Promise.resolve();
  }

  async fillRowEmpties(j) {
    return Promise.all(Array.apply(null, { length: this.config.GRID_SIZE[0] }).map((_, i) => {
      const cell = this.getFigureAt(i, j);
      return cell.metaIndex === null ? this.moveColumnDown(i, j) : Promise.resolve();
    }));
  }

  async moveColumnDown(i, j) {
    const fromCell = this.getFigureAt(i, j);
    return Promise.all(Array.apply(null, { length: j + 1 }).map((_, index) => {
      const rowIndex = j - index;
      if (rowIndex === 0) {
        const newTile = this.getRandomTile(i, -1);
        fromCell.x = newTile.x;
        fromCell.y = newTile.y;
        fromCell.metaIndex = newTile.metaIndex;
        fromCell.texture = newTile.texture;
        return this.animateFigurePositionChange(fromCell, [fromCell.x, 0]);
      } else {
        return this.swapFigures(fromCell, this.getFigureAt(i, rowIndex - 1));
      }
    }));
  }

  findFiguresToCollapseFrom(aFigure) {
    const figureIndexes = this.getFigureIndixes(aFigure);

    const toCollapse = {
      l: [],
      r: [],
      t: [],
      b: [],
    };

    const sideFinished = {
      l: false,
      r: false,
      t: false,
      b: false,
    };

    const steps = Math.max(this.config.GRID_SIZE[0], this.config.GRID_SIZE[1]);
    let step = 1;

    while (step < steps) {
      [
        ['l', figureIndexes[0] - step, figureIndexes[1]],
        ['r', figureIndexes[0] + step, figureIndexes[1]],
        ['t', figureIndexes[0], figureIndexes[1] - step],
        ['b', figureIndexes[0], figureIndexes[1] + step],
      ].forEach((meta) => {
        if (sideFinished[meta[0]]) {
          return;
        }

        // check indexes bounds
        if (meta[1] < 0 || meta[1] >= this.config.GRID_SIZE[0] || meta[2] < 0 || meta[2] >= this.config.GRID_SIZE[1]) {
          sideFinished[meta[0]] = true;
          return;
        }

        const figureAtIndex = this.getFigureAt(meta[1], meta[2]);

        if (figureAtIndex.metaIndex === aFigure.metaIndex) {
          toCollapse[meta[0]].push(figureAtIndex);
        } else {
          sideFinished[meta[0]] = true;
        }
      });

      step += 1;
    }

    const horizontal = toCollapse.l.concat(toCollapse.r);
    const vertical = toCollapse.t.concat(toCollapse.b);
    return (horizontal.length >= this.config.MIN_FIGURES_LINE - 1 ? horizontal : [])
      .concat(vertical.length >= this.config.MIN_FIGURES_LINE - 1 ? vertical : []);
  }

  toggleActive(figure, toggle = null) {
    const active = toggle === null ? !figure.active : toggle;

    if (figure.active === active) {
      return;
    }

    figure.texture = PIXI.Texture.fromFrame(this.config.FIGURES_META[figure.metaIndex][active ? 2 : 1]);
    figure.active = active;
  }

  isSiblings(figA, figB) {
    const figAIndexes = this.getFigureIndixes(figA);
    const figBIndexes = this.getFigureIndixes(figB);

    return (figAIndexes[0] === figBIndexes[0] &&
      Math.abs(figAIndexes[1] - figBIndexes[1]) === 1) ||
      (figAIndexes[1] === figBIndexes[1] &&
        Math.abs(figAIndexes[0] - figBIndexes[0]) === 1);
  }

  getFigureIndixes(figure) {
    const oneDimIndex = this.getChildIndex(figure);
    return [Math.floor(oneDimIndex / this.config.GRID_SIZE[0]), oneDimIndex % this.config.GRID_SIZE[0]];
  }

  getFigureAt(i, j) {
    return this.getChildAt((i * this.config.GRID_SIZE[0]) + j);
  }

  async swapFigures(figA, figB) {
    const figAIndexes = this.getFigureIndixes(figA);
    const figBIndexes = this.getFigureIndixes(figB);

    this.interactive = false;
    this.swapChildren(figA, figB);

    await Promise.all([
      this.animateFigurePositionChange(
        figA,
        [figBIndexes[0] * this.config.BOARD_CELL_SIZE * 1.1,
          figBIndexes[1] * this.config.BOARD_CELL_SIZE * 1.1],
      ),
      this.animateFigurePositionChange(
        figB,
        [figAIndexes[0] * this.config.BOARD_CELL_SIZE * 1.1,
          figAIndexes[1] * this.config.BOARD_CELL_SIZE * 1.1],
      ),
    ]);

    this.interactive = true;
  }

  async animateFigurePositionChange(figure, [x, y]) {
    const steps = 10 / this.config.ANIMATION_SPEED;
    const stepSize = [(x - figure.x) / steps, (y - figure.y) / steps];
    const ticker = PIXI.ticker.shared;

    return new Promise((resolve) => {
      let step = 0;
      const animate = () => {
        if (step >= steps) {
          figure.position.set(x, y);
          ticker.remove(animate);
          resolve();
        } else {
          figure.position.set(figure.x + stepSize[0], figure.y + stepSize[1]);
        }

        step += 1;
      };

      ticker.add(animate);
    });
  }
}
