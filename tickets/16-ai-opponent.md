# #16: Game mode choice and in-browser AI opponent

Status: done

## Goal
The player chooses between two ways to play: **Play with a friend** (two
people on the same screen, as today) or **Play vs Computer**, where the
trained AI picks its moves through the exact same rules pipeline as a human.

## Done when
- [x] On opening the game, the player sees two clear options: "Play with a
      friend" and "Play vs Computer".
- [x] "Play with a friend" behaves exactly like the game does today (both
      sides human, taking turns on the same screen).
- [x] "Play vs Computer" starts a game where the human plays Black (and
      moves first) and the computer plays White.
- [x] A "Change mode" control returns to the two-option choice at any time;
      New game restarts in the mode currently being played.
- [x] `index.html` loads `ai.js` (after `engine.js`) and `weights.js`, so
      the browser scores positions with exactly the code the trainer learned
      with (ticket 15). The trainer writes `weights.js` (the same data as
      `weights.json`, as a plain script) because a `fetch` of the JSON file
      fails when `index.html` is opened straight from disk.
- [x] On its turn, the computer calls `chooseMove` from `ai.js`, which looks
      at every move from `getAllMoves` (so mandatory jumps and multi-jump
      chains are already respected), looks a few moves ahead using the
      learned scoring, and plays the best one. The default depth is 3, about
      0.7 ms per move.
- [x] The AI's move is applied through the same move-application path a
      human click uses (`playMove` → `applyMove`), so multi-jump chains,
      promotion-ends-chain, win/draw detection, and Undo all work
      identically on the computer's turns, with no separate move logic.
- [x] The computer's move happens automatically (no click needed) after the
      human's turn ends, with a short pause (0.6 s) rather than an instant
      snap; a multi-jump is played one jump at a time. Clicks are ignored
      while it is the computer's turn, and no red "must jump" outlines are
      shown on its pieces.
- [x] In "Play vs Computer", Undo steps back one full round (the human's
      move and the computer's reply together), so the player never lands on
      the computer's turn and gets instantly re-moved. Pressing Undo while
      the computer is "thinking" cancels its pending move.

## Verification notes
- **Real browser:** run in headless Google Chrome against the actual page
  (served over local HTTP). 19 behaviour checks pass: menu shown on load and
  game hidden; friend mode works and the White side does not auto-move;
  Change mode returns to the menu; in computer mode the computer replies,
  clicks are ignored while it thinks, Undo removes the whole round, Undo
  mid-think cancels its move, and New game keeps the mode. Screenshots of
  the menu and a game in progress were checked by eye.
- **Full games through the real page:** 5 games of a random-clicking human
  against the computer, played with the real 0.6 s timers. The computer won
  all 5, none got stuck, none ended mid-jump, and there were no console
  errors.
- **Friend mode unchanged:** the previous `script.js` and the new one were
  given identical random clicks (moves, illegal clicks, undos, resets) and
  compared after every action (about 38,000 actions over 250 games): zero
  differences in game state, highlights, undo history, or the rendered board.
- Only console message: the browser asks for a `favicon.ico` the site
  doesn't have (a harmless 404; the PWA ticket adds icons).
- Not verified: a phone, and Safari/Firefox (only Chrome was available).

## Depends on
#15
