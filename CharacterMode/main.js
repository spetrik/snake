function onNumberInputValueChanges(min, max, value) {
  var newValue = Number(value.replace(/[^0-9]/g,''));
  if (newValue < min) {
    return min;
  }
  if (newValue > max) {
    return max;
  }
  return newValue;
}

function onKeyDownHandler(e) {
  if (e.defaultPrevented) {
    return;
  }
  // e.keyCode is deprecated (see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode)
  // e.key for IE are Left/Up/Right/Down
  if (e.key === 'ArrowLeft' || e.key === 'Left') {
    newDirection = 'L';
  } else if (e.key === 'ArrowUp' || e.key === 'Up') {
    newDirection = 'U';
  } else if (e.key === 'ArrowRight' || e.key === 'Right') {
    newDirection = 'R';
  } else if (e.key === 'ArrowDown' || e.key === 'Down') {
    newDirection = 'D';
  }
}

if (document.addEventListener) {
  document.addEventListener('keydown', onKeyDownHandler, false);
} else if (document.attachEvent) { // IE
  document.attachEvent('onkeydown', onKeyDownHandler, false);
}

var SNAKE_LENGTH = 5;
var TICK_INTERVAL_MS = 500;
var RABBIT_CHARACTER = '&#x1f407;';
// Meaning: L - left, U - up, R - right, D - down
var HEADER_CHARACTER = { L: '&#8656;', U: '&#8657;', R: '&#8658;', D: '&#8659;' };
var TAIL_CHARACTER = { L: '&#9569;', U: '&#9576;', R: '&#9566;', D: '&#9573;' };
var BODY_CHARACTER = { LL: '&#9552;', UU: '&#9553;', RR: '&#9552;', DD: '&#9553;',
  LU: '&#9559;', LD: '&#9565;', UL: '&#9562;', UR: '&#9565;',
  RU: '&#9556;', RD: '&#9562;', DR: '&#9559;', DL: '&#9556;' };

var moveStep = { L: -1, U: -10, R: 1, D: 10 };
var areaSize = 10;
var snake = [];
var direction = 'R';
var newDirection = 'R';
var timerId;
var containerNode = document.getElementById('container');
var rabbitCount = 0;
var showGrid = true;

function gameReset() {
  gameOver();

  areaSize = Number(document.getElementById('areaSize').value);
  showGrid = document.getElementById('showGrid').checked;
  moveStep['U'] = -areaSize;
  moveStep['D'] = areaSize;

  // Clear container
  while (containerNode.firstChild) {
    containerNode.removeChild(containerNode.firstChild)
  }
  // Fill container by cells
  for (var i1 = 0; i1 < areaSize; i1++) {
    var rowClass = i1 === 0 ? 'firstrow ' : '';
    var cellClass = showGrid ? 'cell ' : 'cellnogrid ';
    for (var i2 = 0; i2 < areaSize; i2++) {
      var cell = document.createElement('div');
      cell.className = rowClass + cellClass + (i2 === 0 ? 'firstcell' : '');
      cell.innerHTML = '<span></span>';
      containerNode.appendChild(cell);
    }
  }

  snake = [];
  for (var i = 0; i < SNAKE_LENGTH; i++) {
    snake.push(i);
    containerNode.children[i].classList.add('snake');
    containerNode.children[i].children[0].innerHTML = BODY_CHARACTER['RR'];
  }
  containerNode.children[snake[0]].classList.add('tail');
  containerNode.children[snake[0]].children[0].innerHTML = TAIL_CHARACTER['R'];
  containerNode.children[snake[snake.length - 1]].classList.add('head');
  containerNode.children[snake[snake.length - 1]].classList.add('dirR');
  containerNode.children[snake[snake.length - 1]].children[0].innerHTML = HEADER_CHARACTER['R'];
  direction = newDirection = 'R';

  rabbitCount = 0;
}

function gameStart() {
  gameReset();
  createRabbit();
  timerId = setInterval(onTickHandler, TICK_INTERVAL_MS);
  console.log('The game is started');
}

function gameOver() {
  if (timerId) {
    clearInterval(timerId);
    console.log('The game is over');
    timerId = undefined;
  }
}

function onTickHandler() {
  var newCellIndex = snake[snake.length - 1] + moveStep[newDirection];
  var gameOverFlag = newCellIndex < 0 || newCellIndex >= containerNode.children.length;
  if (snake.indexOf(newCellIndex) > -1) {
    gameOverFlag = true;
  }
  var newRow = Math.ceil((newCellIndex + 1)/areaSize);
  var currentRow = Math.ceil((snake[snake.length - 1] + 1)/areaSize);
  if (newRow !== currentRow && (newDirection === 'L' || newDirection === 'R')) {
    gameOverFlag = true;
  }
  if (gameOverFlag) {
    gameOver();
    return;
  }

  var isRabbit = containerNode.children[newCellIndex].classList.contains('rabbit');
  if (isRabbit) {
    containerNode.children[newCellIndex].classList.remove('rabbit');
  }
  refreshSnake(!isRabbit);
  if (isRabbit) {
    rabbitCount++;
    createRabbit();
  }
}

function refreshSnake(changeTail) {
  if (changeTail) {
    var tailElement = containerNode.children[snake[0]];
    tailElement.classList.add('pre-animation');
    // tailElement.classList.remove('snake', 'tail'); does not work in IE11
    tailElement.classList.remove('snake');
    tailElement.classList.remove('tail');
    tailElement.children[0].innerHTML='';
    setTimeout(function(){
      tailElement.classList.remove('pre-animation');
    },300);
    snake.shift();
    var newTailElement = containerNode.children[snake[0]];
    newTailElement.classList.add('pre-animation');
    newTailElement.classList.add('tail');
    var tailDelta = snake[1] - snake[0];
    newTailElement.children[0].innerHTML=TAIL_CHARACTER[getDirectionFromStep(tailDelta)];
    setTimeout(function(){
      newTailElement.classList.remove('pre-animation');
    },100);
  }

  var headerElement = containerNode.children[snake[snake.length -1]];
  headerElement.classList.add('pre-animation');
  headerElement.classList.remove('head');
  headerElement.classList.remove('dirL');
  headerElement.classList.remove('dirU');
  headerElement.classList.remove('dirR');
  headerElement.classList.remove('dirD');
  headerElement.children[0].innerHTML = BODY_CHARACTER[newDirection+direction];
  var newCellIndex = snake[snake.length -1] + moveStep[newDirection];
  // containerNode.children[newCellIndex].classList.add('snake', 'head'); does not work in IE11
  containerNode.children[newCellIndex].classList.add('snake');
  containerNode.children[newCellIndex].classList.add('head');
  containerNode.children[newCellIndex].classList.add('dir' + newDirection);
  containerNode.children[newCellIndex].children[0].innerHTML = HEADER_CHARACTER[newDirection];
  snake.push(newCellIndex);
  direction = newDirection;
  setTimeout(function(){
    headerElement.classList.remove('pre-animation');
  },50)
}

function createRabbit() {
  var rabbitIndex = Math.ceil(Math.random() * (areaSize * areaSize - snake.length)) - 1;
  var freeCells = [];
  for (var i = 0; i < areaSize * areaSize; i++) {
    if (snake.indexOf(i) === -1) {
      freeCells.push(i);
    }
  }
  var rabbitCell = containerNode.children[freeCells[rabbitIndex]];
  rabbitCell.classList.add('rabbit');
  rabbitCell.children[0].innerHTML = RABBIT_CHARACTER;
  refreshStatus();
}

function refreshStatus(){
  var rabbitCountElement = document.getElementById('rabbitCount');
  rabbitCountElement.innerText = rabbitCount.toString();
}

function getDirectionFromStep(step) {
  var keys = Object.keys(moveStep);
  for (var i = 0; i < keys.length; i++) {
    if (moveStep[keys[i]] === step) {
      return keys[i];
    }
  }
}

gameReset();
