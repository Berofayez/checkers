# #15: Self-play RL trainer

Status: not started

## Goal
A Node.js script trains a checkers-playing value function purely through
self-play (temporal-difference learning), producing a small committed
weights file the browser can later use to play.

## Done when
- [ ] `trainer/train.js` runs standalone via `node trainer/train.js`, using
      `engine.js` for all move/rule logic (no duplicated rules).
- [ ] A small hand-picked feature vector is defined for a board position
      (e.g. piece count difference, king count difference, advancement,
      mobility) and a linear value function scores a position as a weighted
      sum of those features.
- [ ] The trainer plays many thousands of self-play games, and after each
      move updates the weights using TD(0): nudging the value of the
      position just left toward the value of the position that followed
      (and the game's eventual win/loss/draw outcome at terminal states).
- [ ] After training, the resulting agent is checked against a baseline
      that picks uniformly among its legal moves, and clearly beats it more
      often than not over many games — a sanity check that learning
      actually happened before the weights are trusted.
- [ ] The learned weights are written to a small `weights.json` committed to
      the repo.

## Depends on
#14
