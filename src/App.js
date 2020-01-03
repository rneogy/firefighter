import React, { useState, useEffect } from "react";
import Board from "./Components/Board";
import Menu from "./Components/Menu";
import { Directions } from "./Util/Enums";
import io from "socket.io-client";
import styled, { keyframes } from "styled-components";

const damageAnimation = keyframes`
  20% {
    transform: translate(5px, -10px);
    background-color: #bf3917;
  }

  50% {
    transform: translate(-7px, 2px);
    background-color: #75160f;
  }

  70% {
    transform: translate(2px, 3px);
    background-color: #bf3917;
  }

  0%, 100% {
    transform: translate(0, 0);
    background-color: #0c1124;
  }
`;

const shootAnimation = keyframes`
  0%, 100% {
    background-color: #0c1124;
  }

  50% {
    background-color: #131a38;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #0c1124;
  color: #d5dbf0;
  animation: ${props => {
      switch (props.anim) {
        case "damage":
          return damageAnimation;
        case "ammo":
          return shootAnimation;
        default:
          return "none";
      }
    }}
    300ms linear forwards;
`;

let keyDown = {};

function App() {
  const [boardState, setBoardState] = useState([]);
  const [playState, setPlayState] = useState("menu");
  const [socket, setSocket] = useState();
  const [length, setLength] = useState(1);
  const [anim, setAnim] = useState();

  useEffect(() => {
    // on page load
    const socket = io();
    setSocket(socket);
    socket.on("updateBoard", setBoardState);
    socket.on("updatePlayState", setPlayState);
    socket.on("updatePlayerState", update => {
      setLength(update.length);
      setAnim(update.cause);
    });
  }, []);

  useEffect(() => {
    if (playState === "playing") {
      socket.emit("start");

      const moveHandler = e => {
        if (keyDown[e.code]) {
          return;
        }
        keyDown[e.code] = true;
        switch (e.code) {
          case "ArrowUp":
          case "KeyW":
            socket.emit("move", Directions.NORTH);
            break;
          case "ArrowDown":
          case "KeyS":
            socket.emit("move", Directions.SOUTH);
            break;
          case "ArrowLeft":
          case "KeyA":
            socket.emit("move", Directions.WEST);
            break;
          case "ArrowRight":
          case "KeyD":
            socket.emit("move", Directions.EAST);
            break;
          case "Space":
            socket.emit("shoot");
            break;
          default:
            break;
        }
      };

      const keyUpHandler = e => {
        keyDown[e.code] = false;
      };

      document.addEventListener("keydown", moveHandler);
      document.addEventListener("keyup", keyUpHandler);

      return () => {
        document.removeEventListener("keydown", moveHandler);
        document.removeEventListener("keyup", keyUpHandler);
      };
    }
  }, [playState, socket]);

  let playView;

  switch (playState) {
    case "playing":
      playView = (
        <>
          <h3>{length}</h3>
          <Board {...{ boardState }} />
        </>
      );
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

  return (
    <AppContainer {...{ anim }} onAnimationEnd={() => setAnim()}>
      {playView}
    </AppContainer>
  );
}

export default App;
