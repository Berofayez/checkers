# #13: Undo

Status: not started

## Goal
An "Undo" button lets a player take back the last completed turn.

## Done when
- [ ] An "Undo" button is visible next to "New game" and "Help".
- [ ] Clicking it reverts the board, whose turn it is, piece counts, and any
      king promotions to how they were before the last completed turn.
- [ ] A turn that was a multi-jump chain is undone as a single unit (one
      click restores the position from before the whole chain, not just the
      last jump in it).
- [ ] The no-capture/no-king counter used for draw detection is restored to
      its value before the undone turn.
- [ ] Undo can be pressed repeatedly to step back through multiple turns, all
      the way to the start of the game.
- [ ] Clicking Undo with no moves left to undo (start of game) does nothing.
- [ ] Undo also works immediately after a win or a draw is declared, clearing
      that result and returning to the position before the deciding turn.
- [ ] Undoing clears any in-progress selection/highlighting.

## Depends on
#12
