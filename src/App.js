import React, { useState, useEffect } from "react";
import Board from "./Components/Board";
import Menu from "./Components/Menu";
import { Directions } from "./Util/Enums";
import io from "socket.io-client";
import styled from "styled-components";

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #0c1124;
  color: #d5dbf0;
`;

let keyDown = {};

function App() {
  const [playerId, setId] = useState();
  const [boardState, setBoardState] = useState([]);
  const [playState, setPlayState] = useState("menu");
  const [socket, setSocket] = useState();

  useEffect(() => {
    // on page load
    const socket = io("localhost:3000");
    setSocket(socket);
    socket.on("connect", () => setId(socket.id));
    socket.on("updateBoard", setBoardState);
    socket.on("updatePlayState", setPlayState);

    const moveHandler = e => {
      if (keyDown[e.key]) {
        return;
      }
      keyDown[e.key] = true;
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

    const keyUpHandler = e => {
      keyDown[e.key] = false;
    };

    document.addEventListener("keydown", moveHandler);
    document.addEventListener("keyup", keyUpHandler);

    return () => {
      document.removeEventListener("keydown", moveHandler);
      document.removeEventListener("keyup", keyUpHandler);
    };
  }, []);

  useEffect(() => {
    if (playState === "playing") {
      socket.emit("start");
    }
  }, [playState, socket]);

  let playView;

  switch (playState) {
    case "playing":
      playView = <Board {...{ boardState }} />;
      break;
    case "gameOver":
      playView = (
        <Menu startGame={() => setPlayState("playing")} gameOver={true} />
      );
      break;
    case "menu":
    default:
      playView = <Menu startGame={() => setPlayState("playing")} />;
  }

  return <AppContainer>{playView}</AppContainer>;
}

export default App;
