import React from "react";
import styled from "styled-components";
import Tile from "./Tile";

const BoardContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #0c1124;
`;

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

function Board({ width, position }) {
  return (
    <BoardContainer>
      {[...Array(width)].map((_, y) => (
        <RowContainer key={y}>
          {[...Array(width)].map((_, x) => (
            <Tile key={x} isPlayer={x === position.x && y === position.y} />
          ))}
        </RowContainer>
      ))}
    </BoardContainer>
  );
}

export default Board;
