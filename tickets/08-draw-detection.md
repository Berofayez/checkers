# #8: Draw detection

Status: not started

## Goal
The game recognizes and announces a draw after 40 consecutive turns with no
capture and no new king.

## Done when
- [ ] A counter tracks consecutive turns with no capture and no piece
      promoted to king.
- [ ] The counter resets to 0 whenever a capture happens or a piece becomes
      a king.
- [ ] When the counter reaches 40, the status line shows "Draw".
- [ ] Once a draw is declared, no further moves can be made on the board.

## Depends on
#7
