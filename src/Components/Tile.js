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
  background-color: ${props => props.color};
  box-sizing: border-box;
  border-left: ${props =>
    props.direction === Directions.WEST ? "3px solid orange" : "none"};
  border-top: ${props =>
    props.direction === Directions.NORTH ? "3px solid orange" : "none"};
  border-right: ${props =>
    props.direction === Directions.EAST ? "3px solid orange" : "none"};
  border-bottom: ${props =>
    props.direction === Directions.SOUTH ? "3px solid orange" : "none"};
`;

function Tile({ isPlayer, player }) {
  if (isPlayer) {
    return <PlayerTile direction={player.direction} color={player.color} />;
  }
  return <StyledTile />;
}

export default Tile;
