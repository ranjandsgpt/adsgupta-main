import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: true }));
app.use(express.json());

const MAX_GAMES = 50;
const BATCH_SIZE = 2;

function getCurrentBatch(games) {
  if (games.length <= 1) return games;
  return games.slice(-BATCH_SIZE);
}

function allBatchPlayed(games) {
  const batch = getCurrentBatch(games);
  return batch.length > 0 && batch.every((g) => g.played);
}

function addNextBatch(games) {
  if (games.length >= MAX_GAMES) return games;
  const toAdd = Math.min(BATCH_SIZE, MAX_GAMES - games.length);
  const nextId = games.length + 1;
  const newGames = Array.from({ length: toAdd }, (_, i) => ({
    id: nextId + i,
    played: false,
  }));
  return [...games, ...newGames];
}

// In-memory state (replace with DB/file for persistence across restarts)
let games = [{ id: 1, played: false }];

// GET /api/games — list all games
app.get('/api/games', (req, res) => {
  res.json({ games: [...games] });
});

// POST /api/games/play — mark a game as played; may add new games
app.post('/api/games/play', (req, res) => {
  const { gameId } = req.body;
  const id = typeof gameId === 'number' ? gameId : parseInt(gameId, 10);
  if (Number.isNaN(id) || id < 1) {
    return res.status(400).json({ error: 'Invalid gameId' });
  }
  const idx = games.findIndex((g) => g.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: 'Game not found' });
  }
  games[idx] = { ...games[idx], played: true };
  if (allBatchPlayed(games)) {
    games = addNextBatch(games);
  }
  res.json({ games: [...games] });
});

// Health check for deployments
app.get('/api/health', (req, res) => {
  res.json({ ok: true, games: games.length });
});

app.listen(PORT, () => {
  console.log(`Games API running at http://localhost:${PORT}`);
});
