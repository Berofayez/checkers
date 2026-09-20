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

// Row directions a piece may move/jump in: both ways for a king, forward
// only for a normal piece.
function pieceDirections(piece) {
  return piece.king ? [-1, 1] : [forwardDirection(piece.player)];
}

// Legal non-capturing moves for the piece at (row, col).
function getLegalMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];

  const moves = [];
  for (const dr of pieceDirections(piece)) {
    const newRow = row + dr;
    for (const dc of [-1, 1]) {
      const newCol = col + dc;
      if (inBounds(newRow, newCol) && board[newRow][newCol] === null) {
        moves.push({ row: newRow, col: newCol });
      }
    }
  }
  return moves;
}

// Legal jumps for the piece at (row, col): an adjacent enemy piece with an
// empty landing square right behind it.
function getJumpMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];

  const moves = [];
  for (const dr of pieceDirections(piece)) {
    for (const dc of [-1, 1]) {
      const midRow = row + dr;
      const midCol = col + dc;
      const landRow = row + 2 * dr;
      const landCol = col + 2 * dc;
      if (!inBounds(landRow, landCol)) continue;

      const midPiece = board[midRow][midCol];
      if (midPiece && midPiece.player !== piece.player && board[landRow][landCol] === null) {
        moves.push({ row: landRow, col: landCol, capturedRow: midRow, capturedCol: midCol });
      }
    }
  }
  return moves;
}

function farRowFor(player) {
  return player === 'black' ? 0 : BOARD_SIZE - 1;
}

function anyJumpsAvailable(board, player) {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player && getJumpMoves(board, row, col).length > 0) {
        return true;
      }
    }
  }
  return false;
}

// Moves selectable for the piece at (row, col) this turn: if any of the
// player's pieces can jump, jumping is mandatory, so only jumps qualify.
function getSelectableMoves(board, row, col) {
  const piece = board[row][col];
  if (!piece) return [];

  const jumps = getJumpMoves(board, row, col);
  if (anyJumpsAvailable(board, piece.player)) {
    return jumps;
  }
  return getLegalMoves(board, row, col);
}

const state = {
  board: createInitialBoard(),
  currentPlayer: 'black',
  selected: null,
  legalMoves: [],
  mustContinue: false,
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

  if (selected) {
    const move = state.legalMoves.find((m) => m.row === row && m.col === col);
    if (move) {
      const movedPiece = board[selected.row][selected.col];
      board[row][col] = movedPiece;
      board[selected.row][selected.col] = null;

      const wasJump = move.capturedRow !== undefined;
      if (wasJump) {
        board[move.capturedRow][move.capturedCol] = null;
      }

      let justPromoted = false;
      if (!movedPiece.king && row === farRowFor(movedPiece.player)) {
        movedPiece.king = true;
        justPromoted = true;
      }

      // A king crowned mid-chain stops immediately, even if it could jump again.
      const furtherJumps = wasJump && !justPromoted ? getJumpMoves(board, row, col) : [];
      if (furtherJumps.length > 0) {
        state.selected = { row, col };
        state.legalMoves = furtherJumps;
        state.mustContinue = true;
      } else {
        state.selected = null;
        state.legalMoves = [];
        state.mustContinue = false;
        state.currentPlayer = state.currentPlayer === 'black' ? 'white' : 'black';
      }
      render();
      return;
    }

    if (state.mustContinue) {
      // Mid multi-jump: no other piece can move until the chain ends.
      return;
    }
  }

  if (piece && piece.player === state.currentPlayer) {
    const moves = getSelectableMoves(board, row, col);
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
  const jumpsRequired = anyJumpsAvailable(state.board, state.currentPlayer);

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
      if (!state.selected && jumpsRequired) {
        const piece = state.board[row][col];
        if (piece && piece.player === state.currentPlayer && getJumpMoves(state.board, row, col).length > 0) {
          classes.push('jumpable');
        }
      }
      square.className = classes.join(' ');
      square.addEventListener('click', () => handleSquareClick(row, col));

      const piece = state.board[row][col];
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
