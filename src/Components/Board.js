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

function Board({ width, gameState }) {
  return (
    <BoardContainer>
      {[...Array(width)].map((_, y) => (
        <RowContainer key={y}>
          {[...Array(width)].map((_, x) => {
            for (const id in gameState) {
              const player = gameState[id];
              const isPlayer = x === player.x && y === player.y;
              if (isPlayer) {
                return <Tile key={x} isPlayer={isPlayer} player={player} />;
              }
            }
            return <Tile key={x} isPlayer={false} />;
          })}
        </RowContainer>
      ))}
    </BoardContainer>
  );
}

export default Board;
