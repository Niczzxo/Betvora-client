# Betvora Client — Practice Frontend

A multi-file, casino-style frontend for exploring Betvora's 42 game interfaces. This is a play-money practice experience, not a production real-money casino. It does not process real deposits or withdrawals, and local results are not independently audited.

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
python3 -m http.server 8000
# open http://localhost:8000/
```

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
