# Checkers

A two-player checkers game that runs entirely in the browser, with no build
step and no dependencies. Players take turns on the same screen, using
American checkers rules except each side starts with 8 pieces instead of 12.

## Play it

**Live:** https://berofayez.github.io/checkers/

Or run it locally: open `index.html` in a browser. No server or install
required.

## Features

- Full ruleset: forward moves, mandatory jumps, multi-jump chains, king
  promotion, win detection, and draw detection after 40 quiet turns.
- Click-to-select play with legal-move and mandatory-jump highlighting.
- **New game** button to reset the board at any time.
- **Undo** button that steps back one full turn at a time (a multi-jump
  chain undoes as a single unit), all the way to the start of the game.
- **Help** page (opens in a new tab) with plain-language instructions and
  diagrams, including a looping animation of a piece making a move.

## Project structure

- `engine.js` — the game rules and move logic, with no DOM access, so the
  browser UI and (later) the AI trainer share exactly the same code.
- `index.html`, `script.js`, `style.css` — the game's screen and controls.
- `help.html` — the in-app instructions page, self-contained.
- `docs/spec.md` — the full rules specification the game is built against.
- `tickets/` — the project's development history as a sequence of small,
  independently-verifiable tickets (`01-project-setup.md` through the
  latest), each describing one feature and its "done when" criteria.

## Rules summary

- 8×8 board; pieces sit only on dark squares.
- White starts on rows 0–1, Black on rows 6–7; Black moves first.
- A normal piece moves one square diagonally forward.
- Jumping is mandatory whenever available, and a piece that can jump again
  after jumping must keep jumping in the same turn.
- A piece reaching the far row becomes a king and can move or jump in any of
  the four diagonal directions.
- A player with no pieces or no legal move loses; 40 turns in a row with no
  capture and no new king is a draw.

See `docs/spec.md` for the complete specification, or open the in-app Help
page for a friendlier walkthrough with diagrams.
