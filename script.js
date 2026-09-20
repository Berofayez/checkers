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

function renderBoard(board) {
  const boardEl = document.getElementById('board');
  boardEl.innerHTML = '';
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const square = document.createElement('div');
      square.className = `square ${isDarkSquare(row, col) ? 'dark' : 'light'}`;

      const piece = board[row][col];
      if (piece) {
        const pieceEl = document.createElement('div');
        pieceEl.className = `piece ${piece.player}`;
        square.appendChild(pieceEl);
      }

      boardEl.appendChild(square);
    }
  }
}

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

function renderCounts(board) {
  document.getElementById('black-count').textContent = `Black: ${countPieces(board, 'black')}`;
  document.getElementById('white-count').textContent = `White: ${countPieces(board, 'white')}`;
}

const board = createInitialBoard();
renderBoard(board);
renderCounts(board);
