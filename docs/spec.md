# Checkers (8 pieces each): spec

A checkers game in the web browser for two players taking turns on the same
screen. It uses American rules, except each player starts with 8 pieces
instead of 12.

## Board
- 8×8 squares, alternating light and dark.
- Pieces use only the dark squares. A square in row `r` and column `c` is dark when `(r + c)` is odd.
- Row 0 is the top of the screen and row 7 is the bottom.

## Players and starting pieces
- Two players, **Black** and **White**, with 8 pieces each.
- **White** fills the dark squares of rows 0–1 (the top two rows).
- **Black** fills the dark squares of rows 6–7 (the bottom two rows).
- Rows 2–5 start empty.
- **Black moves first**. After that, players alternate turns.

## Moving
- On your turn you move exactly one piece.
- A normal piece moves **one square diagonally forward** onto an empty dark square. Black's forward is up and White's forward is down.
- A normal piece never moves backward.

## Jumping (capturing)
- If an enemy piece is diagonally next to yours and the square right behind it is empty, you can jump over it. The enemy piece is removed.
- A normal piece jumps **forward only**.
- **Jumping is required.** If any of your pieces can jump, you must make a jump. When there are several, you choose which one.
- **Multi-jump.** After a jump, if the same piece can jump again, it must keep jumping in the same turn. No other piece can move until the chain ends.

## Kings
- A normal piece that reaches the far row becomes a **king**. For Black that is row 0, and for White it is row 7.
- A king moves and jumps **one square diagonally in any direction** (forward or backward).
- If a piece becomes a king in the middle of a multi-jump, **its turn ends right away**.

## End of game
- **Win:** if the player whose turn it is has no pieces or no legal move, the other player wins.
- **Draw:** if 40 turns in a row pass with no capture and no new king, the game is a draw.

## Computer opponent (future)
- An optional mode where the computer plays one side instead of a second human. It only ever makes legal moves, and follows every rule a human player does (mandatory jumps, multi-jump chains, and so on).
- **How it learns:** a reinforcement-learning agent trained entirely through self-play. It starts with no strategy and improves purely by playing itself — the same lineage as Arthur Samuel's 1959 self-learning checkers program.
- **Value function:** the agent scores a board position with a weighted sum of a small set of features (piece count difference, king count difference, position and mobility, and so on). The weights are learned, not hand-tuned.
- **Training method:** temporal-difference (TD) learning. After each self-play move, the value estimate of the position just left is nudged toward the value of the position that followed (plus the eventual win/loss/draw outcome), repeated over many thousands of self-play games.
- **Where training happens:** offline, via a Node.js script separate from the browser game, reusing the same move-generation rules. It produces a small weights file with the learned numbers.
- **Move selection during play:** the browser loads the trained weights and scores legal moves with them (optionally with a shallow lookahead), picking the best-scoring move for the computer's side. No training happens while you're playing — it's instant.
- **Difficulty:** three levels (Easy, Medium, Hard) built on the one trained model. Hard always plays the best-scoring move; Medium and Easy occasionally play a non-optimal move on purpose instead, more often on Easy, so both are genuinely beatable.
- The player chooses between two modes: **Play with a friend** (two people taking turns on the same screen) and **Play vs Computer**. In vs Computer mode the human plays Black and moves first, the computer plays White, and the player also picks a difficulty level.

## Screen
- The board, with pieces as circles and kings shown with a crown mark.
- A status line: "Black to move", "White to move", "Black wins", "White wins", or "Draw".
- A piece count for each player.
- Click a piece to select it. Its legal squares are highlighted, and clicking one makes the move.
  - Clicking an illegal square does nothing.
  - Clicking a different own piece switches the selection, except during a multi-jump.
- When a jump is required, the pieces that can jump are highlighted.
- On opening the game, a choice between **Play with a friend** and **Play vs Computer** (with an Easy/Medium/Hard picker). A **Change mode** button returns to this choice.
- A **New game** button resets the board and restarts in the current mode.
- The board and controls resize to fit small screens, and the page can be installed to a phone's home screen and keeps working offline (a Progressive Web App).
- A short sound plays for a move, a capture, a win, and a draw, with a mute control.
- Pieces animate into place when they move, instead of snapping instantly.

## Not in this version (maybe later)
Online play, saving a game.
