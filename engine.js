// Game rules and state transitions. No DOM access, so the browser UI, the AI,
// and the Node trainer can all play through exactly this code.

const BOARD_SIZE = 8;
const DRAW_LIMIT = 40;

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

function cloneBoard(board) {
  return board.map((row) => row.map((cell) => (cell ? { ...cell } : null)));
}

function inBounds(row, col) {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
}

function forwardDirection(player) {
  return player === 'black' ? -1 : 1;
}

function otherPlayer(player) {
  return player === 'black' ? 'white' : 'black';
}

function farRowFor(player) {
  return player === 'black' ? 0 : BOARD_SIZE - 1;
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

function hasAnyLegalMove(board, player) {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (piece && piece.player === player) {
        if (getLegalMoves(board, row, col).length > 0 || getJumpMoves(board, row, col).length > 0) {
          return true;
        }
      }
    }
  }
  return false;
}

// A full game state. chainRow/chainCol are set only while mustContinue is
// true, i.e. mid multi-jump, and point at the piece that must keep jumping.
function createInitialState() {
  return {
    board: createInitialBoard(),
    currentPlayer: 'black',
    winner: null,
    draw: false,
    noProgressCount: 0,
    turnHadProgress: false,
    mustContinue: false,
    chainRow: null,
    chainCol: null,
  };
}

function cloneState(state) {
  return { ...state, board: cloneBoard(state.board) };
}

// Every move the player to move may make right now. Each move is
// { fromRow, fromCol, row, col } plus capturedRow/capturedCol for a jump.
// Jumping is mandatory, so if any piece can jump only jumps are returned;
// mid multi-jump only the chaining piece's further jumps are returned.
function getAllMoves(state) {
  if (state.winner || state.draw) return [];

  const { board, currentPlayer } = state;

  if (state.mustContinue) {
    const { chainRow, chainCol } = state;
    return getJumpMoves(board, chainRow, chainCol).map((m) => ({
      ...m, fromRow: chainRow, fromCol: chainCol,
    }));
  }

  const jumps = [];
  const steps = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (!piece || piece.player !== currentPlayer) continue;

      for (const m of getJumpMoves(board, row, col)) {
        jumps.push({ ...m, fromRow: row, fromCol: col });
      }
      for (const m of getLegalMoves(board, row, col)) {
        steps.push({ ...m, fromRow: row, fromCol: col });
      }
    }
  }
  return jumps.length > 0 ? jumps : steps;
}

// Plays a move returned by getAllMoves, mutating state. Handles capture,
// promotion, multi-jump continuation, passing the turn, and win/draw checks.
// Returns { turnEnded }: false means the same piece must keep jumping.
// The move is trusted to be legal; callers only pass moves from getAllMoves.
function applyMove(state, move) {
  const { board } = state;
  const piece = board[move.fromRow][move.fromCol];
  board[move.row][move.col] = piece;
  board[move.fromRow][move.fromCol] = null;

  const wasJump = move.capturedRow !== undefined;
  if (wasJump) {
    board[move.capturedRow][move.capturedCol] = null;
  }

  let justPromoted = false;
  if (!piece.king && move.row === farRowFor(piece.player)) {
    piece.king = true;
    justPromoted = true;
  }

  if (wasJump || justPromoted) {
    state.turnHadProgress = true;
  }

  // A piece crowned mid-chain stops immediately, even if it could jump again.
  if (wasJump && !justPromoted && getJumpMoves(board, move.row, move.col).length > 0) {
    state.mustContinue = true;
    state.chainRow = move.row;
    state.chainCol = move.col;
    return { turnEnded: false };
  }

  state.mustContinue = false;
  state.chainRow = null;
  state.chainCol = null;
  state.currentPlayer = otherPlayer(state.currentPlayer);

  const next = state.currentPlayer;
  if (countPieces(board, next) === 0 || !hasAnyLegalMove(board, next)) {
    state.winner = otherPlayer(next);
  }

  // Draws count whole turns with no capture and no new king, so progress is
  // accumulated across a multi-jump chain until the turn ends.
  if (!state.winner) {
    state.noProgressCount = state.turnHadProgress ? 0 : state.noProgressCount + 1;
    if (state.noProgressCount >= DRAW_LIMIT) {
      state.draw = true;
    }
  }
  state.turnHadProgress = false;

  return { turnEnded: true };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    BOARD_SIZE,
    DRAW_LIMIT,
    isDarkSquare,
    createInitialBoard,
    cloneBoard,
    inBounds,
    forwardDirection,
    otherPlayer,
    farRowFor,
    getLegalMoves,
    getJumpMoves,
    countPieces,
    hasAnyLegalMove,
    createInitialState,
    cloneState,
    getAllMoves,
    applyMove,
  };
}
