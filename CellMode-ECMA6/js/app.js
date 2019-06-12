import * as Constants from './constants.js';
import Game from './game.js';

// Init
Constants.AREA_SIZE_INPUT.addEventListener('change', onNumberInputValueChanges, false);
Constants.BTN_START.addEventListener('click', () => game.start(), false);
Constants.BTN_RESET.addEventListener('click', () => game.reset(), false);
document.addEventListener('keydown', onKeyDown, false);

function onNumberInputValueChanges(e) {
  const min = Number(e.target.min),
    max = Number(e.target.max),
    value = e.target.value;

  const newValue = Number(value.replace(/[^0-9]/g,''));
  if (newValue < min) {
    e.target.value = min;
  } else if (newValue > max) {
    e.target.value = max;
  }
}

function onKeyDown(e) {
  if (e.key === 'ArrowLeft' || e.key === 'Left') {
    game.setDirection('L');
  } else if (e.key === 'ArrowUp' || e.key === 'Up') {
    game.setDirection('U');
  } else if (e.key === 'ArrowRight' || e.key === 'Right') {
    game.setDirection('R');
  } else if (e.key === 'ArrowDown' || e.key === 'Down') {
    game.setDirection('D');
  }
}

const game = new Game();
game.reset();