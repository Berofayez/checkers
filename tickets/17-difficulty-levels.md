# #17: Three difficulty levels

Status: done

## Goal
A player can choose Easy, Medium, or Hard before playing the computer, all
using the one trained model from ticket 15 — no retraining.

## Done when
- [x] An Easy/Medium/Hard selector is shown when the player picks "Play vs
      Computer" (and not in "Play with a friend"), defaulting to Medium.
- [x] On Hard, the computer looks 5 moves ahead and never plays a random
      move.
- [x] On Medium and Easy, the computer is deliberately weaker: Medium looks 3
      moves ahead and plays a random move 15% of the time; Easy looks 1 move
      ahead and plays a random move 50% of the time, so both lower levels are
      genuinely beatable by a casual player.
- [x] The three levels are shown to be genuinely different by a headless
      round-robin: Hard beats Medium, Medium beats Easy, and Easy still
      beats a random player, over many games.
- [x] Switching difficulty mid-session (even while the computer is about to
      move) takes effect immediately, without needing a new game; New game
      and Change mode keep the chosen level.
- [x] The chosen difficulty is visible on screen while playing against the
      computer (highlighted button and the mode label).

## Settings
Defined once in `ai.js` (`DIFFICULTY_LEVELS`), used by both the game and the
tests:

| Level  | Looks ahead | Random move | Time cap per move |
|--------|-------------|-------------|-------------------|
| Easy   | 1 move      | 50%         | none needed       |
| Medium | 3 moves     | 15%         | 500 ms            |
| Hard   | 5 moves     | 0%          | 800 ms            |

## Verification notes
- **Ranking (200 games each, production settings, colours alternated):**
  Hard beats Medium 189W-11D-0L (95%); Medium beats Easy 185W-10D-5L (93%);
  Hard beats Easy 200W-0D-0L; Easy beats a random player 175W-9D-16L (88%).
- **A serious problem found and fixed: the search could freeze the page.**
  While timing moves I found that Hard's slowest single move took about **14
  seconds** in a crowded, king-heavy position (average was only ~9 ms). Fixes
  in `ai.js`: the search now (1) deepens one move at a time and stops when a
  time budget runs out, playing the deepest search it finished, and (2)
  searches the most promising move first with a narrowed window so it prunes
  far more. After: the slowest Hard move is 41 ms in whole games and 52 ms in
  300 deliberately crowded king positions. The time cap never even had to
  intervene there, so I also forced it (depth 8 with a 3 ms budget): it still
  answered in at most 5.2 ms over ~4,000 moves, always with a legal move.
- **No loss of move quality:** the faster search was compared with a slow
  unpruned reference minimax on 8,001 positions at depths 2, 3 and 4 from
  real games; the move it chose was always one of the reference's best moves
  (0 misses). The ranking numbers above are identical before and after the
  speed-up, and re-running the trainer still reproduces `weights.json`
  exactly.
- **Real browser (headless Chrome), 16 checks pass:** picker hidden in friend
  mode and shown in computer mode; Medium is the default; the button and the
  label follow the choice; choosing a level doesn't restart the game; the
  computer's actual search settings match the level (Easy = depth 1 / 50%
  random); switching to Hard while the computer's move is pending makes that
  very move use Hard's settings; New game and Change mode keep the level;
  full games at each level finish cleanly with no console errors, the
  slowest real search being 18 ms (Hard).
- Not verified: a phone, and Safari/Firefox (only Chrome was available).
  Phone CPUs are slower, which is what the time cap is for.

## Depends on
#16
