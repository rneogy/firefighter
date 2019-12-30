import React, { useState, useEffect } from "react";
import Board from "./Components/Board";
import { Directions } from "./Util/Enums";

const width = 21;

function App() {
  const [position, setPosition] = useState({
    x: Math.floor(width / 2),
    y: Math.floor(width / 2)
  });

  const [direction, setDirection] = useState(Directions.NORTH);

  useEffect(() => {
    const moveHandler = e => {
      switch (e.key) {
        case "ArrowUp":
          setPosition({ x: position.x, y: Math.max(0, position.y - 1) });
          setDirection(Directions.NORTH);
          break;
        case "ArrowDown":
          setPosition({
            x: position.x,
            y: Math.min(width - 1, position.y + 1)
          });
          setDirection(Directions.SOUTH);
          break;
        case "ArrowLeft":
          setPosition({ x: Math.max(0, position.x - 1), y: position.y });
          setDirection(Directions.WEST);
          break;
        case "ArrowRight":
          setPosition({
            x: Math.min(width - 1, position.x + 1),
            y: position.y
          });
          setDirection(Directions.EAST);
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", moveHandler);

    return () => {
      document.removeEventListener("keydown", moveHandler);
    };
  }, [position, direction]);
  return <Board {...{ width, position, direction }} />;
}

export default App;
