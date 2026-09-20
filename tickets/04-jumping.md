# #4: Jumping

Status: done

## Goal
A player can jump over an adjacent enemy piece to capture it, and must do so
whenever a jump is available.

## Done when
- [x] A normal piece can jump forward over a diagonally adjacent enemy piece
      onto the empty square right behind it, removing the enemy piece.
- [x] If any of the current player's pieces can jump, only those pieces can
      be selected, and a non-jump move is not allowed.
- [x] The pieces that can jump are highlighted when a jump is required.
- [x] When more than one jump is available, the player may choose which piece
      or jump to take.
- [x] Piece counts update after a capture.

## Depends on
#3
