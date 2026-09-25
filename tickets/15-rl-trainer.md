# #15: Self-play RL trainer

Status: done

## Goal
A Node.js script trains a checkers-playing value function purely through
self-play (temporal-difference learning), producing a small committed
weights file the browser can later use to play.

## Done when
- [x] `trainer/train.js` runs standalone via `node trainer/train.js`, using
      `engine.js` for all move/rule logic (no duplicated rules).
- [x] The scoring code lives in a shared, DOM-free `ai.js` (feature vector,
      value function, and `chooseMove` with optional lookahead), so the
      browser can later play with exactly the code the trainer learned with.
- [x] A small hand-picked feature vector is defined for a board position
      (piece and king counts, advancement, back-row guard, centre control,
      edge pieces, mobility, and whether a capture is pending for the side
      to move) and a value function scores a position as `tanh` of a
      weighted sum of those features.
- [x] The trainer plays 20,000 self-play games from all-zero weights, and
      after each move updates the weights using TD(0): nudging the value of
      the position just left toward the value of the position that followed
      (and the game's eventual win/loss/draw outcome at the end).
- [x] After training, the agent is checked against a baseline that picks
      uniformly among its legal moves and clearly beats it (gate: at least
      85% wins) before the weights are written.
- [x] The learned weights are written to a small `weights.json` committed to
      the repo, plus `weights.js` (the same data as a plain script the page
      can load, added in ticket 16).

## Verification notes
- **First attempt failed the gate, as the gate exists to catch.** With 7
  features and the agent judging only the position right after its own move,
  it beat a random player just 79.6% of the time, and longer training didn't
  help (the win rate wandered between about 71% and 86%). Cause: it couldn't
  see that a move left a piece hanging for the opponent to capture.
  Fixes: a "capture pending for the side to move" feature, an optional
  few-moves-ahead search at play time, and a lower learning rate (0.05 to
  0.02).
- **Result (seed 1, 20,000 games, about 100 s, fully reproducible):** wins
  1,000 of 1,000 games against a random player with 3-move lookahead, and
  998 of 1,000 (2 draws) with no lookahead at all, so the learned scoring
  itself is doing the work. Half the games were played as each colour.
- **It learned, not just ran:** with all-zero weights it wins 53% against a
  random player (it is playing randomly); after just 250 self-play games it
  wins 99.5%.
- **Same result from other seeds:** seeds 2 and 3 also reach 99.5–100%, and
  all three runs learn nearly the same values: a man is worth about 1.0, a
  king about 1.2–1.4, and a pending capture about 0.4–0.5.
- **Better than a simple rule, not just better than random:** against a
  hand-written "count material" rule with the same lookahead, the learned
  agent wins far more decisive games (seed 1: 499 wins, 53 losses, 448
  draws; seeds 2 and 3 show the same lopsided pattern).
- **Fair to both colours:** a position rotated 180 degrees with colours
  swapped scores exactly the negative of the original (18,750 random
  positions checked, zero differences), so it can't favour Black or White.
- **Loads like a browser page:** `engine.js` and `ai.js` were loaded as plain
  scripts in a `require`-less context and played a full game.
- **Speed:** choosing a move takes about 0.7 ms at 3 moves of lookahead and
  about 8 ms at 5, comfortably fast in a browser.
- **Caveat:** beating a random player is a low bar (the material rule also
  beats random 99.7% of the time), so it shows the pipeline works, not that
  the AI is hard to beat. The meaningful strength measure is the comparison
  above, and, for ticket 17, how the three difficulty levels rank against
  each other.

## Depends on
#14
