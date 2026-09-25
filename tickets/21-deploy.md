# #21: Deploy to a public CDN

Status: in progress

## Goal
The game is reachable by anyone at a public URL, served from free static
hosting — which is what actually lets it scale to millions of users, since
everything runs client-side with no backend.

The current game was deployed early (before the AI/PWA work) so every later
ticket can be tested on the real URL. The last bullets are re-verified at
the end, once those features exist.

## Done when
- [x] Static hosting (GitHub Pages, branch `master`, root) is enabled on the
      `Berofayez/checkers` repo: https://berofayez.github.io/checkers/
- [x] The live URL loads the game and the Help page, and its assets resolve
      under the `/checkers/` subpath.
- [x] The README is updated with the live URL.
- [x] A normal `git push` to `master` updates the live site without any
      manual redeploy step.
- [ ] Re-verified from the live URL at the end: playing vs the computer at
      all three difficulty levels, and PWA install and offline reload.

## Depends on
#17
#20
