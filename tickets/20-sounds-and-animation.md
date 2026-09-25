# #20: Sounds and move animation

Status: not started

## Goal
Moves feel more alive: pieces slide into place instead of snapping, and
short sounds mark moves, captures, and the end of the game.

## Done when
- [ ] Moving a piece animates it sliding from its old square to its new one
      (reusing the `requestAnimationFrame` easing technique already built
      for the help page's move demo) instead of an instant DOM update.
- [ ] A short sound plays for: a normal move, a capture, a win, and a draw.
- [ ] A mute control is visible and immediately silences all sounds; its
      state is remembered across a page reload.
- [ ] Sounds and animation don't block or slow down input — clicking during
      an animation behaves sensibly (e.g. the click is ignored until the
      animation finishes, rather than corrupting the board state).
- [ ] A multi-jump chain animates each jump in the chain in sequence, not
      all at once.

## Depends on
#19
