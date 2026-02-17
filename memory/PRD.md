# Ads Gupta - AI Advertising Platform & Amazon Seller Dashboard

## Original Problem Statement
Build a production-ready AI Dashboard for tools.adsgupta.com with Amazon SP-API integration, multi-tenancy authentication, and AI-powered analytics.

## Architecture

### Frontend
- **Framework**: React with React Router
- **Styling**: Tailwind CSS with custom dark theme (#121212 / Deep Blue)
- **Animations**: Framer Motion
- **Components**: Glassmorphic cards, KPI cards, Auth modal, AI Insights panel

### Backend
- **Framework**: FastAPI
- **Database**: MongoDB with structured collections
- **Authentication**: JWT (email/password) + Google OAuth (Emergent Auth)
- **AI Integration**: Gemini 3 Flash via emergentintegrations
- **Background Worker**: Async task for polling Amazon Reports API

### Routes Structure
```
/ - Homepage
/blog - Blog page
/aboutme - About page with Founders' Circle
/contact - Contact form
/privacy - Privacy policy
/terms - Terms of service
/marketplacesolutions - Marketplace Intel page (with Seller Dashboard card at bottom)
/dashboard - Amazon Seller Analytics Dashboard (auth-gated)
/supply - Neural Supply Protocol
/demand - Universal Demand Engine
/tools - The Lab (Web Tools)
```

## Core Features Implemented

### Phase 1-5 (Previous) - Landing Page & Multi-Page Ecosystem
- [x] Landing page with kinetic typography hero
- [x] 6-card Hub grid with protocol badges
- [x] Dedicated solution pages (/marketplacesolutions, /supply, /demand)
- [x] Neural Oracle chatbot
- [x] Blog, About, Contact, Privacy, Terms pages
- [x] Founders' Circle on About page
- [x] Mobile responsive design

### Phase 6 (Current) - Amazon Seller Dashboard
- [x] **Authentication System**
  - JWT email/password registration & login
  - Google OAuth via Emergent Auth
  - Session management with httpOnly cookies
  - Protected routes & auth middleware

- [x] **Amazon SP-API Integration**
  - Website Authorization Workflow (OAuth 2.0)
  - Token exchange (spapi_oauth_code → refresh_token)
  - Access token refresh mechanism
  - Connection status indicator (Connected/Needs Re-auth)
  - Redirect URI display for Amazon Developer Console

- [x] **Dashboard KPIs (8 Cards)**
  - Total Sales, Sessions, Conversion Rate, Buy Box %
  - PPC Spend, ACOS, TACOS, ROAS
  - Financial Summary (Revenue, Fees, Refunds, Net Profit)
  - Period selector (7d, 30d, 90d)

- [x] **AI Insights Engine**
  - Gemini 3 Flash integration
  - Automated analysis of metrics
  - Actionable recommendations
  - Insights history

- [x] **Data Engine (MongoDB Schema)**
  - Users collection with custom user_id
  - Amazon Sellers collection with encrypted tokens
  - Report Requests tracking
  - Sales/Traffic Metrics
  - Settlement Metrics
  - Sponsored Products Metrics

- [x] **Background Worker**
  - 4-hour polling interval
  - Report creation, status polling, downloading
  - Report parsing (Sales/Traffic, Settlement, Sponsored Products)
  - Metric aggregation

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register with email/password |
| POST | /api/auth/login | Login with email/password |
| POST | /api/auth/session | Exchange Emergent session_id |
| GET | /api/auth/me | Get current user |
| POST | /api/auth/logout | Logout |

### Amazon SP-API
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/amazon/connect | Start OAuth flow |
| GET | /api/amazon/callback | OAuth callback |
| GET | /api/amazon/status | Get connection status |
| POST | /api/amazon/disconnect | Disconnect account |
| POST | /api/amazon/refresh-token | Refresh access token |
| POST | /api/amazon/fetch-reports | Trigger report fetch |
| GET | /api/amazon/reports | List report requests |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/kpis | Get aggregated KPIs |
| GET | /api/dashboard/sales-by-date | Daily sales data |
| GET | /api/dashboard/ppc-by-date | Daily PPC data |
| GET | /api/dashboard/top-products | Top performing products |

### AI Insights
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/insights | Generate AI insights |
| GET | /api/ai/insights/latest | Get latest insight |
| GET | /api/ai/insights/history | Get insights history |

## Database Collections

### users
```javascript
{
  user_id: "user_xxx",
  email: "string",
  name: "string",
  picture: "string",
  auth_provider: "jwt" | "google",
  password_hash: "string" | null,
  created_at: ISODate,
  updated_at: ISODate
}
```

### amazon_sellers
```javascript
{
  seller_id: "seller_xxx",
  user_id: "user_xxx",
  selling_partner_id: "string",
  marketplace_id: "ATVPDKIKX0DER",
  refresh_token: "encrypted",
  access_token: "string",
  access_token_expires_at: ISODate,
  connection_status: "connected" | "needs_reauth" | "pending",
  last_sync_at: ISODate
}
```

### sales_traffic_metrics / settlement_metrics / sponsored_products_metrics
- Detailed metric storage from Amazon reports
- Indexed by seller_id and date for fast aggregation

## Environment Variables

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=test_database
JWT_SECRET=your-secret-key
EMERGENT_LLM_KEY=sk-emergent-xxx
LWA_CLIENT_ID=amzn1.application-xxx (required for Amazon)
LWA_CLIENT_SECRET=xxx (required for Amazon)
BACKEND_URL=https://your-domain.com
FRONTEND_URL=https://your-domain.com
```

## Test Results (Feb 2026)
- Backend: 21/21 tests passed (100%)
- Frontend: All core features verified (100%)
- Test user: test@adsgupta.com / testpass123

## What's MOCKED
- Amazon SP-API connection (requires LWA credentials)
- Amazon Reports API polling (requires connected account)
- KPI data (shows zeros until Amazon connected)

## Prioritized Backlog
- P0: Add LWA credentials to enable full Amazon connection
- P1: Implement report data visualization (charts)
- P1: Add custom report builder (drag-and-drop metrics)
- P2: Multi-marketplace support (EU, FE regions)
- P2: Email notifications for critical metrics
- P3: Historical data comparison (period-over-period)

## Next Steps
1. User provides Amazon LWA credentials (Client ID, Client Secret)
2. Test full OAuth connection flow
3. Fetch and parse real Amazon reports
4. Display real KPI data on dashboard
5. Enable AI insights on real data
