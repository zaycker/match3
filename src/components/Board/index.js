/* global PIXI */

import { BOARD_SIZE, FIGURES, BOARD_CELL_SIZE } from 'constants/main';

export default class Board extends PIXI.Container {
  figuresCoordinates = new Map();

  constructor(...args) {
    super(...args);

    this.fillTable();
    this.renderScore();
    this.fixSizes();
  }

  isSiblings(figureOne, figureTwo) {
    const figureOneTableIndex = this.figuresCoordinates.get(figureOne);
    const figureTwoTableIndex = this.figuresCoordinates.get(figureTwo);

    if (!figureOneTableIndex || !figureTwoTableIndex) {
      return false;
    }


    return (figureOneTableIndex.x === figureTwoTableIndex.x &&
      Math.abs(figureOneTableIndex.y - figureTwoTableIndex.y) === 1) ||
      (figureOneTableIndex.y === figureTwoTableIndex.y &&
        Math.abs(figureOneTableIndex.x - figureTwoTableIndex.x) === 1);
  }

  fillTable({
    boardSize = BOARD_SIZE,
    figures = FIGURES,
    boardCellSize = BOARD_CELL_SIZE,
  } = {}) {
    // no Array.apply(null, { length: boardSize.x }).forEach... here, sorry
    // it is more easy to use lodash range()
    for (let x = 0; x < boardSize.x; x++) {
      for (let y = 0; y < boardSize.y; y++) {
        const boardCellSizeWithoutPaddings = BOARD_CELL_SIZE / 1.5;
        const figureTypeIndex = Math.floor(Math.random() * figures.length);
        const FigureType = figures[figureTypeIndex];
        const figure = new FigureType({ onClick: this.onClick });
        this.figuresCoordinates.set(figure, { x, y });
        figure.position.set(x * boardCellSize, y * boardCellSize);
        figure.scale.set(boardCellSizeWithoutPaddings / 10);
        this.addChild(figure);
      }
    }
  }

  onClick = (e) => {
    const highlighted = this.children.find(figure => figure.highlight);
    e.target.toggleHighlight();

    if (highlighted && this.isSiblings(highlighted, e.target)) {
      const aFigurePosition = [highlighted.x, highlighted.y];
      highlighted.position.set(e.target.x, e.target.y);
      e.target.position.set(...aFigurePosition);

      e.target.highlight = false;
      highlighted.highlight = false;

      const coordsBuffer = this.figuresCoordinates.get(highlighted);
      this.figuresCoordinates.set(highlighted, this.figuresCoordinates.get(e.target));
      this.figuresCoordinates.set(e.target, coordsBuffer);
    } else if (highlighted && highlighted !== e.target) {
      highlighted.highlight = false;
    }
  };

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
}
