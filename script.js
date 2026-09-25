// UI glue: rendering, clicks, modes, and undo history. All rules live in
// engine.js, and the computer's move choice lives in ai.js.

const HUMAN_SIDE = 'black';
const COMPUTER_SIDE = 'white';
const COMPUTER_DELAY_MS = 600;

const game = createInitialState();

const ui = {
  // 'friend' (two people on one screen), 'computer', or null while the
  // mode menu is showing.
  mode: null,
  // 'easy' | 'medium' | 'hard' (see DIFFICULTY_LEVELS in ai.js). Changing it
  // takes effect on the computer's next move.
  difficulty: 'medium',
  computerTimer: null,
  selected: null,
  legalMoves: [],
  // Stack of snapshots, one per completed turn, each taken *before* that
  // turn started. Undo pops the most recent one to step back exactly one
  // turn, chain included.
  undoStack: [],
  // Snapshot of the turn currently in progress, taken when it began.
  turnStartSnapshot: cloneState(game),
};

const menuEl = document.getElementById('mode-menu');
const gameEl = document.getElementById('game');

function isComputerTurn() {
  return ui.mode === 'computer'
    && game.currentPlayer === COMPUTER_SIDE
    && !game.winner
    && !game.draw;
}

function isHighlighted(row, col) {
  return ui.legalMoves.some((m) => m.row === row && m.col === col);
}

function cancelComputerMove() {
  clearTimeout(ui.computerTimer);
  ui.computerTimer = null;
}

// Lets the computer play after a short pause so its move is easy to follow.
// A multi-jump is played one jump at a time, each after its own pause.
function scheduleComputerMove() {
  cancelComputerMove();
  if (isComputerTurn()) {
    ui.computerTimer = setTimeout(computerMove, COMPUTER_DELAY_MS);
  }
}

function computerMove() {
  ui.computerTimer = null;
  if (!isComputerTurn()) return;

  const choice = chooseMove(game, WEIGHTS.weights, DIFFICULTY_LEVELS[ui.difficulty]);
  if (choice) playMove(choice.move);
}

// The one path every move takes, whether a person clicked it or the
// computer chose it.
function playMove(move) {
  const computerMoved = ui.mode === 'computer' && game.currentPlayer === COMPUTER_SIDE;
  const { turnEnded } = applyMove(game, move);

  if (turnEnded) {
    ui.selected = null;
    ui.legalMoves = [];
    ui.undoStack.push(ui.turnStartSnapshot);
    ui.turnStartSnapshot = cloneState(game);
  } else if (computerMoved) {
    ui.selected = null;
    ui.legalMoves = [];
  } else {
    ui.selected = { row: game.chainRow, col: game.chainCol };
    ui.legalMoves = getAllMoves(game);
  }

  render();
  scheduleComputerMove();
}

function handleSquareClick(row, col) {
  if (game.winner || game.draw || isComputerTurn()) return;

  if (ui.selected) {
    const move = ui.legalMoves.find((m) => m.row === row && m.col === col);
    if (move) {
      playMove(move);
      return;
    }

    if (game.mustContinue) {
      // Mid multi-jump: no other piece can move until the chain ends.
      return;
    }
  }

  const piece = game.board[row][col];
  if (piece && piece.player === game.currentPlayer) {
    const moves = getAllMoves(game).filter((m) => m.fromRow === row && m.fromCol === col);
    if (moves.length > 0) {
      ui.selected = { row, col };
      ui.legalMoves = moves;
      render();
    }
  }

  // Clicking an opponent's piece, an empty non-highlighted square, or an
  // own piece with no legal moves leaves the selection untouched.
}

function renderBoard() {
  const boardEl = document.getElementById('board');

  // Squares holding a piece that must jump (only when a jump is required, and
  // only on a person's turn, never while the computer is about to move).
  const jumpable = new Set();
  if (!ui.selected && !isComputerTurn()) {
    for (const m of getAllMoves(game)) {
      if (m.capturedRow !== undefined) {
        jumpable.add(m.fromRow * BOARD_SIZE + m.fromCol);
      }
    }
  }

  boardEl.innerHTML = '';
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const square = document.createElement('div');
      const classes = ['square', isDarkSquare(row, col) ? 'dark' : 'light'];
      if (ui.selected && ui.selected.row === row && ui.selected.col === col) {
        classes.push('selected');
      }
      if (isHighlighted(row, col)) {
        classes.push('highlight');
      }
      if (jumpable.has(row * BOARD_SIZE + col)) {
        classes.push('jumpable');
      }
      square.className = classes.join(' ');
      square.addEventListener('click', () => handleSquareClick(row, col));

      const piece = game.board[row][col];
      if (piece) {
        const pieceEl = document.createElement('div');
        pieceEl.className = `piece ${piece.player}${piece.king ? ' king' : ''}`;
        square.appendChild(pieceEl);
      }

      boardEl.appendChild(square);
    }
  }
}

function renderStatus() {
  const statusEl = document.getElementById('status');
  if (game.winner) {
    const label = game.winner === 'black' ? 'Black' : 'White';
    statusEl.textContent = `${label} wins`;
    return;
  }
  if (game.draw) {
    statusEl.textContent = 'Draw';
    return;
  }
  const label = game.currentPlayer === 'black' ? 'Black' : 'White';
  statusEl.textContent = `${label} to move`;
}

function renderCounts() {
  document.getElementById('black-count').textContent = `Black: ${countPieces(game.board, 'black')}`;
  document.getElementById('white-count').textContent = `White: ${countPieces(game.board, 'white')}`;
}

function renderModeLabel() {
  const levelName = ui.difficulty.charAt(0).toUpperCase() + ui.difficulty.slice(1);
  const label = ui.mode === 'computer'
    ? `Playing vs Computer (${levelName}) — you are Black`
    : ui.mode === 'friend'
      ? 'Playing with a friend'
      : '';
  document.getElementById('mode-label').textContent = label;

  document.getElementById('difficulty-picker').hidden = ui.mode !== 'computer';
  for (const button of document.querySelectorAll('.level-button')) {
    const active = button.dataset.level === ui.difficulty;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  }
}

function render() {
  renderBoard();
  renderStatus();
  renderCounts();
  renderModeLabel();
}

// Restarts in the mode currently being played.
function resetGame() {
  cancelComputerMove();
  Object.assign(game, createInitialState());
  ui.selected = null;
  ui.legalMoves = [];
  ui.undoStack = [];
  ui.turnStartSnapshot = cloneState(game);
  render();
}

// Steps back exactly one completed turn (a multi-jump chain counts as one),
// restoring the board, whose turn it is, and the draw counter. Does nothing
// if no turn has been completed yet. Against the computer it steps back a
// full round (your move and its reply) so you land on your own turn rather
// than the computer's.
function undo() {
  if (ui.undoStack.length === 0) return;

  cancelComputerMove();
  let snapshot = ui.undoStack.pop();
  if (ui.mode === 'computer') {
    while (snapshot.currentPlayer !== HUMAN_SIDE && ui.undoStack.length > 0) {
      snapshot = ui.undoStack.pop();
    }
  }

  Object.assign(game, snapshot);
  ui.selected = null;
  ui.legalMoves = [];
  ui.turnStartSnapshot = cloneState(game);
  render();
  scheduleComputerMove();
}

function startGame(mode) {
  ui.mode = mode;
  menuEl.hidden = true;
  gameEl.hidden = false;
  resetGame();
}

function showModeMenu() {
  cancelComputerMove();
  ui.mode = null;
  gameEl.hidden = true;
  menuEl.hidden = false;
}

document.getElementById('mode-friend').addEventListener('click', () => startGame('friend'));
document.getElementById('mode-computer').addEventListener('click', () => startGame('computer'));
document.getElementById('change-mode').addEventListener('click', showModeMenu);
document.getElementById('new-game').addEventListener('click', resetGame);
document.getElementById('undo').addEventListener('click', undo);
for (const button of document.querySelectorAll('.level-button')) {
  button.addEventListener('click', () => {
    ui.difficulty = button.dataset.level;
    render();
  });
}

render();
