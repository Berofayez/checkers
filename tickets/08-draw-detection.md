# #8: Draw detection

Status: done

## Goal
The game recognizes and announces a draw after 40 consecutive turns with no
capture and no new king.

## Done when
- [x] A counter tracks consecutive turns with no capture and no piece
      promoted to king.
- [x] The counter resets to 0 whenever a capture happens or a piece becomes
      a king.
- [x] When the counter reaches 40, the status line shows "Draw".
- [x] Once a draw is declared, no further moves can be made on the board.

## Depends on
#7
