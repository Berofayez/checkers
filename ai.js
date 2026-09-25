// Position scoring and move choice for the computer opponent. No DOM access:
// the Node trainer learns the weights with this code, and the browser plays
// with the learned weights using the same code, so they can never disagree.
//
// A position is scored from Black's point of view: +1 means Black is winning,
// -1 means White is winning. White simply picks the move that minimises it.

// In the browser engine.js is loaded first and its functions are globals; in
// Node, make them globals the same way so this file works unchanged.
if (typeof module !== 'undefined' && module.exports) {
  Object.assign(globalThis, require('./engine.js'));
}

const FEATURE_NAMES = [
  'men',           // normal pieces
  'kings',         // kings
  'advancement',   // how far normal pieces have travelled toward promotion
  'backRow',       // normal pieces still guarding their own home row
  'center',        // pieces in the middle of the board
  'edges',         // pieces on the left/right edge
  'mobility',      // number of legal moves and jumps available
  'captureToMove', // jumps available to the side about to move (a capture is coming)
];

// Each feature is scaled so it stays roughly within [-1, 1], letting one
// learning rate suit them all.
const FEATURE_SCALES = [8, 8, 24, 4, 8, 8, 10, 4];

function extractFeatures(state) {
  const { board } = state;
  const totals = {
    black: [0, 0, 0, 0, 0, 0, 0],
    white: [0, 0, 0, 0, 0, 0, 0],
  };
  const jumps = { black: 0, white: 0 };

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const piece = board[row][col];
      if (!piece) continue;

      const t = totals[piece.player];
      if (piece.king) {
        t[1] += 1;
      } else {
        t[0] += 1;
        const travelled = piece.player === 'black' ? BOARD_SIZE - 1 - row : row;
        t[2] += travelled;
        if (row === BOARD_SIZE - 1 - farRowFor(piece.player)) t[3] += 1;
      }
      if (row >= 2 && row <= 5 && col >= 2 && col <= 5) t[4] += 1;
      if (col === 0 || col === BOARD_SIZE - 1) t[5] += 1;

      const pieceJumps = getJumpMoves(board, row, col).length;
      jumps[piece.player] += pieceJumps;
      t[6] += getLegalMoves(board, row, col).length + pieceJumps;
    }
  }

  const features = totals.black.map((b, i) => (b - totals.white[i]) / FEATURE_SCALES[i]);
  const mover = state.currentPlayer;
  const sign = mover === 'black' ? 1 : -1;
  features.push((sign * jumps[mover]) / FEATURE_SCALES[7]);
  return features;
}

function dot(weights, features) {
  let sum = 0;
  for (let i = 0; i < features.length; i++) sum += weights[i] * features[i];
  return sum;
}

// The learned value function: tanh keeps it in (-1, 1), matching the +1 / -1
// / 0 rewards for a Black win / White win / draw that it is trained toward.
function predictValue(weights, features) {
  return Math.tanh(dot(weights, features));
}

// The exact value of a finished game, or null if it is still going.
function finishedValue(state) {
  if (state.winner) return state.winner === 'black' ? 1 : -1;
  if (state.draw) return 0;
  return null;
}

// Scores a position. A finished game is scored exactly (win = +/-1, draw = 0)
// rather than guessed by the value function. Returns the features too, which
// the trainer needs to learn from.
function describePosition(state, weights) {
  const features = extractFeatures(state);
  const exact = finishedValue(state);
  return { features, value: exact !== null ? exact : predictValue(weights, features) };
}

// Looks `depth` moves ahead (alpha-beta minimax, Black maximising and White
// minimising) and scores the position reached with the value function.
// Sooner wins score slightly higher, so a winning line is actually finished.
function searchValue(state, weights, depth, alpha, beta, clock) {
  const exact = finishedValue(state);
  if (exact !== null) return exact * (1 + 0.01 * depth);
  if (depth === 0) return predictValue(weights, extractFeatures(state));

  // Stop early once the time budget is spent; the caller then throws this
  // (partial) search away.
  if ((++clock.nodes & 15) === 0 && Date.now() > clock.deadline) clock.expired = true;
  if (clock.expired) return 0;

  const maximizing = state.currentPlayer === 'black';
  let best = maximizing ? -Infinity : Infinity;
  for (const move of getAllMoves(state)) {
    const child = cloneState(state);
    applyMove(child, move);
    const v = searchValue(child, weights, depth - 1, alpha, beta, clock);
    if (clock.expired) break;
    if (maximizing) {
      if (v > best) best = v;
      if (best > alpha) alpha = best;
    } else {
      if (v < best) best = v;
      if (best < beta) beta = best;
    }
    if (alpha >= beta) break;
  }
  return best;
}

// Picks the move for the side to move.
//   depth:   how many moves ahead to look (1 = judge only the position right
//            after the move; higher is stronger but slower).
//   timeMs:  optional time budget. The search deepens one move at a time and
//            stops when the time is up, playing on the deepest search it
//            finished, so the answer always arrives quickly even in a busy
//            position or on a slow device.
//   epsilon: chance of playing a uniformly random move instead (exploration in
//            training, and a "make a mistake on purpose" dial for difficulty).
//   rng:     () => number in [0, 1), so callers can make runs reproducible.
// Returns { move, after, features, value } for the position reached by the
// chosen move (what the trainer learns from), or null if there is no move.
function chooseMove(state, weights, options = {}) {
  const { depth = 1, epsilon = 0, rng = Math.random, timeMs = Infinity } = options;
  const moves = getAllMoves(state);
  if (moves.length === 0) return null;

  const describeMove = (move) => {
    const after = cloneState(state);
    applyMove(after, move);
    return { move, after, ...describePosition(after, weights) };
  };

  if (epsilon > 0 && rng() < epsilon) {
    return describeMove(moves[Math.floor(rng() * moves.length)]);
  }

  const sign = state.currentPlayer === 'black' ? 1 : -1;
  const candidates = moves.map(describeMove);

  // A score per candidate for the side to move (higher is better). Start from
  // the position right after each move, then refine with deeper searches.
  let scores = candidates.map((c) => sign * c.value);
  const deadline = timeMs === Infinity ? Infinity : Date.now() + timeMs;

  for (let d = 2; d <= depth; d++) {
    const clock = { deadline, nodes: 0, expired: false };
    // Best-looking moves first, so the rest can be pruned sooner.
    const order = candidates.map((_, i) => i).sort((a, b) => scores[b] - scores[a]);
    const next = new Array(candidates.length);
    let bestRaw = null; // best result this round, from Black's point of view

    for (const i of order) {
      // Only moves at least as good as the best so far can matter, so search
      // with a window that lets anything worse be cut off early.
      const alpha = sign === 1 && bestRaw !== null ? bestRaw - 1e-9 : -Infinity;
      const beta = sign === -1 && bestRaw !== null ? bestRaw + 1e-9 : Infinity;
      const raw = searchValue(candidates[i].after, weights, d - 1, alpha, beta, clock);
      if (clock.expired) break;
      next[i] = sign * raw;
      if (bestRaw === null || sign * raw > sign * bestRaw) bestRaw = raw;
    }

    if (clock.expired) break; // keep the last depth that was fully searched
    scores = next;
  }

  let best = [];
  let bestScore = -Infinity;
  candidates.forEach((candidate, i) => {
    if (scores[i] > bestScore + 1e-12) {
      bestScore = scores[i];
      best = [candidate];
    } else if (scores[i] > bestScore - 1e-12) {
      best.push(candidate);
    }
  });
  return best[Math.floor(rng() * best.length)];
}

// The three difficulty levels, all playing with the same learned weights.
// They differ only in how far ahead the computer looks and how often it plays
// a random move on purpose. Chosen from head-to-head results: Hard beats
// Medium about 95% of the time, Medium beats Easy about 90%, and Easy still
// beats a purely random player most of the time. timeMs caps how long a move
// may take, so a crowded position or a slow phone can't freeze the page.
const DIFFICULTY_LEVELS = {
  easy: { depth: 1, epsilon: 0.5 },
  medium: { depth: 3, epsilon: 0.15, timeMs: 500 },
  hard: { depth: 5, epsilon: 0, timeMs: 800 },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    DIFFICULTY_LEVELS,
    FEATURE_NAMES,
    FEATURE_SCALES,
    extractFeatures,
    predictValue,
    describePosition,
    chooseMove,
  };
}
