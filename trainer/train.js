// Self-play reinforcement learning for the checkers computer opponent.
//
// The agent starts with all-zero weights (it knows nothing about strategy),
// plays thousands of games against itself, and after every move nudges its
// weights toward what happened next (temporal-difference learning, TD(0)).
// Only the final result of each game (win = +1, loss = -1, draw = 0) comes
// from outside; everything else is learned from its own experience.
//
// Usage: node trainer/train.js [--games N] [--seed N] [--alpha X] [--eval-depth N]
//                              [--eval-games N] [--out FILE]
// Writes weights.json only if the trained agent beats a random player (the gate).
//
// Training itself uses depth-1 self-play (judge the position right after each
// move). Strength is then measured with `--eval-depth` moves of lookahead over
// the learned scoring, the way the computer opponent will actually play.

const fs = require('fs');
const path = require('path');
const { createInitialState, getAllMoves, applyMove } = require('../engine.js');
const { FEATURE_NAMES, predictValue, chooseMove } = require('../ai.js');

const GATE_WIN_RATE = 0.85;
const MAX_PLIES = 600;

const ALPHA_END_FRACTION = 0.1;
const EPSILON_START = 0.3;
const EPSILON_END = 0.05;

function parseArgs(argv) {
  const args = {
    games: 20000,
    seed: 1,
    alpha: 0.02,
    evalDepth: 3,
    evalGames: 1000,
    out: path.join(__dirname, '..', 'weights.json'),
  };
  for (let i = 2; i < argv.length; i += 2) {
    const key = argv[i].replace(/^--/, '');
    const value = argv[i + 1];
    if (key === 'games') args.games = Number(value);
    else if (key === 'seed') args.seed = Number(value);
    else if (key === 'alpha') args.alpha = Number(value);
    else if (key === 'eval-depth') args.evalDepth = Number(value);
    else if (key === 'eval-games') args.evalGames = Number(value);
    else if (key === 'out') args.out = value;
    else throw new Error(`Unknown option --${key}`);
  }
  return args;
}

// Small seedable random number generator so a run can be reproduced exactly.
function makeRng(seed) {
  let a = seed | 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Moves the weights so the value predicted for `prev` is closer to `target`.
function tdUpdate(weights, prev, target, alpha) {
  const predicted = predictValue(weights, prev.features);
  const step = alpha * (target - predicted) * (1 - predicted * predicted);
  for (let i = 0; i < weights.length; i++) {
    weights[i] += step * prev.features[i];
  }
}

function playSelfPlayGame(weights, epsilon, alpha, rng) {
  let state = createInitialState();
  let prev = null;
  let plies = 0;

  while (!state.winner && !state.draw && plies < MAX_PLIES) {
    const choice = chooseMove(state, weights, { epsilon, rng });
    state = choice.after;
    plies++;
    // Each position is trained toward the position that followed it.
    if (prev) tdUpdate(weights, prev, choice.value, alpha);
    prev = choice;
  }

  const reward = state.winner === 'black' ? 1 : state.winner === 'white' ? -1 : 0;
  if (prev) tdUpdate(weights, prev, reward, alpha);
  return plies;
}

// Players: functions from a game state to a move.
const learnedPlayer = (weights, rng, depth = 1) => (state) =>
  chooseMove(state, weights, { rng, depth }).move;
const randomPlayer = (rng) => (state) => {
  const moves = getAllMoves(state);
  return moves[Math.floor(rng() * moves.length)];
};

function playOneGame(blackPlayer, whitePlayer) {
  const state = createInitialState();
  for (let plies = 0; !state.winner && !state.draw && plies < MAX_PLIES; plies++) {
    const player = state.currentPlayer === 'black' ? blackPlayer : whitePlayer;
    applyMove(state, player(state));
  }
  return state.winner; // 'black' | 'white' | null (draw or ply cap)
}

// Plays `games` games of A vs B, A taking Black in half of them, and returns
// results from A's point of view.
function playMatch(playerA, playerB, games) {
  const result = { games, wins: 0, draws: 0, losses: 0 };
  for (let g = 0; g < games; g++) {
    const aIsBlack = g % 2 === 0;
    const winner = aIsBlack ? playOneGame(playerA, playerB) : playOneGame(playerB, playerA);
    if (winner === null) result.draws++;
    else if ((winner === 'black') === aIsBlack) result.wins++;
    else result.losses++;
  }
  return result;
}

const rate = (r) => (r.wins / r.games);
const describe = (r) =>
  `${(rate(r) * 100).toFixed(1)}% wins (${r.wins}W ${r.draws}D ${r.losses}L of ${r.games})`;

function main() {
  const args = parseArgs(process.argv);
  const rng = makeRng(args.seed);
  const weights = FEATURE_NAMES.map(() => 0);
  const started = Date.now();
  const play = (w, seed, depth = args.evalDepth) => learnedPlayer(w, makeRng(seed), depth);

  // Learning curve: how well the agent beats a random player as it trains.
  const checkpoints = new Set([0, 250, 1000, 3000, 10000, 20000, args.games]);
  const curve = [];
  const checkpoint = (gamesDone) => {
    const r = playMatch(play(weights, 999), randomPlayer(makeRng(998)), 200);
    curve.push({ games: gamesDone, winRate: rate(r) });
    console.log(`  after ${String(gamesDone).padStart(6)} games: beats random ${describe(r)}`);
  };

  console.log(`Training ${args.games} self-play games (seed ${args.seed}, alpha ${args.alpha});`);
  console.log(`progress checks play with ${args.evalDepth}-move lookahead`);
  checkpoint(0);
  let plyTotal = 0;
  for (let g = 1; g <= args.games; g++) {
    const progress = g / args.games;
    const alpha = args.alpha * (1 - (1 - ALPHA_END_FRACTION) * progress);
    const epsilon = EPSILON_START + (EPSILON_END - EPSILON_START) * progress;
    plyTotal += playSelfPlayGame(weights, epsilon, alpha, rng);
    if (checkpoints.has(g) && g !== args.games) checkpoint(g);
    if (g % 5000 === 0) {
      const secs = ((Date.now() - started) / 1000).toFixed(0);
      console.log(`  ... ${g} games, ${secs}s, avg ${(plyTotal / g).toFixed(0)} plies/game`);
    }
  }
  checkpoint(args.games);

  console.log('\nLearned weights:');
  FEATURE_NAMES.forEach((name, i) => console.log(`  ${name.padEnd(14)} ${weights[i].toFixed(3)}`));

  // Final check against a random player, over fresh games.
  const random = () => randomPlayer(makeRng(8));
  const vsRandom = playMatch(play(weights, 7), random(), args.evalGames);
  const vsRandomDepth1 = playMatch(play(weights, 7, 1), random(), args.evalGames);
  console.log(`\nFinal vs random player, ${args.evalDepth}-move lookahead: ${describe(vsRandom)}`);
  console.log(`Final vs random player, no lookahead:     ${describe(vsRandomDepth1)}`);

  // Context: how does it do against a hand-written "just count material" rule?
  const materialOnly = FEATURE_NAMES.map((name) => (name === 'men' ? 1.5 : name === 'kings' ? 2.5 : 0));
  const materialVsRandom = playMatch(play(materialOnly, 7), random(), args.evalGames);
  const learnedVsMaterial = playMatch(play(weights, 5), play(materialOnly, 6), args.evalGames);
  console.log(`Material-only rule vs random:  ${describe(materialVsRandom)}`);
  console.log(`Learned vs material-only rule: ${describe(learnedVsMaterial)}`);

  const passed = rate(vsRandom) >= GATE_WIN_RATE;
  console.log(`\nGate (>= ${GATE_WIN_RATE * 100}% wins vs random): ${passed ? 'PASS' : 'FAIL'}`);
  if (!passed) {
    console.log('Not writing weights.');
    process.exitCode = 1;
    return;
  }

  const output = {
    version: 1,
    features: FEATURE_NAMES,
    weights: weights.map((w) => Number(w.toFixed(6))),
    training: { method: 'TD(0) self-play', games: args.games, seed: args.seed, alpha: args.alpha },
    evaluation: { lookaheadDepth: args.evalDepth, vsRandom, vsRandomNoLookahead: vsRandomDepth1, learningCurve: curve },
  };
  const json = JSON.stringify(output, null, 2);
  fs.writeFileSync(args.out, json + '\n');
  console.log(`Wrote ${args.out}`);

  // The same data as a plain script, so the game can load it with a normal
  // <script> tag (a fetch() of the JSON file fails when index.html is opened
  // straight from disk).
  const scriptPath = /\.json$/.test(args.out) ? args.out.replace(/\.json$/, '.js') : `${args.out}.js`;
  fs.writeFileSync(
    scriptPath,
    `// Generated by trainer/train.js from weights.json. Do not edit by hand.\nconst WEIGHTS = ${json};\n`
  );
  console.log(`Wrote ${scriptPath}`);
}

main();
