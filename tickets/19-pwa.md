# #19: Progressive Web App (PWA)

Status: not started

## Goal
The responsive page can be installed to a phone's home screen with an icon
and keeps working largely offline after the first visit — still plain web
technology, no native app, no new toolchain.

## Done when
- [ ] A `manifest.json` (name, icon(s), theme color, `display: standalone`)
      is linked from `index.html`.
- [ ] A service worker caches the game's static assets (`index.html`,
      `script.js`, `engine.js`, `ai.js`, `weights.js`, `style.css`,
      `help.html`,
      and the manifest icons) on first visit.
- [ ] The manifest and service worker use relative paths (`./`), not
      root-absolute ones, because GitHub Pages serves this repo under the
      `/checkers/` subpath rather than the domain root.
- [ ] After a first visit online, opening the game again with no network
      connection still loads and is fully playable, including against the
      computer (its `weights.js` is cached too).
- [ ] A mobile browser recognizes the page as installable (e.g. offers "Add
      to Home Screen"), and the installed icon/name match the manifest.
- [ ] The service worker doesn't serve stale files forever — there's a
      simple way for a new deploy to be picked up (e.g. a cache-version
      bump) rather than users being stuck on a cached old version
      indefinitely.

## Depends on
#18
