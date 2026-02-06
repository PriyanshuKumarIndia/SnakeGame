require('dotenv').config();
const { Server } = require('socket.io');
const { initGame, gameLoop, getUpdatedVelocity } = require('./game');
const { FRAME_RATE } = require('./constants');
const { makeid } = require('./utils');
const express = require('express');
const http = require('node:http');
const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const state = {};
const clientRooms = {};
const intervalIds = {};

setInterval(() => {
  Object.keys(state).forEach(roomName => {
    const room = io.sockets.adapter.rooms.get(roomName);
    if (!room || room.size === 0) {
      if (intervalIds[roomName]) {
        clearInterval(intervalIds[roomName]);
        delete intervalIds[roomName];
      }
      delete state[roomName];
    }
  });
}, 300000);

io.on('connection', client => {

  client.on('keydown', handleKeydown);
  client.on('newGame', handleNewGame);
  client.on('newSoloGame', handleNewSoloGame);
  client.on('joinGame', handleJoinGame);
  client.on('requestRematch', handleRematch);

  function handleNewSoloGame() {
    let roomName = makeid(5).toUpperCase();
    clientRooms[client.id] = roomName;

    state[roomName] = initGame(true);

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
    client.emit('gameMode', 'solo');
    
    startGameInterval(roomName);
  }

  function handleJoinGame(roomName) {
    roomName = String(roomName).toUpperCase();
    const room = io.sockets.adapter.rooms.get(roomName);

    let numClients = 0;
    if (room) {
      numClients = room.size;
    }

    if (numClients === 0) {
      client.emit('unknownCode');
      return;
    } else if (numClients > 1) {
      client.emit('tooManyPlayers');
      return;
    }

    clientRooms[client.id] = roomName;

    client.join(roomName);
    client.number = 2;
    client.emit('init', 2);
    client.emit('gameCode', roomName);
    client.emit('gameMode', 'multiplayer');
    
    startGameInterval(roomName);
  }

  function handleNewGame() {
    let roomName = makeid(5).toUpperCase();
    clientRooms[client.id] = roomName;
    client.emit('gameCode', roomName);

    state[roomName] = initGame(false);

    client.join(roomName);
    client.number = 1;
    client.emit('init', 1);
    client.emit('gameMode', 'multiplayer');
  }

  function handleKeydown(keyCode) {
    const roomName = clientRooms[client.id];
    if (!roomName || !state[roomName]) {
      return;
    }
    try {
      keyCode = Number.parseInt(keyCode);
    } catch(e) {
      console.error(e);
      return;
    }

    const vel = getUpdatedVelocity(keyCode);
    if (!vel) return;

    const player = state[roomName].players[client.number - 1];
    
    if ((player.vel.x === -vel.x && player.vel.x !== 0) ||
        (player.vel.y === -vel.y && player.vel.y !== 0)) {
      return;
    }

    player.vel = vel;
  }

  function handleRematch() {
    const roomName = clientRooms[client.id];
    if (!roomName || !state[roomName]) {
      return;
    }

    const isSolo = state[roomName].isSolo;
    state[roomName] = initGame(isSolo);
    
    if (intervalIds[roomName]) {
      clearInterval(intervalIds[roomName]);
      delete intervalIds[roomName];
    }
    
    io.sockets.in(roomName).emit('gameRestarted');
    startGameInterval(roomName);
  }

  client.on('disconnect', () => {
    const roomName = clientRooms[client.id];
    if (roomName && state[roomName]) {
      if (intervalIds[roomName]) {
        clearInterval(intervalIds[roomName]);
        delete intervalIds[roomName];
      }
      delete state[roomName];
      io.sockets.in(roomName).emit('playerDisconnected');
    }
    delete clientRooms[client.id];
  });
});

function startGameInterval(roomName) {
  if (intervalIds[roomName]) {
    return;
  }
  
  const intervalId = setInterval(() => {
    if (!state[roomName]) {
      clearInterval(intervalId);
      delete intervalIds[roomName];
      return;
    }

    const winner = gameLoop(state[roomName]);
    
    if (winner) {
      emitGameOver(roomName, winner);
      clearInterval(intervalId);
      delete intervalIds[roomName];
    } else {
      emitGameState(roomName, state[roomName]);
    }
  }, 1000 / FRAME_RATE);
  
  intervalIds[roomName] = intervalId;
}

function emitGameState(room, gameState) {
  io.sockets.in(room)
    .emit('gameState', JSON.stringify(gameState));
}

function emitGameOver(room, winner) {
  io.sockets.in(room)
    .emit('gameOver', JSON.stringify({ winner }));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
