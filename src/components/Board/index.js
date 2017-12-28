/* global PIXI */
import { BOARD_SIZE, FIGURES, BOARD_CELL_SIZE, ANIMATION_SPEED, MIN_FIGURES_LINE } from 'constants/main';

export default class Board extends PIXI.Container {
  figuresCoordinates = new Map();
  coordinatesWithFigures = new Map();

  // TODO: async
  static swapFiguresPositions(figureA, figureB) {
    const posA = [figureA.x, figureA.y];
    const posB = [figureB.x, figureB.y];
    Board.animateFigurePositionChange(figureA, posB);
    Board.animateFigurePositionChange(figureB, posA);
  }

  // TODO: async
  static animateFigurePositionChange(figure, [x, y]) {
    const steps = ANIMATION_SPEED * 10;
    const stepSize = {
      x: (x - figure.x) / steps,
      y: (y - figure.y) / steps,
    };
    const ticker = PIXI.ticker.shared;

    let step = 0;
    const animate = () => {
      figure.position.set(...step === steps ? [x, y] :
        [figure.x + stepSize.x, figure.y + stepSize.y]);

      if (step === steps) {
        ticker.remove(animate);
      }

      step += 1;
    };

    ticker.add(animate);
  }

  constructor(...args) {
    super(...args);

    this.fillTable();
    this.renderScore();
    this.fixSizes();
  }

  areSiblings(figureOne, figureTwo) {
    const figureOneCoords = this.getCoordinatesByFigure(figureOne);
    const figureTwoCoords = this.getCoordinatesByFigure(figureTwo);

    if (!figureOneCoords || !figureTwoCoords) {
      return false;
    }


    return (figureOneCoords.x === figureTwoCoords.x &&
      Math.abs(figureOneCoords.y - figureTwoCoords.y) === 1) ||
      (figureOneCoords.y === figureTwoCoords.y &&
        Math.abs(figureOneCoords.x - figureTwoCoords.x) === 1);
  }

  // TODO: awful
  findFiguresToCollapse(centerFigure, boardSize = BOARD_SIZE) {
    const centerFigureCoords = this.figuresCoordinates.get(centerFigure);
    const omitSides = {
      l: false, r: false, t: false, b: false,
    };

    const elements = {
      h: [], v: [],
    };

    const maxSideSize = Math.max(boardSize.x, boardSize.y);
    for (let idx = 1; idx < maxSideSize; idx += 1) {
      if (!omitSides.l) {
        const lFigure = this.getFigureByCoordinates({
          x: centerFigureCoords.x - idx,
          y: centerFigureCoords.y,
        });
        if (lFigure && lFigure.type === centerFigureCoords.type) {
          elements.h.push(lFigure);
        } else {
          omitSides.l = true;
        }
      }

      if (!omitSides.r) {
        const rFigure = this.getFigureByCoordinates({
          x: centerFigureCoords.x + idx,
          y: centerFigureCoords.y,
        });
        if (rFigure && rFigure.type === centerFigureCoords.type) {
          elements.h.push(rFigure);
        } else {
          omitSides.r = true;
        }
      }

      if (!omitSides.t) {
        const tFigure = this.getFigureByCoordinates({
          x: centerFigureCoords.x,
          y: centerFigureCoords.y - idx,
        });
        if (tFigure && tFigure.type === centerFigureCoords.type) {
          elements.v.push(tFigure);
        } else {
          omitSides.t = true;
        }
      }

      if (!omitSides.b) {
        const bFigure = this.getFigureByCoordinates({
          x: centerFigureCoords.x,
          y: centerFigureCoords.y + idx,
        });
        if (bFigure && bFigure.type === centerFigureCoords.type) {
          elements.v.push(bFigure);
        } else {
          omitSides.b = true;
        }
      }
    }

    return [
      ...elements.h.length >= MIN_FIGURES_LINE - 1 ? elements.h : [],
      ...elements.v.length >= MIN_FIGURES_LINE - 1 ? elements.v : [],
      ...Math.max(elements.v.length, elements.h.length) >= MIN_FIGURES_LINE - 1 ?
        [centerFigure] : [],
    ];
  }

  fillTable({
    boardSize = BOARD_SIZE,
    figures = FIGURES,
    boardCellSize = BOARD_CELL_SIZE,
  } = {}) {
    // no Array.apply(null, { length: boardSize.x }).forEach... here, sorry
    // it is more easy to use lodash range()
    for (let x = 0; x < boardSize.x; x += 1) {
      for (let y = 0; y < boardSize.y; y += 1) {
        const boardCellSizeWithoutPaddings = BOARD_CELL_SIZE / 1.5;
        const figure = this.createRandomFigure(figures);
        this.storeFigure(figure, { x, y });
        figure.position.set(x * boardCellSize, y * boardCellSize);
        figure.scale.set(boardCellSizeWithoutPaddings / 10);
        this.addChild(figure);
      }
    }
  }

  createRandomFigure(figures) {
    const figureTypeIndex = Math.floor(Math.random() * figures.length);
    const FigureType = figures[figureTypeIndex];
    return new FigureType({ onClick: this.onClick });
  }

  onClick = (e) => {
    const highlighted = this.children.find(figure => figure.highlight);
    e.target.toggleHighlight();

    if (highlighted && this.areSiblings(highlighted, e.target)) {
      this.swapFigures(highlighted, e.target);

      e.target.highlight = false;
      highlighted.highlight = false;

      // TODO: strategy
      // const figuresToCollapse = [
      //   ...this.findFiguresToCollapse(highlighted),
      //   ...this.findFiguresToCollapse(e.target),
      // ];
      //
      // if (figuresToCollapse.length === 0) {
      //   this.swapFigures(highlighted, e.target);
      // }
    } else if (highlighted && highlighted !== e.target) {
      highlighted.highlight = false;
    }
  };

  swapFigures(aFigure, bFigure) {
    Board.swapFiguresPositions(aFigure, bFigure);
    this.storeSwappedCoordinates(aFigure, bFigure);
  }

  fixSizes() {
    this.pivot.set(this.width / 2, this.height / 2);
    this.position.set(
      Math.max(this.width, window.innerWidth) / 2,
      Math.max(this.height, window.innerHeight) / 2,
    );
  }

  renderScore() {
    this.score = new PIXI.Text('Score: 0', {
      fontFamily : 'Arial',
      fontSize: 24,
      fill : 0xFFFFFF,
      align : 'center',
    });

    this.score.pivot.x = this.score.width / 2;
    this.score.position.set(this.width / 2, this.height);

    this.addChild(this.score);
  }

  storeFigure(figure, coordinates) {
    this.figuresCoordinates.set(figure, coordinates);
    this.coordinatesWithFigures.set(JSON.stringify(coordinates), figure);
  }

  removeFigure(figure) {
    const coordinates = this.getCoordinatesByFigure(figure);
    this.coordinatesWithFigures.set(JSON.stringify(coordinates), null);
    this.figuresCoordinates.delete(figure);
  }

  getCoordinatesByFigure(figure) {
    return this.figuresCoordinates.get(figure);
  }

  getFigureByCoordinates(coordinates) {
    return this.coordinatesWithFigures.get(JSON.stringify(coordinates));
  }

  storeSwappedCoordinates(aFigure, bFigure) {
    const coordsBuffer = this.getCoordinatesByFigure(aFigure);
    this.storeFigure(aFigure, this.getCoordinatesByFigure(bFigure));
    this.storeFigure(bFigure, coordsBuffer);
  }
}
