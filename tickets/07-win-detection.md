# #7: Win detection

Status: not started

## Goal
The game recognizes and announces a win when the player to move has no
pieces or no legal move.

## Done when
- [ ] After each turn, the game checks whether the player now to move has
      zero pieces remaining, or has pieces but no legal move (including no
      legal jump).
- [ ] If so, the status line shows "Black wins" or "White wins" as
      appropriate.
- [ ] Once a winner is declared, no further moves can be made on the board.

## Depends on
#6
