# #17: Three difficulty levels

Status: not started

## Goal
A player can choose Easy, Medium, or Hard before playing the computer, all
using the one trained model from ticket 15 — no retraining.

## Done when
- [ ] An Easy/Medium/Hard selector is shown when the player picks "Play vs
      Computer" (and not in "Play with a friend"), defaulting to one clear
      level (e.g. Medium).
- [ ] On Hard, the computer always plays the highest-scoring move (as built
      in ticket 16).
- [ ] On Medium and Easy, the computer sometimes plays a non-optimal move on
      purpose instead of the best-scoring one — more often on Easy than
      Medium — so both lower levels are genuinely beatable by a casual
      player.
- [ ] Switching difficulty mid-session (before the computer's next move)
      takes effect immediately, without needing a new game.
- [ ] The chosen difficulty is visible somewhere on screen while playing
      against the computer.

## Depends on
#16
