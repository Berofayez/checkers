const BOARD_SIZE = 8;

function renderEmptyBoard() {
  const board = document.getElementById('board');
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const square = document.createElement('div');
      const isDark = (row + col) % 2 === 1;
      square.className = `square ${isDark ? 'dark' : 'light'}`;
      board.appendChild(square);
    }
  }
}

renderEmptyBoard();
