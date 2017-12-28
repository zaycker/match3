import Circle from 'components/Circle';
import Triangle from 'components/Triangle';
import Square from 'components/Square';

export const BOARD_SIZE = {
  x: 13,
  y: 13,
};
export const BOARD_CELL_SIZE = 24;
export const FIGURES = [Circle, Square, Triangle];
export const FIGURES_COST = [30, 10, 20];
export const MIN_FIGURES_LINE = 3;

export const ANIMATION_SPEED = 1;

export default {};
