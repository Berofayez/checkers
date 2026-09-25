# #16: Game mode choice and in-browser AI opponent

Status: not started

## Goal
The player chooses between two ways to play: **Play with a friend** (two
people on the same screen, as today) or **Play vs Computer**, where the
trained AI picks its moves through the exact same rules pipeline as a human.

## Done when
- [ ] On opening the game, the player sees two clear options: "Play with a
      friend" and "Play vs Computer".
- [ ] "Play with a friend" behaves exactly like the game does today (both
      sides human, taking turns on the same screen).
- [ ] "Play vs Computer" starts a game where the human plays Black (and
      moves first) and the computer plays White.
- [ ] A "Change mode" control returns to the two-option choice at any time;
      New game restarts in the mode currently being played.
- [ ] The browser loads `weights.json` and can score a candidate board
      position using the same feature/value-function shape trained in
      ticket 15.
- [ ] On its turn, the computer evaluates every move/jump returned by
      `getSelectableMoves` for its pieces (so mandatory jumps are already
      respected), scores the resulting position for each, and plays the
      best-scoring one.
- [ ] The AI's move is applied through the same move-application path a
      human click uses (`applyMove`), so multi-jump chains,
      promotion-ends-chain, win/draw detection, and Undo all keep working
      identically on the computer's turns, with no separate/duplicated move
      logic.
- [ ] The computer's move happens automatically (no click needed) after the
      human's turn ends, with a brief visible pause rather than an instant
      snap, so its move is easy to follow. Clicks are ignored while it is
      the computer's turn.
- [ ] In "Play vs Computer", Undo steps back one full round (the human's
      move and the computer's reply together), so the player never lands on
      the computer's turn and gets instantly re-moved.

## Depends on
#15
