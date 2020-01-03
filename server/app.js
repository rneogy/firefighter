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
    .map(() => Array(width).fill(undefined)),
  players: {}
};

const Directions = {
  NORTH: 0,
  EAST: 1,
  SOUTH: 2,
  WEST: 3
};

const spawnNewFood = (state, color) => {
  // spawn new food for player
  let foodX = Math.floor(Math.random() * width);
  let foodY = Math.floor(Math.random() * width);
  while (state.board[foodY][foodX]) {
    foodX = Math.floor(Math.random() * width);
    foodY = Math.floor(Math.random() * width);
  }

  state.board[foodY][foodX] = {
    color,
    type: "food",
    consumable: true
  };
};

io.on("connection", socket => {
  socket.on("start", () => {
    let startX = Math.floor(Math.random() * width);
    let startY = Math.floor(Math.random() * width);
    while (state.board[startY][startX]) {
      startX = Math.floor(Math.random() * width);
      startY = Math.floor(Math.random() * width);
    }
    const playerColor = randomColor({ luminosity: "dark" });

    // starting player state
    state.players[socket.id] = {
      coordinates: [[startX, startY]],
      x: function() {
        return this.coordinates[0][0];
      },
      y: function() {
        return this.coordinates[0][1];
      },
      lastX: function() {
        return this.coordinates[this.coordinates.length - 1][0];
      },
      lastY: function() {
        return this.coordinates[this.coordinates.length - 1][1];
      },
      color: playerColor,
      direction: Directions.NORTH
    };

    state.board[startY][startX] = {
      id: socket.id,
      color: playerColor,
      direction: Directions.NORTH,
      obstruction: true
    };

    // spawn new food for player
    spawnNewFood(state, playerColor);

    io.emit("updateBoard", state.board);
  });

  socket.on("move", direction => {
    const player = state.players[socket.id];
    let newX = player.x();
    let newY = player.y();
    switch (direction) {
      case Directions.NORTH:
        newY = Math.max(0, newY - 1);
        break;
      case Directions.SOUTH:
        newY = Math.min(width - 1, newY + 1);
        break;
      case Directions.WEST:
        newX = Math.max(0, newX - 1);
        break;
      case Directions.EAST:
        newX = Math.min(width - 1, newX + 1);
        break;
      default:
        break;
    }

    // update player location on board
    // in general, modify board state first, then player state.
    const newLocation = state.board[newY][newX];
    // don't move if there is an obstruction in the new location
    if (!(newLocation && newLocation.obstruction)) {
      // set head in new location
      state.board[newY][newX] = {
        id: socket.id,
        color: player.color,
        direction,
        obstruction: true
      };

      // remove head direction from body
      state.board[player.y()][player.x()]["direction"] = undefined;

      const coordinates = player.coordinates;
      if (newLocation && newLocation.consumable) {
        // spawn new food, don't remove last location in coordinates
        spawnNewFood(state, player.color);
      } else {
        state.board[player.lastY()][player.lastX()] = undefined;
        // board state done being modified, can touch player state.
        coordinates.pop();
      }

      coordinates.unshift([newX, newY]);

      // update player location in player state
      state.players[socket.id] = {
        ...player,
        coordinates,
        direction
      };
    }

    io.emit("updateBoard", state.board);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected!`);
    const player = state.players[socket.id];
    if (!player) {
      return;
    }
    for (const coord of player.coordinates) {
      state.board[coord[1]][coord[0]] = undefined;
    }
    delete state.players[socket.id];
    io.emit("updateBoard", state.board);
  });
});

http.listen(3000, () => {
  console.log(`Listening on port 3000 and looking in folder ${publicPath}`);
});
