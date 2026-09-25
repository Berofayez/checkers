# #18: Mobile-responsive layout

Status: not started

## Goal
The game and help page work well on phone-sized screens, as the foundation
the PWA ticket builds on.

## Done when
- [ ] `index.html` and `help.html` both have a viewport meta tag
      (`width=device-width, initial-scale=1`).
- [ ] The board and pieces scale to fit small screens instead of using the
      fixed 60px cell / 44px piece sizes, without ever overflowing the
      viewport width.
- [ ] Controls (New game, Undo, Help) and piece counts remain visible and
      usable without horizontal scrolling on a phone-width screen.
- [ ] Board squares stay large enough to comfortably tap with a finger on a
      small screen.
- [ ] The help page's diagrams and text remain readable and don't overflow
      on a phone-width screen.

## Depends on
#13
