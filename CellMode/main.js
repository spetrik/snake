
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

function onKeyDown(e) {
  if (e.defaultPrevented) {
    return;
  }
  // e.keyCode is deprecated (see https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/keyCode)
  // e.key for IE are Left/Up/Right/Down
  if (e.key === 'ArrowLeft' || e.key === 'Left') {
    newDirection = -1;
  } else if (e.key === 'ArrowUp' || e.key === 'Up') {
    newDirection = -areaSize;
  } else if (e.key === 'ArrowRight' || e.key === 'Right') {
    newDirection = 1;
  } else if (e.key === 'ArrowDown' || e.key === 'Down') {
    newDirection = areaSize;
  }
}

if (document.addEventListener) {
  document.addEventListener('keydown', onKeyDown, false);
} else if (document.attachEvent) { // IE
  document.attachEvent('onkeydown', onKeyDown, false);
}

var SNAKE_LENGTH = 5;
var TICK_INTERVAL_MS = 500;
var RABBIT_CHARACTER = '&#x1f407;';
var areaSize = 10;
var snake = [];
var direction = 1;
var newDirection = 1;
var timerId;
var containerNode = document.getElementById('container');
var rabbitCount = 0;

function gameReset() {
  gameOver();
  areaSize = Number(document.getElementById('areaSize').value);
  direction = newDirection = 1;
  rabbitCount = 0;

  // Clear container
  while (containerNode.firstChild) {
    containerNode.removeChild(containerNode.firstChild)
  }
  // Fill container by cells
  for (var i1 = 0; i1 < areaSize; i1++) {
    var rowClass = i1 === 0 ? 'firstrow ' : '';
    for (var i2 = 0; i2 < areaSize; i2++) {
      var cell = document.createElement('div');
      cell.className = rowClass + (i2 === 0 ? 'cell firstcell' : 'cell');
      containerNode.appendChild(cell);
    }
  }

  // Init snake
  snake = [];
  for (var i = 0; i < SNAKE_LENGTH; i++) {
    snake.push(i);
    containerNode.children[i].classList.add('snake');
  }
  containerNode.children[snake[0]].classList.add('tail');
  containerNode.children[snake[0]].innerHTML = getTailHtml(1);
  containerNode.children[snake[snake.length - 1]].classList.add('head');
  containerNode.children[snake[snake.length - 1]].style.transform = 'rotate(' + getRotation(newDirection) + 'deg)';
}

function gameStart() {
  gameReset();
  createRabbit();
  timerId = setInterval(onTickHandler, TICK_INTERVAL_MS);
  console.log('The game is started', this);
}

function gameOver() {
  if (timerId) {
    clearInterval(timerId);
    console.log('The game is over');
    timerId = undefined;
  }
}

function onTickHandler() {
  // check the game over
  var newCellIndex = snake[snake.length - 1] + newDirection;
  // meet top/bottom border
  var gameOverFlag = newCellIndex < 0 || newCellIndex >= containerNode.children.length;
  if (snake.indexOf(newCellIndex) > -1) {
    // meet itself
    gameOverFlag = true;
  }
  var newRow = Math.ceil((newCellIndex + 1)/areaSize);
  var currentRow = Math.ceil((snake[snake.length - 1] + 1)/areaSize);
  if (newRow !== currentRow && Math.abs(newDirection) === 1) {
    // meet left/right border
    gameOverFlag = true;
  }
  if (gameOverFlag) {
    gameOver();
    return;
  }

  // is rabbit cell?
  var isRabbit = containerNode.children[newCellIndex].classList.contains('rabbit');
  if (isRabbit) {
    // remove rabbit
    containerNode.children[newCellIndex].classList.remove('rabbit');
    containerNode.children[newCellIndex].innerHTML ='';
  }
  // redraw snake
  refreshSnake(!isRabbit);
  if (isRabbit) {
    // add rabbit
    rabbitCount++;
    createRabbit();
  }
}

function refreshSnake(changeTail) {
  if (changeTail) {
    var oldTailElement = containerNode.children[snake[0]];
    var newTailElement = containerNode.children[snake[1]];
    // delete old tail element
    oldTailElement.classList.remove('snake');
    oldTailElement.classList.remove('tail');
    oldTailElement.innerHTML = '';
    snake.shift();
    // create new tail element
    var tailDirection = snake[1] - snake[0];
    newTailElement.classList.add('tail');
    newTailElement.innerHTML = getTailHtml(tailDirection);
  }

  // remove old header
  var headerElement = containerNode.children[snake[snake.length -1]];
  headerElement.classList.remove('head');
  headerElement.style.transform = '';
  // create new header
  var newCellIndex = snake[snake.length -1] + newDirection;
  // containerNode.children[newCellIndex].classList.add('snake', 'head'); does not work in IE11
  containerNode.children[newCellIndex].classList.add('snake');
  containerNode.children[newCellIndex].classList.add('head');
  containerNode.children[newCellIndex].style.transform = 'rotate(' + getRotation(newDirection) + 'deg)';
  snake.push(newCellIndex);
  // save current movement direction
  direction = newDirection;
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
  rabbitCell.innerHTML = RABBIT_CHARACTER;
  refreshStatus();
}

function refreshStatus(){
  var rabbitCountElement = document.getElementById('rabbitCount');
  rabbitCountElement.innerText = rabbitCount.toString();
}

function getRotation(direction) {
  switch (direction) {
    case 1: return 90;
    case -1: return -90;
    case 10: return 180;
  }
  return 0
}

function getTailHtml(direction) {
  switch (direction) {
    case 1: return '<span style="border-top: 14px solid transparent;border-right: 28px solid gray;border-bottom: 14px solid transparent;"></span>';
    case -1: return '<span style="border-top: 14px solid transparent;border-left: 28px solid gray;border-bottom: 14px solid transparent;"></span>';
    case 10: return '<span style="border-left: 14px solid transparent;border-bottom: 28px solid gray;border-right: 14px solid transparent;"></span>';
  }
  return '<span style="border-left: 14px solid transparent;border-top: 28px solid gray;border-right: 14px solid transparent;"></span>';
}

gameReset();
