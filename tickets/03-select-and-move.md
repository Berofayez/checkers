# #3: Select and move

Status: done

## Goal
A player can select one of their pieces and move it one square diagonally
forward, with turns alternating between players. No jumping yet.

## Done when
- [x] Clicking one of the current player's pieces selects it and highlights
      its legal forward, non-capturing moves.
- [x] Clicking a highlighted square moves the selected piece there and ends
      the turn.
- [x] Clicking an illegal (non-highlighted) square does nothing.
- [x] Clicking a different piece belonging to the current player switches the
      selection to it.
- [x] Clicking an opponent's piece, or a piece with no legal moves, does not
      select it.
- [x] The status line and turn alternate correctly between "Black to move"
      and "White to move" after each move.
- [x] A normal piece cannot move backward or sideways.

## Depends on
#2
