# Ads Gupta - AI Advertising Platform & Enterprise Command Center

## Original Problem Statement
Build the ultimate conversion tool for tools.adsgupta.com that looks like a $50M/year SaaS, featuring instant AI audits, multi-file cross-pollination, demo universe with 1,400+ data points, and 20 AI optimization agents.

## Deployment Architecture

### Primary Site: tools.adsgupta.com
- **Mode 1 (Default)**: Instant Analysis - File upload landing page
- **Mode 2 (Upgrade)**: API Connection - Live Data Syncing status bar

### Demo Universe: /internal-demo
- Hidden internal route (not deployed to demoai.adsgupta.com)
- Fully isolated data store
- 1,400+ simulated data points
- Accessible via sidebar link "See the Future of AdsGupta"

### Environment Configuration
```
REACT_APP_SHOW_DEMO=true       # Toggle demo visibility
REACT_APP_SITE_MODE=tools      # tools | marketing
REACT_APP_BACKEND_URL=...      # API endpoint
```

## Routes
```
/ - Instant AI Audit (default for tools.adsgupta.com)
/audit - Instant AI Audit (alias)
/analysis - Deep Analysis Report (20 AI agents)
/multi-vault - Multi-File Cross-Pollination Upload
/neural-map - Marketplace Neural Map
/dashboard - Amazon Seller Dashboard (requires login)
/internal-demo - Demo Universe (hidden, REACT_APP_SHOW_DEMO=true)
/demo - Legacy demo page
/home - Marketing homepage
/blog, /aboutme, /contact, /privacy, /terms
```

## Database Schema (MongoDB → PostgreSQL-ready)

### Data Source Differentiation
1. **file_uploads** (temporary, browser-side)
   - session_id, file_name, report_type, headers
   - expires_at: 24 hours TTL
   - source: 'browser'

2. **api_sync_data** (permanent, server-side)
   - user_id, seller_id, marketplace_id
   - report_type, data, synced_at, next_sync
   - source: 'sp-api'

3. **amazon_credentials** (encrypted)
   - user_id, seller_id, refresh_token_encrypted
   - sync_status, sync_frequency, enabled_reports

4. **seller_kpis** (pre-computed)
   - user_id, period, kpis (aggregated metrics)
   - source: 'computed'

## Features Implemented

### Phase 1-7 (Previous)
- [x] Landing page with kinetic typography
- [x] Multi-page ecosystem
- [x] JWT + Google OAuth authentication
- [x] Instant AI Audit (/audit → /analysis)
- [x] 20 AI Optimization Agents
- [x] Multi-File Cross-Pollination (/multi-vault → /neural-map)
- [x] Cross-Pollination Insights
- [x] Lead Capture to MongoDB

### Phase 8 - Deployment Refactoring (Feb 2026) - COMPLETE

#### 1. Tools Domain Configuration
- [x] Homepage redirects to /audit (Instant Analysis)
- [x] SEO meta tags for tools.adsgupta.com
- [x] "AdsGupta Tools: Instant Amazon Audit & API Growth Command Center"

#### 2. Demo Universe Modularization
- [x] Created /modules/demo-universe directory
- [x] Isolated demoStore.js (separate storage key)
- [x] mockDataGenerators.js with 1,400+ data points
- [x] DemoUniversePage.jsx as standalone module
- [x] Hidden route: /internal-demo
- [x] REACT_APP_SHOW_DEMO environment toggle

#### 3. State Isolation
- [x] useDataStore - Real uploaded data
- [x] useMultiFileStore - Multi-file data
- [x] useDemoStore - Demo mock data (ISOLATED)
- [x] Different sessionStorage keys prevent data mixing

#### 4. API Connection Infrastructure
- [x] SyncStatusBar.jsx component
- [x] Database schema design for file_upload vs api_sync
- [x] PostgreSQL migration schema prepared

#### 5. Lead Capture & Transition
- [x] "Email My Audit" active on tools domain
- [x] "See the Future of AdsGupta" link in AI Agent sidebar
- [x] Links to /internal-demo

## File Structure
```
/app/frontend/src/
├── modules/
│   └── demo-universe/
│       ├── DemoUniversePage.jsx
│       ├── data/
│       │   └── mockDataGenerators.js
│       └── store/
│           └── demoStore.js
├── components/
│   ├── SyncStatusBar.jsx (NEW)
│   ├── AIAgentSidebar.jsx (Updated with demo link)
│   └── ...
├── store/
│   ├── dataStore.js (real data)
│   └── multiFileStore.js (multi-file data)
└── pages/
    ├── InstantAuditPage.jsx
    ├── AnalysisPage.jsx
    ├── MultiVaultPage.jsx
    ├── NeuralMapPage.jsx
    └── ...
```

## API Endpoints

### Lead Capture
- POST /api/leads/capture
- GET /api/leads/count

### Authentication  
- POST /api/auth/register, /api/auth/login
- GET /api/auth/google/login

### Amazon SP-API (Prepared)
- GET /api/amazon/connect
- GET /api/amazon/callback
- GET /api/amazon/status
- POST /api/amazon/disconnect

## Test Results
- Backend: 100% pass rate
- Frontend: All features verified
- Demo Universe: Isolated and functional

## What's MOCKED
- Amazon SP-API (requires LWA credentials)
- Demo Universe 1,400+ data points
- Recursive Optimizer "1,000 simulations"

## What's REAL
- All file parsing and analysis
- Cross-pollination calculations
- Lead capture to MongoDB
- State isolation between demo and real data

## Next Steps (Backlog)
1. Full Amazon SP-API backend integration
2. PostgreSQL migration
3. Stripe payment integration
4. Deploy to tools.adsgupta.com production
5. Eventually migrate Demo to demoai.adsgupta.com
