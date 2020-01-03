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

const moveBullets = player => {
  const keptBullets = [];
  for (const i in player.bullets) {
    const bullet = player.bullets[i];
    let bulletX = bullet.location[0];
    let bulletY = bullet.location[1];
    switch (bullet.direction) {
      case Directions.NORTH:
        bulletY = bulletY - 2;
        break;
      case Directions.SOUTH:
        bulletY = bulletY + 2;
        break;
      case Directions.WEST:
        bulletX = bulletX - 2;
        break;
      case Directions.EAST:
        bulletX = bulletX + 2;
        break;
      default:
        break;
    }

    // remove previous bullet location from board
    const boardBullet = state.board[bullet.location[1]][bullet.location[0]];
    state.board[bullet.location[1]][bullet.location[0]] = undefined;

    if (bulletX >= 0 && bulletX < width && bulletY >= 0 && bulletY < width) {
      const newBulletLocation = state.board[bulletY][bulletX];
      if (!newBulletLocation) {
        // if empty, keep moving forward
        state.board[bulletY][bulletX] = boardBullet;
        bullet.location = [bulletX, bulletY];
        keptBullets.push(bullet);
      } else if (newBulletLocation.player) {
        hitPlayer(newBulletLocation);
      }
      // get absorbed by anything else (obstructions, food, etc)
    }
  }
  player.bullets = keptBullets;
};

const movePlayer = (socket, direction) => {
  const id = socket.id;
  const player = state.players[id];
  if (!player) {
    return;
  }

  // move bullets before moving player
  moveBullets(player);

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
      obstruction: true,
      body: true
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
  for (const bullet of player.bullets) {
    const bulletX = bullet.location[0];
    const bulletY = bullet.location[1];
    state.board[bulletY][bulletX] = undefined;
  }
  state.board[player.food[1]][player.food[0]] = undefined;
  delete state.players[id];
  io.emit("updateBoard", state.board);
};

const hitPlayer = location => {
  const id = location.id;
  const player = state.players[id];

  let damage = 1;

  if (location.direction !== undefined) {
    // hit the head!
    damage = 3;
  }

  if (player.coordinates.length <= damage) {
    // killed the player
    removePlayer(id);
  } else {
    cutTail(player, damage);
  }
};

const cutTail = (player, cost) => {
  cost = cost || 1;
  for (let i = 0; i < cost; i++) {
    state.board[player.lastY()][player.lastX()] = undefined;
    player.coordinates.pop();
  }
};

const shoot = socket => {
  const player = state.players[socket.id];
  if (player.coordinates.length <= 1) {
    // don't let them shoot if they don't have ammo
    return;
  }
  let bulletX = player.x();
  let bulletY = player.y();
  switch (player.direction) {
    case Directions.NORTH:
      bulletY = bulletY - 1;
      break;
    case Directions.SOUTH:
      bulletY = bulletY + 1;
      break;
    case Directions.WEST:
      bulletX = bulletX - 1;
      break;
    case Directions.EAST:
      bulletX = bulletX + 1;
      break;
    default:
      break;
  }

  if (bulletX >= 0 && bulletX < width && bulletY >= 0 && bulletY < width) {
    const location = state.board[bulletY][bulletX];
    if (location && location.body) {
      // instant hit, do hit logic
      hitPlayer(location);
      // and then don't add any bullet to the screen
      return;
    } else if (location && location.bullet) {
      // don't waste bullets
      return;
    }

    // track to bullet with the player
    player.bullets.push({
      location: [bulletX, bulletY],
      direction: player.direction
    });

    // add the bullet to the board
    state.board[bulletY][bulletX] = {
      id: player.id,
      color: "#293233",
      bullet: true
    };

    // remove tail for ammo
    cutTail(player);
  }

  socket.emit("updateBoard", state.board);
};

io.on("connection", socket => {
  console.log(`${socket.id} connected!`);

  socket.on("start", () => {
    let startX = Math.floor(Math.random() * width);
    // never start users in top two rows to give some reaction time
    let startY = Math.floor(Math.random() * (width - 2)) + 2;
    while (state.board[startY][startX]) {
      startX = Math.floor(Math.random() * width);
      startY = Math.floor(Math.random() * (width - 2)) + 2;
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
      direction: Directions.NORTH,
      bullets: []
    };

    state.board[startY][startX] = {
      id: socket.id,
      color: playerColor,
      direction: Directions.NORTH,
      obstruction: true,
      body: true
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

  socket.on("shoot", () => {
    shoot(socket);
  });

  socket.on("disconnect", () => {
    console.log(`${socket.id} disconnected!`);
    removePlayer(socket.id);
  });
});

http.listen(3000, () => {
  console.log(`Listening on port 3000 and looking in folder ${publicPath}`);
});
