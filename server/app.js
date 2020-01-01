const express = require("express");
const path = require("path");

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const randomColor = require("randomcolor");

const publicPath = path.resolve(__dirname, "..", "build");

app.use(express.static(publicPath));

const width = 31;
const state = {
  board: Array(width)
    .fill()
    .map(u => Array(width).fill(undefined)),
  players: {}
};
console.log(state.board);

const Directions = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3
};

io.on("connection", socket => {
  console.log(`${socket.id} connected!`);

  let startX = Math.floor(Math.random() * width);
  let startY = Math.floor(Math.random() * width);
  while (state.board[startY][startX]) {
    startX = Math.floor(Math.random() * width);
    startY = Math.floor(Math.random() * width);
  }
  const playerColor = randomColor();

  state.players[socket.id] = {
    x: startX,
    y: startY,
    color: playerColor,
    direction: Directions.NORTH
  };

  state.board[startY][startX] = {
    id: socket.id,
    color: playerColor,
    direction: Directions.NORTH
  };

  io.emit("update", state.board);

  socket.on("move", direction => {
    const player = state.players[socket.id];
    let newX = player.x;
    let newY = player.y;
    switch (direction) {
      case Directions.NORTH:
        newY = Math.max(0, player.y - 1);
        break;
      case Directions.SOUTH:
        newY = Math.min(width - 1, player.y + 1);
        break;
      case Directions.WEST:
        newX = Math.max(0, player.x - 1);
        break;
      case Directions.EAST:
        newX = Math.min(width - 1, player.x + 1);
        break;
      default:
        break;
    }

    // update player location on board
    if (!state.board[newY][newX]) {
      // only move if spot is empty
      const temp = state.board[player.y][player.x];
      temp.direction = direction;
      state.board[player.y][player.x] = undefined;
      state.board[newY][newX] = temp;

      // update player location in player state
      state.players[socket.id] = {
        ...player,
        x: newX,
        y: newY,
        direction
      };
    }

    io.emit("update", state.board);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected!`);
    const player = state.players[socket.id];
    state.board[player.y][player.x] = undefined;
    delete state.players[socket.id];
    io.emit("update", state.board);
  });
});

http.listen(3000, () => {
  console.log(`Listening on port 3000 and looking in folder ${publicPath}`);
});
