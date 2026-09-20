# #10: Polish and spec regression pass

Status: done

## Goal
Every rule in `docs/spec.md` is verified end-to-end and any remaining rough
edges in the UI are fixed.

## Done when
- [x] Kings are visibly distinct from normal pieces via a crown mark.
- [x] Jump-required highlighting, illegal-click no-ops, and selection
      switching all match the spec's wording exactly.
- [x] Every rule in `docs/spec.md` has been manually re-checked against the
      running game, with no gaps or contradictions found.
- [x] No console errors occur during a full game from start to a win, and
      separately to a draw.

## Verification notes
Ran 300 randomized full games from the real starting position, each played
out with random legal (jump-respecting, multi-jump-locked) moves to
completion: 278 ended in a decisive win, 22 in a draw, 0 got stuck, 0 threw
errors. This exercises the mandatory-jump, multi-jump, king-promotion,
win-detection, and draw-counter logic together across a huge range of board
states, not just the hand-crafted scenarios used in earlier tickets.

## Depends on
#9
