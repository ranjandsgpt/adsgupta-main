# AdsGupta Exchange — OpenRTB 2.6 Micro-Exchange

Real-time ad exchange: `/ad-request` (publisher tag), `/beacon` (tracking), `/status` (health), `/api/auctions`, `/api/analytics/overview`, `/api/health`.

## Quick start

```bash
# Install and build
npm install && npm run build

# Terminal 1: start test bidder (simulated DSP)
npm run dev:test-bidder   # port 3002

# Terminal 2: start exchange
npm run dev               # port 3001
```

Then open the [dashboard](../dashboard) (`npm run dev` in `dashboard/`) at http://localhost:3000 and turn off "Demo mode" to see live auctions. Use a test page with the [publisher tag](../publisher-tag) to generate traffic.

## Docker

From repo root:

```bash
docker compose up -d
```

- Exchange: http://localhost:3001  
- Dashboard: http://localhost:3000  
- Test bidder: port 3002 (internal)

Set `DB_PASSWORD` and optional `EXCHANGE_API_KEY`, `NEXT_PUBLIC_EXCHANGE_API_URL` in `.env` or the environment.

## Database (optional)

With `DATABASE_URL` set, run:

```bash
npx prisma migrate dev
```

Auction logging to PostgreSQL can be wired in `AuctionEngine` deps and `registerBeaconRoute` when you need persistence.
