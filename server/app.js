const express = require("express");
const path = require("path");

const app = express();
const http = require("http").Server(app);
const io = require("socket.io")(http);
const randomColor = require("randomcolor");

const publicPath = path.resolve(__dirname, "..", "build");

app.use(express.static(publicPath));

const width = 31;
const moveInterval = 500;

// redundancy in state to help game logic
// board is sparse but full size array with all locations
// players is a map of players to locations and other details
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

const spawnNewFood = (state, id) => {
  // spawn new food for player
  let foodX = Math.floor(Math.random() * width);
  let foodY = Math.floor(Math.random() * width);
  while (state.board[foodY][foodX]) {
    foodX = Math.floor(Math.random() * width);
    foodY = Math.floor(Math.random() * width);
  }

  state.players[id].food = [foodX, foodY];

  state.board[foodY][foodX] = {
    color: state.players[id].color,
    type: "food",
    consumable: true
  };
};

const movePlayer = (socket, direction) => {
  const id = socket.id;
  const player = state.players[id];
  if (!player) {
    return;
  }
  let newX = player.x();
  let newY = player.y();
  direction = direction !== undefined ? direction : player.direction;
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
  // lose if you hit an obstruction.
  if (newLocation && newLocation.obstruction) {
    removePlayer(id);
    socket.emit("updatePlayState", "gameOver");
  } else {
    // set head in new location
    state.board[newY][newX] = {
      id,
      color: player.color,
      direction,
      obstruction: true
    };

    // remove head direction from body
    state.board[player.y()][player.x()].direction = undefined;

    const coordinates = player.coordinates;
    if (newLocation && newLocation.consumable) {
      // spawn new food, don't remove last location in coordinates
      spawnNewFood(state, id);
    } else {
      state.board[player.lastY()][player.lastX()] = undefined;
      // board state done being modified, can touch player state.
      coordinates.pop();
    }

    coordinates.unshift([newX, newY]);

    // update player location in player state
    state.players[id] = {
      ...player,
      coordinates,
      direction
    };
  }

  io.emit("updateBoard", state.board);
};

let moveIntervalId;

const removePlayer = id => {
  clearInterval(moveIntervalId);
  const player = state.players[id];
  if (!player) {
    return;
  }
  for (const coord of player.coordinates) {
    state.board[coord[1]][coord[0]] = undefined;
  }
  state.board[player.food[1]][player.food[0]] = undefined;
  delete state.players[id];
  io.emit("updateBoard", state.board);
};

io.on("connection", socket => {
  console.log(`${socket.id} connected!`);

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
    spawnNewFood(state, socket.id);

    io.emit("updateBoard", state.board);

    // start movement
    moveIntervalId = setInterval(movePlayer.bind(null, socket), moveInterval);
  });

  socket.on("move", direction => {
    movePlayer(socket, direction);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected!`);
    removePlayer(socket.id);
  });
});

http.listen(3000, () => {
  console.log(`Listening on port 3000 and looking in folder ${publicPath}`);
});
