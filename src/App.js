import React, { useState, useEffect } from "react";
import Board from "./Components/Board";

const width = 20;

function App() {
  const [position, setPosition] = useState({ x: width / 2, y: width / 2 });

  useEffect(() => {
    const moveHandler = e => {
      switch (e.key) {
        case "ArrowUp":
          setPosition({ x: position.x, y: position.y - 1 });
          break;
        case "ArrowDown":
          setPosition({ x: position.x, y: position.y + 1 });
          break;
        case "ArrowLeft":
          setPosition({ x: position.x - 1, y: position.y });
          break;
        case "ArrowRight":
          setPosition({ x: position.x + 1, y: position.y });
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", moveHandler);

    return () => {
      document.removeEventListener("keydown", moveHandler);
    };
  }, [position]);
  return <Board {...{ width, position }} />;
}

export default App;
