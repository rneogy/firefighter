import React, { useState, useEffect } from "react";
import Board from "./Components/Board";
import { Directions } from "./Util/Enums";
import randomColor from "randomcolor";

const width = 21;

function App() {
  const [player, setPlayer] = useState({
    x: Math.floor(Math.random() * width),
    y: Math.floor(Math.random() * width),
    color: randomColor(),
    direction: Directions.NORTH
  });

  useEffect(() => {
    const moveHandler = e => {
      switch (e.key) {
        case "ArrowUp":
          setPlayer({
            ...player,
            y: Math.max(0, player.y - 1),
            direction: Directions.NORTH
          });
          break;
        case "ArrowDown":
          setPlayer({
            ...player,
            y: Math.min(width - 1, player.y + 1),
            direction: Directions.SOUTH
          });
          break;
        case "ArrowLeft":
          setPlayer({
            ...player,
            x: Math.max(0, player.x - 1),
            direction: Directions.WEST
          });
          break;
        case "ArrowRight":
          setPlayer({
            ...player,
            x: Math.min(width - 1, player.x + 1),
            direction: Directions.EAST
          });
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", moveHandler);

    return () => {
      document.removeEventListener("keydown", moveHandler);
    };
  }, [player]);
  return <Board {...{ width, player }} />;
}

export default App;
