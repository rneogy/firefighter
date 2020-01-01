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

function Board({ width, boardState }) {
  return (
    <BoardContainer>
      {boardState.map((row, y) => (
        <RowContainer key={y}>
          {row.map((tile, x) => {
            return <Tile key={x} tile={tile} />;
          })}
        </RowContainer>
      ))}
    </BoardContainer>
  );
}

export default Board;
