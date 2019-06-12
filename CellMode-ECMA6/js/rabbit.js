import * as Constants from './constants.js';

const RABBIT_CHARACTER = '&#x1f407;';

export default class Rabbit {
  constructor(freeCells) {
    const rabbitIndexInFreeCells = Math.ceil(Math.random() * freeCells.length) - 1;
    this.rabbitCell = Constants.CONTAINER_NODE.children[freeCells[rabbitIndexInFreeCells]];
    this.init();
  }

  init() {
    this.rabbitCell.classList.add('rabbit', 'started');
    this.rabbitCell.innerHTML = RABBIT_CHARACTER;
    setTimeout(() => { this.rabbitCell.classList.remove('started'); }, 100);
  }

  remove() {
    this.rabbitCell.classList.remove('rabbit');
    this.rabbitCell.innerHTML = '';
    this.rabbitCell = undefined;
  }
};