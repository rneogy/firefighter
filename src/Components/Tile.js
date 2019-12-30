import React from "react";
import styled from "styled-components";
import { Directions } from "../Util/Enums";

const StyledTile = styled.div`
  width: 20px;
  height: 20px;
  margin: 2px;
  padding: 0;
  background-color: #d5dbf0;
`;

const PlayerTile = styled(StyledTile)`
  background-color: #475ead;
  box-sizing: border-box;
  border-left: ${props =>
    props.direction === Directions.WEST ? "2px solid red" : "none"};
  border-top: ${props =>
    props.direction === Directions.NORTH ? "2px solid red" : "none"};
  border-right: ${props =>
    props.direction === Directions.EAST ? "2px solid red" : "none"};
  border-bottom: ${props =>
    props.direction === Directions.SOUTH ? "2px solid red" : "none"};
`;

function Tile({ isPlayer, direction }) {
  if (isPlayer) {
    return <PlayerTile direction={direction} />;
  }
  return <StyledTile />;
}

export default Tile;
