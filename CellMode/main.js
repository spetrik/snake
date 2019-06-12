
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
  document.addEventListener('keydown', onKeyDown, false);
} else if (document.attachEvent) { // IE
  document.attachEvent('onkeydown', onKeyDown, false);
}

var SNAKE_LENGTH = 5;
var TICK_INTERVAL_MS = 500;
var RABBIT_CHARACTER = '&#x1f407;';
var bodyBorderRadius = {DR: '0 50% 0 0', DL: '50% 0 0 0', UR: '0 0 50% 0', UL: '0 0 0 50%',
  RD: '0 0 0 50%', RU: '50% 0 0 0', LD: '0 0 50% 0', LU: '0 50% 0 0'};

var moveStep = { L: -1, U: -10, R: 1, D: 10 };
var areaSize = 10;
var snake = [];
var direction = 'R';
var newDirection = 'R';
var timerId;
var containerNode = document.getElementById('container');
var rabbitCount = 0;

function gameReset() {
  document.getElementById('isOver').style.visibility = 'hidden';
  gameOver();
  areaSize = Number(document.getElementById('areaSize').value);
  direction = newDirection = 'R';
  moveStep['U'] =  -areaSize;
  moveStep['D'] =  areaSize;
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
  containerNode.children[snake[0]].innerHTML = getTailHtml('R');
  drawHead(snake[snake.length - 1], newDirection);
}

function gameStart() {
  gameReset();
  document.getElementById('isOver').style.visibility = 'hidden';
  createRabbit();
  timerId = setInterval(onTickHandler, TICK_INTERVAL_MS);
  console.log('The game is started');
}

function gameOver() {
  if (timerId) {
    clearInterval(timerId);
    console.log('The game is over');
    timerId = undefined;
    document.getElementById('isOver').style.visibility = '';
  }
}

function onTickHandler() {
  // check the game over
  var newCellIndex = snake[snake.length - 1] + moveStep[newDirection];
  // meet top/bottom border
  var gameOverFlag = newCellIndex < 0 || newCellIndex >= containerNode.children.length;
  if (snake.indexOf(newCellIndex) > -1) {
    // meet itself
    gameOverFlag = true;
  }
  var newRow = Math.ceil((newCellIndex + 1)/areaSize);
  var currentRow = Math.ceil((snake[snake.length - 1] + 1)/areaSize);
  if (newRow !== currentRow && (newDirection === 'L' || newDirection === 'R')) {
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
    var tailDirection = getDirectionFromStep(snake[1] - snake[0]);
    newTailElement.classList.add('tail');
    newTailElement.innerHTML = getTailHtml(tailDirection);
    // clear radius of snake body
    var bodyElement = containerNode.children[snake[0]];
    bodyElement.style.borderRadius = '';
  }

  // redraw head
  clearHead(snake[snake.length -1]);
  var newHeadCellIndex = snake[snake.length -1] + moveStep[newDirection];
  drawHead(newHeadCellIndex, newDirection);
  snake.push(newHeadCellIndex);
  if (newDirection !== direction) {
    var turnElement = containerNode.children[snake[snake.length -2]];
    turnElement.style.borderRadius = bodyBorderRadius[newDirection + direction];
  }
  // save current movement direction
  direction = newDirection;
}

function drawHead(headCellIndex, headDirection) {
  containerNode.children[headCellIndex].classList.add('snake');
  containerNode.children[headCellIndex].classList.add('head');
  containerNode.children[headCellIndex].innerHTML = '<span class="right-eye blink"></span><span class="left-eye blink"></span>';
  containerNode.children[headCellIndex].style.transform = 'rotate(' + getRotation(headDirection) + 'deg)';
}

function clearHead(headCellIndex) {
  var headerElement = containerNode.children[headCellIndex];
  headerElement.classList.remove('head');
  headerElement.style.transform = '';
  headerElement.innerHTML = '';
}

function createRabbit() {
  var rabbitIndexInFreeCells = Math.ceil(Math.random() * (areaSize * areaSize - snake.length)) - 1;
  var freeCells = [];
  for (var i = 0; i < areaSize * areaSize; i++) {
    if (snake.indexOf(i) === -1) {
      freeCells.push(i);
    }
  }
  var rabbitCell = containerNode.children[freeCells[rabbitIndexInFreeCells]];
  rabbitCell.classList.add('rabbit');
  rabbitCell.classList.add('started');
  rabbitCell.innerHTML = RABBIT_CHARACTER;
  setTimeout(function() {
    rabbitCell.classList.remove('started');
  }, 100);
  refreshStatus();
}

function refreshStatus(){
  var rabbitCountElement = document.getElementById('rabbitCount');
  rabbitCountElement.innerText = rabbitCount.toString();
}

function getRotation(direction) {
  switch (direction) {
    case 'R': return 90;
    case 'L': return -90;
    case 'D': return 180;
  }
  return 0;
}

function getTailHtml(direction) {
  switch (direction) {
    case 'R': return '<span style="border-top: 14px solid transparent;border-right: 28px solid gray;border-bottom: 14px solid transparent;"></span>';
    case 'L': return '<span style="border-top: 14px solid transparent;border-left: 28px solid gray;border-bottom: 14px solid transparent;"></span>';
    case 'D': return '<span style="border-left: 14px solid transparent;border-bottom: 28px solid gray;border-right: 14px solid transparent;"></span>';
  }
  return '<span style="border-left: 14px solid transparent;border-top: 28px solid gray;border-right: 14px solid transparent;"></span>';
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
