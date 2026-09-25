# #14: Shared game engine

Status: not started

## Goal
The game rules and the rules-driven state transition live in a standalone
`engine.js` with no DOM references, so the browser game, the AI, and a
future Node.js trainer all play through exactly the same code, with zero
duplicated logic.

## Done when
- [ ] `engine.js` contains all DOM-free game logic currently in `script.js`:
      `createInitialBoard`, `isDarkSquare`, `getLegalMoves`, `getJumpMoves`,
      `anyJumpsAvailable`, `getSelectableMoves`, `hasAnyLegalMove`,
      promotion (`farRowFor`), and the win/draw checks.
- [ ] `engine.js` also owns the state transition: `createInitialState()` and
      `applyMove(state, move)`, which handles capture, promotion,
      multi-jump chain continuation (a promotion ends the chain), turn
      switching, win/draw detection, and the no-capture/no-king counter.
- [ ] `engine.js` exports these via `module.exports`, guarded so it also
      loads as a plain `<script>` in the browser with no bundler.
- [ ] `index.html` loads `engine.js` before `script.js`. `script.js` only
      contains DOM/UI glue: rendering, click handling (pick a move from the
      highlighted moves, call `applyMove`), undo snapshots, and wiring up
      the New game/Undo/Help controls.
- [ ] A full game can be played from start to a win or draw in Node using
      only `engine.js`, with no DOM.
- [ ] No behavior change: a 300-game randomized regression run (same
      approach as ticket 10), now driven through `engine.js`, passes with
      zero errors and zero stuck states.

## Depends on
#13
