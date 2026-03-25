# MDE Exchange (apps/exchange)

MDE Exchange is a real-time ad exchange running OpenRTB 2.6 auctions. Publishers embed `mde.js` via a tag to monetize inventory, and advertisers create campaigns and creatives via the demand self-serve portal.

## Architecture overview

Key pieces:
- **Publisher side**: `mde.js` defines ad slots, calls the OpenRTB auction endpoint, and renders the winning creative.
- **Auction & delivery**: `/api/openrtb/auction` runs eligibility + second-price clearing and inserts into `auction_log` / `impressions`.
- **Win / impression tracking**:
  - Win notice: `/api/openrtb/win`
  - Impression pixel: `/api/track/impression`
- **Admin**: `/admin/*` dashboards backed by authenticated API endpoints.
- **Demand**: `/demand/*` routes for campaign + creative management.

## How to run locally

From repo root:

```bash
npx turbo run dev --filter=exchange
```

Then open:
- `http://localhost:3000/` (exchange homepage)
- `http://localhost:3000/publisher` (publisher landing)
- `http://localhost:3000/demand` (demand landing)

## Environment variables

You will need at minimum:
- `NEXTAUTH_SECRET`
- `DB_INIT_SECRET`
- Exchange credentials for NextAuth (admin/publisher/demand)

Examples (not exhaustive):
- `EXCHANGE_ADMIN_EMAIL`, `EXCHANGE_ADMIN_PASSWORD`
- `EXCHANGE_PUBLISHER_EMAIL`, `EXCHANGE_PUBLISHER_PASSWORD`, `EXCHANGE_PUBLISHER_ID`
- `EXCHANGE_DEMAND_EMAIL`, `EXCHANGE_DEMAND_PASSWORD`, `EXCHANGE_DEMAND_ADVERTISER`

If you use multi-admin:
- `EXCHANGE_ADMIN_1_EMAIL` ... `EXCHANGE_ADMIN_5_EMAIL`
- `EXCHANGE_ADMIN_1_PASSWORD` ... `EXCHANGE_ADMIN_5_PASSWORD`
- `EXCHANGE_ADMIN_1_ROLE` ... `EXCHANGE_ADMIN_5_ROLE` (`admin|ops|viewer`)

## How to run db-init

```bash
curl "http://localhost:3000/api/db-init?secret=$DB_INIT_SECRET"
```

## How to run the e2e integration test

After `db-init`, run:

```bash
curl "http://localhost:3000/api/test/e2e?secret=$DB_INIT_SECRET"
```

You can also open the admin runner:
- `/admin/test`

## API endpoint list (high level)

- Auctions:
  - `POST /api/openrtb/auction`
  - `GET /api/openrtb/win`
  - `GET /api/track/impression`
  - `GET /api/track/click`
- Public stats:
  - `GET /api/public/stats`
  - `GET /api/public/bid-estimate`
- Admin / reporting:
  - `GET /api/reports/dashboard`
  - `GET /api/auction-log`
- Demand / creative management:
  - `POST /api/campaigns`, `PATCH /api/campaigns/:id`
  - `POST /api/creatives`, `PATCH /api/creatives/:id`

## Publisher integration guide (quick version)

1. Register as publisher.
2. Wait for activation.
3. Create an ad unit in the publisher portal.
4. Copy the `mde.js` tag + slot definition.
5. Paste into your HTML where the ad should render.

## Advertiser guide (quick version)

1. Create a campaign with targeting + bid CPM.
2. Upload creatives (JPG/PNG/WebP, max 2MB).
3. Set bid/budget and wait for activation.
4. Monitor results in the demand dashboard.

