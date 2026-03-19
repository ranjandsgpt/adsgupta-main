# Prebid GAM API

Automates full Prebid line item setup in Google Ad Manager (GAM) using OAuth and the GAM API.

## Features

- **Connect GAM** via Google OAuth (enter Network Code, grant access)
- **Configuration form**: Advertiser, Order, Line item base name, Creative name, Prebid keys (bidder code, KVP key, hb_adid, hb_format), CPM min/max and granularity, ad sizes, currency, priority, timezone, targeting type
- **CPM preview table**: See all line item price buckets before generating
- **Generate Setup**: Creates Advertiser → Order → Line items (per CPM bucket) → Prebid Universal Creative → attaches creative to each line item; applies KVP targeting
- **Dry run mode**: Preview what would be created without pushing to GAM (uses stub client)
- **Execution log**: View past runs; **Download CSV** summary
- **Bidder-agnostic**: No hardcoded bidders; works for any Prebid adapter (inmobi, appnexus, etc.)

## Tech stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS
- **Backend**: Next.js API routes (Node.js), Google OAuth2, GAM API (SOAP)
- **Database**: PostgreSQL (Prisma) — stores GAM connection tokens and execution logs

## Setup

### 1. Environment

```bash
cd monetization/prebid-gam-api
cp .env.example .env
```

Edit `.env`:

- **GOOGLE_CLIENT_ID** / **GOOGLE_CLIENT_SECRET**: From GCP (see below). Do not commit these; keep them in `.env` only.
- **NEXTAUTH_URL** / **BASE_URL**: e.g. `http://localhost:3001` for local.
- **DATABASE_URL**: PostgreSQL connection string, e.g. `postgresql://user:password@localhost:5432/prebid_gam`.

**GCP OAuth (Web application)** — [Ad Manager API authentication](https://developers.google.com/ad-manager/api/authentication):

1. In [Google Cloud Console](https://console.cloud.google.com/apis/credentials), create a project (or pick one), then **Create credentials** → **OAuth client ID**.
2. If prompted, configure the OAuth consent screen (e.g. External, app name, your email).
3. Application type: **Web application**. Add authorized redirect URI:  
   `http://localhost:3001/api/auth/gam/callback`  
   (for production, add your production callback URL too).
4. Copy the **Client ID** and **Client secret** into `.env` as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
5. Enable the **Google Ad Manager API** for the project (APIs & Services → Enable APIs).
6. In your GAM network: **Admin** → ensure **API access** is enabled (no extra step needed for web app flow; users authorize when they click “Connect via Google OAuth”).

The app uses the single Ad Manager scope: `https://www.googleapis.com/auth/dfp`.

### 2. Database

```bash
npm install
npx prisma generate
npx prisma db push
```

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

### 4. Link from portfolio (optional)

The main portfolio’s AdTech Control Center can add a tab **Prebid GAM API** that links to `http://localhost:3001` (or your deployed URL) so you open the tool from the same place as the Ad Tag tab.

## Owner setup (deployment for end users)

If you want **real end users** to use the Prebid GAM API from your portfolio (e.g. AdTech Control Center), you deploy this app once and point the portfolio at it. End users never see or set any URL; they only connect their GAM and run setup.

### Step 1: Deploy the Prebid GAM API app

1. **Hosting**: Deploy `monetization/prebid-gam-api` to a host that supports Node.js (e.g. **Vercel**).
2. **Vercel**: In the dashboard, **Add New** → **Project** → import the same repo.
   - Set **Root Directory** to `monetization/prebid-gam-api`.
   - Build command: `npm run build` (or leave default). Output directory: `.next`.
   - Install command: `npm install`.
3. Note your deployment URL, e.g. `https://prebid-gam-api-xyz.vercel.app`.

### Step 2: Environment variables (deployed app)

In your deployment project (e.g. Vercel → Project → Settings → Environment Variables), set:

| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | OAuth client ID from GCP (Web application) |
| `GOOGLE_CLIENT_SECRET` | OAuth client secret from GCP |
| `BASE_URL` | Your deployed app URL, e.g. `https://prebid-gam-api-xyz.vercel.app` |
| `NEXTAUTH_URL` | Same as `BASE_URL` (or leave unset if not using NextAuth elsewhere) |
| `DATABASE_URL` | PostgreSQL connection string (e.g. Vercel Postgres or any hosted Postgres) |

Do **not** commit these; keep them only in the deployment environment.

### Step 3: GCP OAuth redirect URI (production)

1. Open [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → your project → your **OAuth 2.0 Client ID** (Web application).
2. Under **Authorized redirect URIs**, add:  
   `https://YOUR-DEPLOYMENT-URL/api/auth/gam/callback`  
   Example: `https://prebid-gam-api-xyz.vercel.app/api/auth/gam/callback`.
3. Save. Ensure **Google Ad Manager API** is enabled for the project.

### Step 4: Database (production)

Use a PostgreSQL instance reachable from your deployment (e.g. Vercel Postgres, Neon, Supabase). Run migrations from your machine or CI:

```bash
cd monetization/prebid-gam-api
DATABASE_URL="postgresql://..." npx prisma db push
```

(Or use `prisma migrate deploy` if you use migrations.)

### Step 5: Point the portfolio at the deployed app

In the **portfolio** repo (the one that contains `index.html`):

1. Open `index.html` and find the Prebid GAM tab pane (e.g. search for `pane-prebid-gam` or `data-prebid-gam-url`).
2. On the pane `<div>`, set the deployed app URL:
   ```html
   <div class="dev-tab-pane" id="pane-prebid-gam" data-prebid-gam-url="https://prebid-gam-api-xyz.vercel.app">
   ```
   Use your real deployment URL (no trailing slash). The comment above the pane reminds you: *"Site owner: set data-prebid-gam-url to your deployed Prebid GAM API app URL…"*
3. Save and deploy the portfolio as usual.

After this, when users open the AdTech Control Center and the **Prebid GAM API** tab, they will see the embedded app (or "Open in new tab"). They do **not** see or enter any URL; they only enter their GAM Network Code, connect via Google OAuth, and run setup.

## Usage

1. **Connect GAM**: Enter your GAM Network Code and click “Connect via Google OAuth”. Sign in and grant access.
2. **Configuration**: Fill Basic Info (Advertiser name, Order name, line item base name, creative name base), Prebid config (bidder code, KVP key name, hb keys, granularity, CPM min/max, ad sizes), and Advanced (currency, priority, timezone, targeting type).
3. **CPM preview**: Check the table to see how many line items will be created (e.g. 0.10 to 20.00 with 0.10 granularity = 200 items).
4. **Dry run** (optional): Check “Dry run” and click **Generate Setup** to simulate without creating anything in GAM.
5. **Generate Setup**: Click **Generate Setup** to create Advertiser, Order, Line items (one per CPM bucket), one Prebid Universal Creative, and attach the creative to each line item with KVP targeting.
6. **Logs**: View execution log and use **Download CSV** to export.

## GAM API (live mode)

The live GAM integration uses the **Google Ad Manager SOAP API** (v202511). The codebase includes:

- `src/lib/gam/client.ts`: Interface `IGamClient`, **GamClientStub** (dry runs), and **GamSoapClient** (live).
- `src/lib/gam/soapClient.ts`: SOAP helpers for CompanyService, OrderService, LineItemService, CreativeService, and LineItemCreativeAssociationService. Uses OAuth Bearer token and RequestHeader (networkCode, applicationName). See [GAM API documentation](https://developers.google.com/ad-manager/api/start).

Use **Dry run** to validate config and CPM buckets without touching GAM; uncheck **Dry run** and click **Generate Setup** to create advertisers, orders, line items, and creatives in the user’s GAM network.

## Project structure

```
monetization/prebid-gam-api/
  src/
    app/            # App Router: layout, page, globals.css
    app/api/        # API routes: auth/gam (connect, callback), setup, logs, cpm-preview
    components/     # ConnectGam, ConfigForm, CpmPreview, LogViewer
    lib/            # db (Prisma), gam (types, client)
    services/       # setupEngine (runPrebidGamSetup)
    utils/          # cpmBuckets, universalCreative
    types/          # shared types and AD_SIZES
  prisma/
    schema.prisma   # GamConnection, ExecutionLog
```

## Performance

- Handles large CPM ranges (e.g. 500 line items). For very large runs, consider adding async job processing and a progress bar (optional v2).

## License

Same as parent project.
