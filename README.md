# Betvora — Client (Frontend)

Professional casino-style gaming website — front-end demo with play money
(session-only balances, no real money). Split from the original single-file
build into a proper multi-file project structure.

## Project structure

```
Betvora-client/
├── index.html          # Shell: head (meta/title/fonts/favicon), header, sidebar,
│                       # main mount points, footer, <link>/<script> tags
├── css/
│   ├── base.css        # Variables, reset, typography, scrollbar, selection,
│   │                   # focus states, radius scale, keyframes, skeletons
│   ├── layout.css      # Header, navbar, sidebar, footer, overlays/modals/toasts,
│   │                   # drawer, bottom nav, view transitions
│   ├── lobby.css       # Hero carousel, stat tickers, game rows + tiles, banners,
│   │                   # offers strip, live-bets feed, atmosphere animations
│   ├── games.css       # Game stages, bet panels, cards, shared FX, game headers,
│   │                   # tile artwork
│   ├── wallet.css      # Wallet panel, deposit flow (address/QR/30-min timer),
│   │                   # withdraw + 2x turnover gate, transaction history
│   └── pages.css       # Profile, promotions, VIP club, leaderboard, auth modal,
│                       # settings, search, support chat, footer section pages
├── js/
│   ├── core.js         # State, utils, sfx, FX helpers, navigation/router, overlays,
│   │                   # site motion, splash, animated numbers  (loads FIRST)
│   ├── pages.js        # Auth, bonuses/VIP, profile, leaderboard, info modal,
│   │                   # footer pages, sidebar library, support, settings
│   ├── wallet.js       # Wallet + navbar rewards center
│   ├── lobby.js        # Browse rows, search, lobby grid, hero, tickers, category rows
│   ├── games-data.js   # Shared game shell: BUILDERS registry (loads BEFORE games/)
│   ├── games/
│   │   ├── games-1.js  # 26 newer game builders (BUILDERS.*)
│   │   ├── games-2.js  # 6 original game builders (dice, crash, roulette, plinko, mines, slots)
│   │   ├── games-3.js  # GAMES42 additions I: card & table games (Dragon Tiger, Teen Patti,
│   │   │               # Andar Bahar, Casino War, Red Dog, Texas Hold'em, Hold'em Table,
│   │   │               # Three Card Poker, Caribbean Stud, Pai Gow, Sic Bo, Lucky 7, Scratch Cards)
│   │   └── games-4.js  # GAMES42 additions II: slots & variants (Fruit/Mythic/Gemstone/Adventure
│                       # Slots, Baccarat Speed, Blackjack Classic, European/American Roulette,
│                       # Plinko Neon, Mines Gold, Crash Rocket, Limbo Turbo, Keno Deluxe, Mega Wheel)
│   └── init.js         # Boot sequence  (loads LAST)
└── README.md
```

Notes:

- Classic `<script src>` / `<link rel>` tags only — **no ES modules** — so the
  site works over both `file://` and `http(s)`.
- Execution order of the scripts reproduces the original single-file build
  exactly (`games-data.js` before `js/games/*`, `init.js` last).
- All artwork is inline SVG/CSS; the 11 photographic webp assets (hero,
  promos, 6 game tiles, logos) are embedded as data URIs directly where
  referenced (`index.html`, `js/core.js`, `js/lobby.js`, `js/pages.js`) —
  no external image requests and no binary files to push.
- Google Fonts is the only external request (gracefully degrades offline).

## Run locally

```bash
cd Betvora-client
python3 -m http.server 8000
# open http://localhost:8000/
```

Or open `index.html` directly in a browser (`file://` works).

## Deploy (GitHub Pages)

Push the contents of this directory to the repo's `main` branch, then enable
Pages: Settings → Pages → Deploy from branch → `main` → `/(root)`.

Live: https://niczzxo.github.io/Betvora-client/


## Visual update (October 2026)

- Refined game-card styling with consistent artwork proportions, category labels, clearer play affordances, and responsive sizing.
- Removed the extra logo medallion overlay on cards so it no longer obscures or conflicts with the game's artwork.
- Replaced hue-shifted duplicates in the New Games row with original SVG concept art generated for each preview title.
- Fixed the New Games row to reference valid game concepts instead of undefined registry IDs.
- The current source now exposes exactly 42 registered playable demo games. The New Games, Plinko, Mines and Crash Games rows use registered game IDs rather than coming-soon preview cards. All 42 entries have corresponding game builders in the existing source.
- This remains a play-money demonstration; there is no real-money wagering or verified real-player live activity.

## 42-game playable catalogue update (October 2026)

- Registered exactly 42 games in the public game catalogue.
- Added ten game entries with existing dedicated builders: Dragon Tiger, Teen Patti, Andar Bahar, Texas Hold’em, Sic Bo, Scratch Cards, Fruit Slots, Mythic Slots, European Roulette and Crash Rocket.
- Removed the other planned variants from the visible registry so the catalogue count remains exactly 42.
- Replaced “coming soon” previews in the primary New Games, Plinko, Mines and Crash Games rows with actual registered game entries.
- This is still a play-money frontend: game outcomes are local demo logic, and live activity is simulated rather than verified real-player data.

## Auth-aware lobby update (October 2026)

- Guest visitors can now use the search field, browse category listings, open game screens and try play-money demo rounds without registering.
- Wallet, profile and personal account tools remain member-only; the Promotions and VIP information pages can be browsed before login, while claim/account actions still request sign-in.
- The authenticated lobby displays a personalized welcome panel and session demo balance.
- Homepage statistics are explicitly labelled as demo values and the live activity table remains marked as simulated.
- Login/register is still a front-end demonstration using session state only. It is not a production authentication backend and does not process real payments or real-money wagers.
