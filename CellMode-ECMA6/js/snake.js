import * as Constants from './constants.js';

const BODY_BORDER_RADIUS = {DR: '0 50% 0 0', DL: '50% 0 0 0', UR: '0 0 50% 0', UL: '0 0 0 50%',
  RD: '0 0 0 50%', RU: '50% 0 0 0', LD: '0 0 50% 0', LU: '0 50% 0 0'};

export default class Snake {
  constructor() {
    this.cells = [];
  }

  init(direction) {
    this.cells = [];
    for (let i = 0; i < Constants.SNAKE_LENGTH; i++) {
      this.cells.push(i);
      Constants.CONTAINER_NODE.children[i].classList.add('snake');
    }
    this.drawHead(direction);
    this.drawTail();
  }

  refresh(changeTail, gameObject) {
    if (changeTail) {
      const tailDirection = gameObject.getDirectionFromStep(this.cells[2] - this.cells[1]);
      this.deleteTail();
      this.createTail(tailDirection);
    }

    // redraw head
    this.deleteHead();
    const newHeadCellIndex = this.cells[this.cells.length -1] + gameObject.moveStep[gameObject.newDirection];
    this.cells.push(newHeadCellIndex);
    this.drawHead(gameObject.newDirection);
    if (gameObject.newDirection !== gameObject.direction) {
      const turnElement = Constants.CONTAINER_NODE.children[this.cells[this.cells.length - 2]];
      turnElement.style.borderRadius = BODY_BORDER_RADIUS[gameObject.newDirection + gameObject.direction];
    }
  }

  get headIndex() {
    return this.cells[this.cells.length - 1];
  }

  get headElement() {
    return Constants.CONTAINER_NODE.children[this.headIndex];
  }

  drawHead(direction) {
    this.headElement.classList.add('snake');
    this.headElement.classList.add('head');
    this.headElement.innerHTML = '<span class="right eye blink"></span><span class="left eye blink"></span>';
    this.headElement.style.transform = 'rotate(' + Snake.getHeaderStyleRotation(direction) + 'deg)';
  }

  deleteHead() {
    this.headElement.classList.remove('head');
    this.headElement.style.transform = '';
    this.headElement.innerHTML = '';
  }

  static getHeaderStyleRotation(direction) {
    switch (direction) {
      case 'R': return 90;
      case 'L': return -90;
      case 'D': return 180;
    }
    return 0;
  }

  get tailIndex() {
    return this.cells[0];
  }

  get tailElement() {
    return Constants.CONTAINER_NODE.children[this.tailIndex];
  }

  drawTail() {
    this.tailElement.classList.add('tail');
    this.tailElement.innerHTML = Snake.getTailHtml('R');
  }

  createTail(tailDirection) {
    const tailElement = Constants.CONTAINER_NODE.children[this.cells[0]];
    tailElement.classList.add('tail');
    tailElement.innerHTML = Snake.getTailHtml(tailDirection);
    tailElement.style.borderRadius = '';
  }

  deleteTail() {
    const tailElement = Constants.CONTAINER_NODE.children[this.cells[0]];
    tailElement.classList.remove('snake');
    tailElement.classList.remove('tail');
    tailElement.innerHTML = '';
    this.cells.shift();
  }

  static getTailHtml(direction) {
    switch (direction) {
      case 'R': return '<span style="border-top: 14px solid transparent;border-right: 28px solid gray;border-bottom: 14px solid transparent;"></span>';
      case 'L': return '<span style="border-top: 14px solid transparent;border-left: 28px solid gray;border-bottom: 14px solid transparent;"></span>';
      case 'D': return '<span style="border-left: 14px solid transparent;border-bottom: 28px solid gray;border-right: 14px solid transparent;"></span>';
    }
    return '<span style="border-left: 14px solid transparent;border-top: 28px solid gray;border-right: 14px solid transparent;"></span>';
  }
};