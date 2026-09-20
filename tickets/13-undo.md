# #13: Undo

Status: done

## Goal
An "Undo" button lets a player take back the last completed turn.

## Done when
- [x] An "Undo" button is visible next to "New game" and "Help".
- [x] Clicking it reverts the board, whose turn it is, piece counts, and any
      king promotions to how they were before the last completed turn.
- [x] A turn that was a multi-jump chain is undone as a single unit (one
      click restores the position from before the whole chain, not just the
      last jump in it).
- [x] The no-capture/no-king counter used for draw detection is restored to
      its value before the undone turn.
- [x] Undo can be pressed repeatedly to step back through multiple turns, all
      the way to the start of the game.
- [x] Clicking Undo with no moves left to undo (start of game) does nothing.
- [x] Undo also works immediately after a win or a draw is declared, clearing
      that result and returning to the position before the deciding turn.
- [x] Undoing clears any in-progress selection/highlighting.

## Depends on
#12
