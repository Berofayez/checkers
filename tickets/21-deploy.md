# #21: Deploy to a public CDN

Status: not started

## Goal
The game is reachable by anyone at a public URL, served from free static
hosting — which is what actually lets it scale to millions of users, since
everything runs client-side with no backend.

## Done when
- [ ] Static hosting (e.g. GitHub Pages) is enabled on the `Berofayez/checkers`
      repo.
- [ ] The live URL loads the game, is fully playable (human vs human and
      vs computer), and the Help page and PWA install both work from the
      deployed URL, not just locally.
- [ ] The README is updated with the live URL.
- [ ] A normal `git push` to the main branch updates the live site without
      any manual redeploy step.

## Depends on
#17
#20
