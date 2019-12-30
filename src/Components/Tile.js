import React from "react";
import styled from "styled-components";

const StyledTile = styled.div`
  width: 20px;
  height: 20px;
  margin: 2px;
  padding: 0;
  background-color: #d5dbf0;
`;

const PlayerTile = styled(StyledTile)`
  background-color: #475ead;
`;

function Tile({ isPlayer, direction }) {
  if (isPlayer) {
    return <PlayerTile direction={direction} />;
  }
  return <StyledTile />;
}

export default Tile;
