const SOCKET_URL =
  globalThis.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000'
    : 'https://snakegame-gw8z.onrender.com';

console.log(globalThis.location.hostname, ' -> Current Host');


const socket = io(SOCKET_URL, {
  transports: ['websocket']
});

const CONFIG = {
  CANVAS_SIZE: 600,
  BG_COLOUR: '#231f20',
  SNAKE_COLOUR: '#c2c2c2',
  SNAKE2_COLOUR: '#e74c3c',
  FOOD_COLOUR: '#7016e6'
};

socket.on('init', handleInit);
socket.on('gameState', handleGameState);
socket.on('gameOver', handleGameOver);
socket.on('gameCode', handleGameCode);
socket.on('gameMode', handleGameMode);
socket.on('unknownCode', handleUnknownCode);
socket.on('tooManyPlayers', handleTooManyPlayers);
socket.on('playerDisconnected', handlePlayerDisconnected);
socket.on('gameRestarted', handleGameRestarted);

const gameScreen = document.getElementById('gameScreen');
const initialScreen = document.getElementById('initialScreen');
const soloGameBtn = document.getElementById('soloGameButton');
const newGameBtn = document.getElementById('newGameButton');
const joinGameBtn = document.getElementById('joinGameButton');
const gameCodeInput = document.getElementById('gameCodeInput');
const gameCodeDisplay = document.getElementById('gameCodeDisplay');
const gameModeDisplay = document.getElementById('gameModeDisplay');
const waitingMessage = document.getElementById('waitingMessage');
const gameOverMessage = document.getElementById('gameOverMessage');
const gameResult = document.getElementById('gameResult');
const rematchButton = document.getElementById('rematchButton');
const exitButton = document.getElementById('exitButton');
const scoreDisplay = document.getElementById('scoreDisplay');

soloGameBtn.addEventListener('click', newSoloGame);
newGameBtn.addEventListener('click', newGame);
joinGameBtn.addEventListener('click', joinGame);
rematchButton.addEventListener('click', requestRematch);
exitButton.addEventListener('click', exitToMenu);

let canvas, ctx;
let playerNumber;
let gameActive = false;
let gameMode = '';

function newSoloGame() {
  socket.emit('newSoloGame');
  init();
}

function newGame() {
  socket.emit('newGame');
  init();
}

function joinGame() {
  const code = gameCodeInput.value.trim().toUpperCase();
  if (!code) {
    showNotification('Please enter a game code', 'error');
    return;
  }
  socket.emit('joinGame', code);
  init();
}

function requestRematch() {
  socket.emit('requestRematch');
  gameOverMessage.style.display = 'none';
  waitingMessage.style.display = gameMode === 'multiplayer' ? 'block' : 'none';
}

function exitToMenu() {
  location.reload();
}

function init() {
  initialScreen.style.display = "none";
  gameScreen.style.display = "block";
  waitingMessage.style.display = "block";
  gameOverMessage.style.display = "none";

  canvas = document.getElementById('canvas');
  ctx = canvas.getContext('2d');

  canvas.width = canvas.height = CONFIG.CANVAS_SIZE;

  ctx.fillStyle = CONFIG.BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  document.addEventListener('keydown', keydown);
  gameActive = true;
}

function keydown(e) {
  if ([37, 38, 39, 40].includes(e.keyCode)) {
    e.preventDefault();
    socket.emit('keydown', e.keyCode);
  }
}

function paintGame(state) {
  ctx.fillStyle = CONFIG.BG_COLOUR;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const food = state.food;
  const gridsize = state.gridsize;
  const size = canvas.width / gridsize;

  ctx.fillStyle = CONFIG.FOOD_COLOUR;
  ctx.fillRect(food.x * size, food.y * size, size, size);

  paintPlayer(state.players[0], size, CONFIG.SNAKE_COLOUR);
  
  if (!state.isSolo) {
    paintPlayer(state.players[1], size, CONFIG.SNAKE2_COLOUR);
  }
}

function paintPlayer(playerState, size, colour) {
  const snake = playerState.snake;

  ctx.fillStyle = colour;
  for (let cell of snake) {
    ctx.fillRect(cell.x * size, cell.y * size, size, size);
  }
}

function handleInit(number) {
  playerNumber = number;
  waitingMessage.style.display = number === 1 && gameMode === 'multiplayer' ? "block" : "none";
  if (number === 2) {
    showNotification('Game started! Good luck!', 'success');
  }
}

function handleGameMode(mode) {
  gameMode = mode;
  gameModeDisplay.textContent = mode === 'solo' ? 'Solo' : 'Multiplayer';
  if (mode === 'solo') {
    gameCodeDisplay.textContent = '-----';
    waitingMessage.style.display = 'none';
  }
}

function handleGameState(gameState) {
  if (!gameActive) return;
  
  waitingMessage.style.display = "none";
  gameState = JSON.parse(gameState);
  requestAnimationFrame(() => paintGame(gameState));
}

function handleGameRestarted() {
  gameOverMessage.style.display = "none";
  waitingMessage.style.display = "none";
  gameActive = true;
  showNotification('New round starting!', 'success');
}

function handleGameOver(data) {
  if (!gameActive) return;
  
  data = JSON.parse(data);
  gameActive = false;
  waitingMessage.style.display = "none";
  gameOverMessage.style.display = "block";

  if (gameMode === 'solo') {
    gameResult.textContent = '😢 Game Over!';
    showNotification('Game Over!', 'error');
  } else {
    const isWinner = data.winner === playerNumber;
    gameResult.textContent = isWinner ? '🏆 You Win!' : '😢 You Lose!';
    if(isWinner) {
      scoreDisplay.textContent = (scoreDisplay.textContent === '0' ? 1 : Number.parseInt(scoreDisplay.textContent) + 1);
    }
    showNotification(
      isWinner ? '🏆 You Win! Congratulations!' : '😢 You Lose! Better luck next time!',
      isWinner ? 'success' : 'error'
    );
  }

  rematchButton.style.display = 'block';
  exitButton.style.display = 'block';
}

function handleGameCode(gameCode) {
  gameCodeDisplay.innerText = gameCode.toUpperCase();
}

function handleUnknownCode() {
  reset();
  showNotification('Game code not found. Please check and try again.', 'error');
}

function handleTooManyPlayers() {
  reset();
  showNotification('This game is full. Please create a new game.', 'error');
}

function handlePlayerDisconnected() {
  gameActive = false;
  showNotification('Opponent disconnected. Returning to lobby...', 'info');
  setTimeout(() => reset(), 2000);
}

function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

function reset() {
  playerNumber = null;
  gameCodeInput.value = '';
  gameActive = false;
  initialScreen.style.display = "flex";
  gameScreen.style.display = "none";
  waitingMessage.style.display = "none";
}
