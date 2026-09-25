# #14: Shared game engine

Status: done

## Goal
The game rules and the rules-driven state transition live in a standalone
`engine.js` with no DOM references, so the browser game, the AI, and a
future Node.js trainer all play through exactly the same code, with zero
duplicated logic.

## Done when
- [x] `engine.js` contains all DOM-free game logic formerly in `script.js`:
      `createInitialBoard`, `isDarkSquare`, `getLegalMoves`, `getJumpMoves`,
      `hasAnyLegalMove`, promotion (`farRowFor`), and the win/draw checks.
      (`getAllMoves` replaces the old per-piece `getSelectableMoves` and
      `anyJumpsAvailable`: it returns every legal move for the side to
      move, with mandatory jumping and the mid-chain lock built in.)
- [x] `engine.js` also owns the state transition: `createInitialState()` and
      `applyMove(state, move)`, which handles capture, promotion,
      multi-jump chain continuation (a promotion ends the chain), turn
      switching, win/draw detection, and the no-capture/no-king counter.
- [x] `engine.js` exports these via `module.exports`, guarded so it also
      loads as a plain `<script>` in the browser with no bundler.
- [x] `index.html` loads `engine.js` before `script.js`. `script.js` only
      contains DOM/UI glue: rendering, click handling (pick a move from the
      highlighted moves, call `applyMove`), undo snapshots, and wiring up
      the New game/Undo/Help controls.
- [x] A full game can be played from start to a win or draw in Node using
      only `engine.js`, with no DOM.
- [x] No behavior change: verified against the previous `script.js`.

## Verification notes
- 500 random full games driven through `engine.js` alone: 470 wins (232
  Black / 238 White), 30 draws, 0 errors, 0 stuck states, no piece counts
  above 8.
- Differential test: the previous `script.js` (from git) and the new
  `engine.js` + `script.js` were given identical random clicks (legal moves,
  illegal clicks, selection switching, undos, mid-game resets), and after
  every action their game state, selection, highlighted moves, undo history,
  status line, piece counts, and rendered board were compared. Three runs,
  about 150,000 actions each match, over 750 games.
- The one intentional difference: after a game ends in a **draw**, the old
  code still outlined a piece in red as "must jump" even though the board is
  frozen. The engine returns no moves once a game is over, so that stale
  highlight is gone. It only ever appeared on a finished, frozen game.

## Depends on
#13
