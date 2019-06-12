import * as Constants from './constants.js';
import Snake from './snake.js';
import Rabbit from './rabbit.js';

export default class Game {
  constructor() {
    this.moveStep = { L: -1, U: -10, R: 1, D: 10 };
    this.areaSize = 10;
    this.snake = new Snake();
    this.newDirection = 'R';
    this.direction = 'R';
    this.timerId = undefined;
    this.rabbitCount = 0;
    this.rabbit = undefined;
  }

  setDirection(newValue) {
    this.newDirection = newValue;
  }

  start() {
    this.reset();
    Constants.IS_OVER_ELEMENT.style.display = 'none';
    this.createRabbit();
    this.timerId = setInterval(() => this.onTickHandler(), Constants.TICK_INTERVAL_MS);
    console.log('The game is started');
  }

  reset() {
    Constants.IS_OVER_ELEMENT.style.display = 'none';
    this.gameOver();
    this.areaSize = Number(Constants.AREA_SIZE_INPUT.value);
    this.direction = 'R';
    this.newDirection = 'R';
    this.moveStep['U'] =  -this.areaSize;
    this.moveStep['D'] =  this.areaSize;
    this.rabbitCount = 0;

    // Clear container
    while (Constants.CONTAINER_NODE.firstChild) {
      Constants.CONTAINER_NODE.removeChild(Constants.CONTAINER_NODE.firstChild)
    }
    // Fill container by cells
    for (let i1 = 0; i1 < this.areaSize; i1++) {
      const rowClass = i1 === 0 ? 'firstrow ' : '';
      for (let i2 = 0; i2 < this.areaSize; i2++) {
        const cell = document.createElement('div');
        cell.className = rowClass + (i2 === 0 ? 'cell firstcell' : 'cell');
        Constants.CONTAINER_NODE.appendChild(cell);
      }
    }

    this.snake.init(this.newDirection);
  }

  gameOver() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = undefined;
      console.log('The game is over');
      Constants.IS_OVER_ELEMENT.style.display = '';
    }
  }

  onTickHandler() {
    const newCellIndex = this.snake.headIndex + this.moveStep[this.newDirection];
    // meet top/bottom border
    let gameOverFlag = newCellIndex < 0 || newCellIndex >= Constants.CONTAINER_NODE.children.length;
    if (this.snake.cells.indexOf(newCellIndex) > -1) {
      // meet itself
      gameOverFlag = true;
    }
    const newRow = Math.ceil((newCellIndex + 1)/this.areaSize);
    const currentRow = Math.ceil((this.snake.headIndex + 1)/this.areaSize);
    if (newRow !== currentRow && (this.newDirection === 'L' || this.newDirection === 'R')) {
      // meet left/right border
      gameOverFlag = true;
    }
    if (gameOverFlag) {
      this.gameOver();
      return;
    }

    // is rabbit cell?
    const isRabbit = Constants.CONTAINER_NODE.children[newCellIndex] === this.rabbit.rabbitCell;
    if (isRabbit) {
      this.rabbit.remove();
    }

    this.snake.refresh(!isRabbit, this);

    if (isRabbit) {
      this.createRabbit();
    }

    this.direction = this.newDirection;
  }

  createRabbit() {
    this.rabbit = new Rabbit(this.getFreeCells());
    Constants.RABBIT_COUNT_ELEMENT.innerText = this.rabbitCount.toString();
    this.rabbitCount++;
  }

  getFreeCells() {
    const freeCells = [];
    for (let i = 0; i < this.areaSize * this.areaSize; i++) {
      if (this.snake.cells.indexOf(i) === -1) {
        freeCells.push(i);
      }
    }
    return freeCells;
  }

  getDirectionFromStep(step) {
    const keys = Object.keys(this.moveStep);
    for (let i = 0; i < keys.length; i++) {
      if (this.moveStep[keys[i]] === step) {
        return keys[i];
      }
    }
  }
};