# #3: Select and move

Status: not started

## Goal
A player can select one of their pieces and move it one square diagonally
forward, with turns alternating between players. No jumping yet.

## Done when
- [ ] Clicking one of the current player's pieces selects it and highlights
      its legal forward, non-capturing moves.
- [ ] Clicking a highlighted square moves the selected piece there and ends
      the turn.
- [ ] Clicking an illegal (non-highlighted) square does nothing.
- [ ] Clicking a different piece belonging to the current player switches the
      selection to it.
- [ ] Clicking an opponent's piece, or a piece with no legal moves, does not
      select it.
- [ ] The status line and turn alternate correctly between "Black to move"
      and "White to move" after each move.
- [ ] A normal piece cannot move backward or sideways.

## Depends on
#2
