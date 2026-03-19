# Games API

Backend for the Games tab. Keeps game state (which games exist, which are played) and adds new games when a batch is completed.

## Endpoints

- **GET /api/games** — Returns `{ games: [{ id, played }, ...] }`
- **POST /api/games/play** — Body: `{ gameId: number }`. Marks that game as played; if the current batch is all played, adds 2 new games (up to 50 total). Returns `{ games }`.
- **GET /api/health** — `{ ok: true, games: number }`

## Run locally

```bash
cd server
npm install
npm start
```

Server runs on port **3001** (or `PORT` env). The Vite app proxies `/api` to `http://localhost:3001` in development, so start both:

1. `cd server && npm start`
2. `cd app && npm run dev`

## Production

Set `VITE_API_URL` to your deployed API base URL (e.g. `https://api.yoursite.com`) when building the app, so the frontend calls the real backend instead of relative `/api`.
