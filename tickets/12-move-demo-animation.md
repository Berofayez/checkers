# #12: Animated move demo

Status: done

## Goal
The help page shows a small looping animation of a piece making one move,
so a new player can see the motion, not just read about it.

## Done when
- [x] The help page has a diagram showing a piece sliding one square
      diagonally onto a highlighted destination square.
- [x] The motion loops (plays repeatedly) automatically, with no click
      required and no external video file.
- [x] The animation is implemented as a lightweight in-page graphic (SVG +
      JS), not a video file, since there's no recorded gameplay footage to
      embed.
- [x] The addition doesn't affect the actual game (index.html/script.js are
      unchanged).

## Depends on
#11
