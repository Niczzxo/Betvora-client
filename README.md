# Betvora Client — Practice Frontend

A multi-file, casino-style frontend for exploring Betvora's 42 game interfaces. This is a play-money practice experience, not a production real-money casino. It does not process real deposits or withdrawals, and local results are not independently audited.

## Luxury visual finish (2026-10-31)

- Added a standalone visual layer in `css/casino-finish.css` with a dark emerald table palette, warm gold highlights, richer game stages, and refined lobby card and control states.
- Kept the existing per-game builders and animations, applying shared finish and responsive sizing across the game screens.
- Respects reduced-motion preferences and the app's `no-motion` setting.
- This remains virtual-coin practice only; coins have no cash value and cannot be redeemed.

## Project structure

- `index.html` — app shell, navigation, lobby sections and footer
- `css/` — shared layout, lobby, game-stage, wallet and page styles
- `js/core.js` — local state, navigation, common utilities and shared game header
- `js/lobby.js` — game cards, category rows, search and session activity
- `js/pages.js` — account UI, promotions, information pages and support UI
- `js/wallet.js` — local practice balance and wallet UI
- `js/games-data.js` and `js/games/` — game registry and game-specific builders
- `js/init.js` — startup and event wiring

## Run locally

```bash
npm start
# open http://127.0.0.1:4173/
```

The Node.js server serves the frontend and the same-origin practice API. It uses only Node's built-in modules.

## Practice API

- `GET /api/health` — gateway health and practice mode.
- `GET /api/games` — the 42 games currently listed in the lobby and their availability.
- `GET /api/games/:id/config` — one game's practice configuration.
- `POST /api/sessions` with `{ "gameId": "dice" }` — create an ephemeral practice session.
- `GET /api/sessions/:sessionId` — read session metadata.
- `POST /api/sessions/:sessionId/events` — record a client-reported practice round event.

The browser sends game-open, stake and round-result events through the API client. Game outcomes and the play balance remain local to the browser; event reports are not independently verified and are not a financial ledger. API sessions are held in memory and expire after two hours. This API has no deposit, withdrawal, transfer, or redemption routes. Virtual coins have no cash value.

The public lobby registry lives in `api/games.json`. Set a game's `status` to `maintenance` to prevent it opening when the API is available. When the API is offline, the practice frontend continues in its local-only mode.

## Deploy to GitHub Pages

Push the project contents to the repository's `main` branch, then enable GitHub Pages from `Settings → Pages → Deploy from branch → main → /(root)`.

## Latest UI polish pass

- Replaced the repeated large artwork banner inside game stages with a compact game-specific header to reduce duplicated/misaligned art.
- Removed unverified RTP and SHA-256/Provably Fair claims from the shared game header.
- Added restrained game-stage styling, better responsive sizing, card-deal/reel/character motion hooks and reduced decorative particle intensity.
- Removed fabricated animated jackpot/player/payout counters.
- Recent activity tables now show current-browser-session practice rounds instead of randomly generated player bets.
- Replaced visible “demo” labels with practice-oriented copy and kept a clear play-money/no-real-money disclosure.
- Corrected preview cards so unconnected live-style games are labelled as previews rather than “LIVE”.
- Verified that the 42 registered game IDs each have a corresponding game builder, checked JavaScript syntax, and checked CSS brace balance.

## Known limitations

- This remains a frontend practice build. Authentication, balances, bonuses, leaderboards and game outcomes are not backed by a production server.
- Real cross-user live activity requires a backend and real event data; the site must not imply that simulated activity is genuine.
- This source pass received static code validation, but a full browser-based visual regression test across all 42 games and mobile breakpoints has not been completed. Individual avatar placement, movement and every game-specific animation still need manual browser verification.

## Gameplay reliability repair pass (2026-10-20)

- Added per-game timeout, interval and animation-frame cleanup for all 59 registered builder functions, preventing stale animation callbacks from mutating a newly opened game screen.
- Corrected Chicken crossing positions so the character remains inside the board at the start, lane centers and finish.
- Rebuilt Moles target waves so visible moles spawn immediately, target holes are interactive, hits/bombs have distinct feedback, and round state resets cleanly.
- Added a persistent Plinko last-drop result panel and reset it when the row count changes.
- Improved Crash curve scaling and kept the rocket marker visible at the curve head and crash point.
- Fixed Crash Rocket crash/reset states and impact feedback.
- Made Dragon Tower's focused floor scroll calculation relative to its own viewport.
- Added target pulse, mole bob, case idle glow and Chicken finish feedback styles.

### Validation performed

- `node --check` passed for all top-level and game JavaScript files.
- Registry audit: all 42 game IDs have a matching builder. There are 17 extra builders not currently listed in the 42-game registry.
- Browser visual regression could not be completed in this environment because Chromium navigation was blocked by the execution environment. Please run the project locally and check the interaction flows in the README instructions before deployment.

