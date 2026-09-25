# #16: In-browser AI opponent

Status: not started

## Goal
A "Play vs Computer" control lets a player face the trained AI, which picks
its moves using the learned value function and plays through the exact same
rules pipeline as a human.

## Done when
- [ ] The browser loads `weights.json` and can score a candidate board
      position using the same feature/value-function shape trained in
      ticket 15.
- [ ] A "Play vs Computer" control starts a game where the computer plays
      one side (the other stays human-controlled by clicking, as today).
- [ ] On its turn, the computer evaluates every move/jump returned by
      `getSelectableMoves` for its pieces (so mandatory jumps are already
      respected), scores the resulting position for each, and plays the
      best-scoring one.
- [ ] The AI's move is applied through the same move-application path a
      human click uses, so multi-jump chains, promotion-ends-chain, win/draw
      detection, and Undo all keep working identically on the computer's
      turns, with no separate/duplicated move logic.
- [ ] The computer's move happens automatically (no click needed) after the
      human's turn ends, with a brief visible pause rather than an instant
      snap, so its move is easy to follow.

## Depends on
#15
