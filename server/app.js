const express = require("express");
const path = require("path");

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const randomColor = require("randomcolor");

const publicPath = path.resolve(__dirname, "..", "build");

app.use(express.static(publicPath));

const state = {};
const width = 31;
const Directions = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3
};

io.on("connection", socket => {
  console.log(`${socket.id} connected!`);

  state[socket.id] = {
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * width),
    color: randomColor(),
    direction: Directions.NORTH
  };
  io.emit("update", state);

  socket.on("move", direction => {
    const player = state[socket.id];
    switch (direction) {
      case Directions.NORTH:
        state[socket.id] = {
          ...player,
          y: Math.max(0, player.y - 1),
          direction: Directions.NORTH
        };
        break;
      case Directions.SOUTH:
        state[socket.id] = {
          ...player,
          y: Math.min(width - 1, player.y + 1),
          direction: Directions.SOUTH
        };
        break;
      case Directions.WEST:
        state[socket.id] = {
          ...player,
          x: Math.max(0, player.x - 1),
          direction: Directions.WEST
        };
        break;
      case Directions.EAST:
        state[socket.id] = {
          ...player,
          x: Math.min(width - 1, player.x + 1),
          direction: Directions.EAST
        };
        break;
      default:
        break;
    }

    io.emit("update", state);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected!`);
    delete state[socket.id];
    io.emit("update", state);
  });
});

http.listen(3000, () => {
  console.log(`Listening on port 3000 and looking in folder ${publicPath}`);
});
