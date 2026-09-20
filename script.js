const BOARD_SIZE = 8;

function isDarkSquare(row, col) {
  return (row + col) % 2 === 1;
}

function createInitialBoard() {
  const board = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    const rowCells = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      let piece = null;
      if (isDarkSquare(row, col)) {
        if (row <= 1) {
          piece = { player: 'white', king: false };
        } else if (row >= 6) {
          piece = { player: 'black', king: false };
        }
      }
      rowCells.push(piece);
    }
    board.push(rowCells);
  }
  return board;
}

function inBounds(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function forwardDirection(player) {
  return player === 'black' ? -1 : 1;
}

// Legal non-capturing forward moves for the piece at (row, col). Kings are
// handled in a later ticket, so only forward moves apply for now.
function getLegalMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];

  const moves = [];
  const newRow = row + forwardDirection(piece.player);
  for (const dc of [-1, 1]) {
    const newCol = col + dc;
    if (inBounds(newRow, newCol) && board[newRow][newCol] === null) {
      moves.push({ row: newRow, col: newCol });
    }
  }
  return moves;
}

const state = {
  board: createInitialBoard(),
  currentPlayer: 'black',
  selected: null,
  legalMoves: [],
};

function countPieces(board, player) {
  let count = 0;
  for (const row of board) {
    for (const cell of row) {
      if (cell && cell.player === player) {
        count++;
      }
    }
  }
  return count;
}

function isHighlighted(row, col) {
  return state.legalMoves.some((m) => m.row === row && m.col === col);
}

function handleSquareClick(row, col) {
  const { board, selected } = state;
  const piece = board[row][col];

  if (selected && isHighlighted(row, col)) {
    board[row][col] = board[selected.row][selected.col];
    board[selected.row][selected.col] = null;
    state.selected = null;
    state.legalMoves = [];
    state.currentPlayer = state.currentPlayer === 'black' ? 'white' : 'black';
    render();
    return;
  }

  if (piece && piece.player === state.currentPlayer) {
    const moves = getLegalMoves(board, row, col);
    if (moves.length > 0) {
      state.selected = { row, col };
      state.legalMoves = moves;
      render();
    }
    return;
  }

  // Clicking an opponent's piece, an empty non-highlighted square, or an
  // own piece with no legal moves leaves the selection untouched.
}

function renderBoard() {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const square = document.createElement('div');
      const classes = ['square', isDarkSquare(row, col) ? 'dark' : 'light'];
      if (state.selected && state.selected.row === row && state.selected.col === col) {
        classes.push('selected');
      }
      if (isHighlighted(row, col)) {
        classes.push('highlight');
      }
      square.className = classes.join(' ');
      square.addEventListener('click', () => handleSquareClick(row, col));

      const piece = state.board[row][col];
      if (piece) {
        const pieceEl = document.createElement('div');
        pieceEl.className = `piece ${piece.player}`;
        square.appendChild(pieceEl);
      }

      boardEl.appendChild(square);
    }
  }
}

function renderStatus() {
  const label = state.currentPlayer === 'black' ? 'Black' : 'White';
  document.getElementById('status').textContent = `${label} to move`;
}

function renderCounts() {
  document.getElementById('black-count').textContent = `Black: ${countPieces(state.board, 'black')}`;
  document.getElementById('white-count').textContent = `White: ${countPieces(state.board, 'white')}`;
}

function render() {
  renderBoard();
  renderStatus();
  renderCounts();
}

render();
