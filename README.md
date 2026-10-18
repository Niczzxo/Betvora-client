# Betvora — Client (Frontend)

Betvora casino-style gaming site — **front-end demo**.

## What this is
A static single-page site (`index.html`, fully self-contained — all images are
inlined as data URIs, no build step, no backend). It ships:

- Lobby with hero carousel, jackpot tickers, live-bets feed, search
- 32 playable demo games (Dice, Crash, Roulette, Plinko, Mines, Slots,
  Blackjack, Baccarat, Limbo, Keno, Hilo, Dragon Tower, Wheel, Diamonds,
  Video Poker, and more)
- Register/login (demo), wallet with simulated crypto deposit
  (QR code + address + 30-minute timer) and a 2x turnover rule before withdrawal
- Promotions, VIP club, Rewards, Leaderboard, My Bets, profile, settings

## Important
This is a **front-end demo with play money only** — balances are session-only,
deposits are simulated, and there are no real payments, accounts, or backend
services. Nothing here handles real money.

## Run it
Open `index.html` in any modern browser, or serve the folder statically.
For GitHub Pages: Settings → Pages → Deploy from branch → `main` → `/(root)`.

## Backend
Server/API work lives in the separate `Betvora-server` repository.
