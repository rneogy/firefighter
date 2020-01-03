import React from "react";
import styled from "styled-components";
import Tile from "./Tile";

const RowContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

function Board({ width, boardState }) {
  return (
    <>
      {boardState.map((row, y) => (
        <RowContainer key={y}>
          {row.map((tile, x) => {
            return <Tile key={x} tile={tile} />;
          })}
        </RowContainer>
      ))}
    </>
  );
}

export default Board;
