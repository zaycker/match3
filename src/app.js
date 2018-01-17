/* global PIXI */
import Board from './Board';
import spriteJSON from './sprites.json';
import spritePNG from './sprites.png';
import * as config from './constants';

const score = {
  get value() {
    return this.val;
  },
  set value(v) {
    this.val = v;
    this.view.text = `Score: ${v}`;
  },
  view: new PIXI.Text('Score: 0', {
    fontFamily: 'Arial',
    fontSize: 24,
    fill: 0xFFFFFF,
    align: 'center',
  }),
};

function onTilesLoaded(loader, resources) {
  const sheet = new PIXI.Spritesheet(resources.shapes.texture.baseTexture, spriteJSON);
  sheet.parse(() => {});
  const app = new PIXI.Application(window.innerWidth, window.innerHeight, {
    antialias: true,
    backgroundColor: 0x888888,
  });
  document.body.appendChild(app.view);

  const board = new Board(config);
  board.on('scorechange', (data) => { score.value = data.score; });
  app.stage.addChild(board);

  app.stage.addChild(score.view);

  board.position.set((app.screen.width - board.width) / 2, 10);
  score.view.position.set((app.screen.width - score.view.width) / 2, board.height + 20);
}

const loader = new PIXI.loaders.Loader();
loader.add('shapes', spritePNG);
loader.load(onTilesLoaded);
