import React, { useState, useEffect } from "react";
import Board from "./Components/Board";
import { Directions } from "./Util/Enums";
import io from "socket.io-client";

const width = 31;

function App() {
  const [playerId, setId] = useState();
  const [boardState, setBoardState] = useState([]);

  useEffect(() => {
    const socket = io("localhost:3000");
    socket.on("connect", () => setId(socket.id));
    socket.on("update", setBoardState);

    const moveHandler = e => {
      switch (e.key) {
        case "ArrowUp":
          socket.emit("move", Directions.NORTH);
          break;
        case "ArrowDown":
          socket.emit("move", Directions.SOUTH);
          break;
        case "ArrowLeft":
          socket.emit("move", Directions.WEST);
          break;
        case "ArrowRight":
          socket.emit("move", Directions.EAST);
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", moveHandler);

    return () => {
      document.removeEventListener("keydown", moveHandler);
    };
  }, []);

  return <Board {...{ width, boardState, playerId }} />;
}

export default App;
