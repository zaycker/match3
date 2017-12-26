/* global PIXI */
import Board from 'components/Board';

export default class Application extends PIXI.Application {
  constructor(...args) {
    super(...args);

    this.renderBoard();
  }

  renderBoard() {
    this.stage.addChild(new Board());
  }
}
