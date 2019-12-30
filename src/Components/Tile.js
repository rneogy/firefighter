import React from "react";
import styled from "styled-components";

const StyledTile = styled.div`
  width: 20px;
  height: 20px;
  margin: 2px;
  padding: 0;
  background-color: ${props => (props.isPlayer ? "#475ead" : "#d5dbf0")};
`;

function Tile({ isPlayer }) {
  return <StyledTile isPlayer={isPlayer} />;
}

export default Tile;
