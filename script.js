// UI glue: rendering, clicks, and undo history. All rules live in engine.js.

const game = createInitialState();

const ui = {
  selected: null,
  legalMoves: [],
  // Stack of snapshots, one per completed turn, each taken *before* that
  // turn started. Undo pops the most recent one to step back exactly one
  // turn, chain included.
  undoStack: [],
  // Snapshot of the turn currently in progress, taken when it began.
  turnStartSnapshot: cloneState(game),
};

function isHighlighted(row, col) {
  return ui.legalMoves.some((m) => m.row === row && m.col === col);
}

function playMove(move) {
  const { turnEnded } = applyMove(game, move);
  if (turnEnded) {
    ui.selected = null;
    ui.legalMoves = [];
    ui.undoStack.push(ui.turnStartSnapshot);
    ui.turnStartSnapshot = cloneState(game);
  } else {
    ui.selected = { row: game.chainRow, col: game.chainCol };
    ui.legalMoves = getAllMoves(game);
  }
  render();
}

function handleSquareClick(row, col) {
  if (game.winner || game.draw) return;

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

  // Squares holding a piece that must jump (only when a jump is required).
  const jumpable = new Set();
  if (!ui.selected) {
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

function render() {
  renderBoard();
  renderStatus();
  renderCounts();
}

function resetGame() {
  Object.assign(game, createInitialState());
  ui.selected = null;
  ui.legalMoves = [];
  ui.undoStack = [];
  ui.turnStartSnapshot = cloneState(game);
  render();
}

// Steps back exactly one completed turn (a multi-jump chain counts as one),
// restoring the board, whose turn it is, and the draw counter. Does nothing
// if no turn has been completed yet.
function undo() {
  if (ui.undoStack.length === 0) return;

  Object.assign(game, ui.undoStack.pop());
  ui.selected = null;
  ui.legalMoves = [];
  ui.turnStartSnapshot = cloneState(game);
  render();
}

document.getElementById('new-game').addEventListener('click', resetGame);
document.getElementById('undo').addEventListener('click', undo);

render();
