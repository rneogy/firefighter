import React from "react";
import styled from "styled-components";

const MenuOption = styled.h2`
  transition: 200ms;
  :hover {
    transform: scale(1.1);
    cursor: pointer;
    color: #aefbff;
  }
`;

function Menu({ startGame }) {
  return (
    <>
      <h1>Snake Shooter</h1>
      <MenuOption onClick={startGame}>Play</MenuOption>
    </>
  );
}

export default Menu;
