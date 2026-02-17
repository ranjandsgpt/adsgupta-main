# Ads Gupta - AI Advertising Platform & Enterprise Command Center

## Original Problem Statement
Build the ultimate conversion tool for tools.adsgupta.com that looks like a $50M/year SaaS, featuring instant AI audits, multi-file cross-pollination, demo universe with 1,400+ data points, and 20 AI optimization agents.

## Deployment Architecture (Phase 9 - Production Ready)

### Primary Site: tools.adsgupta.com
- **Mode 1 (Default)**: Multi-File Instant Audit - File upload dropzone
- **Mode 2 (Future)**: API Connection - Live Data Syncing when SP-API connected
- **Environment**: `REACT_APP_SHOW_DEMO=false`

### Demo Site: demoai.adsgupta.com/amazon-audit
- Full AI Command Center with pre-loaded mock data
- 1,400+ simulated data points using 15-Year Optimizer Logic
- **Environment**: `REACT_APP_SHOW_DEMO=true`

### Cross-Domain Navigation
- **tools → demo**: "See the Full AI Demo Universe" link on audit page
- **demo → tools**: "Analyze Your Own Data" button in demo banner

### Environment Configuration
```
# Tools Domain (tools.adsgupta.com)
REACT_APP_SHOW_DEMO=false
REACT_APP_SITE_MODE=tools
REACT_APP_DEMO_DOMAIN=https://demoai.adsgupta.com
REACT_APP_TOOLS_DOMAIN=https://tools.adsgupta.com

# Demo Domain (demoai.adsgupta.com)
REACT_APP_SHOW_DEMO=true
REACT_APP_SITE_MODE=demo
REACT_APP_DEMO_DOMAIN=https://demoai.adsgupta.com
REACT_APP_TOOLS_DOMAIN=https://tools.adsgupta.com
```

## Routes

### Tools Domain (tools.adsgupta.com)
```
/ - Marketing Homepage
/audit - Multi-File Instant Audit (file upload)
/analysis - Deep Analysis Report (20 AI agents)
/multi-vault - Multi-File Staging Area
/neural-map - Marketplace Neural Map with Recursive Optimizer
/dashboard - Amazon Seller Dashboard (requires login)
/internal-demo - Demo Universe (hidden, only if SHOW_DEMO=true)
/blog, /aboutme, /contact, /privacy, /terms
```

### Demo Domain (demoai.adsgupta.com)
```
/ - Redirects to /amazon-audit
/amazon-audit - Demo Universe with pre-loaded mock data
/internal-demo - Demo Universe (alias)
/audit - Instant Audit (allows comparison)
```

## Features Implemented

### Phase 1-8 (Previous)
- [x] Landing page with kinetic typography
- [x] Multi-page ecosystem with marketing pages
- [x] JWT + Google OAuth authentication
- [x] Instant AI Audit (single file → /analysis)
- [x] Multi-File Cross-Pollination (/multi-vault → /neural-map)
- [x] 20 AI Optimization Agents
- [x] Cross-Pollination Insights engine
- [x] Lead Capture to MongoDB
- [x] Demo Universe modularization

### Phase 9 - Production Deployment Ready (Feb 2026) - COMPLETE
- [x] Dual-domain routing architecture
- [x] Cross-domain navigation links with external icons
- [x] Environment-based build configuration
- [x] Build scripts for tools and demo domains
- [x] React 19 compatible Helmet SEO implementation
- [x] Responsive Neural Map buttons (mobile truncation)
- [x] AI Agent Sidebar conditional rendering fix
- [x] CORS configuration for both domains
- [x] Lead Capture active on both domains

## Build Scripts

### For tools.adsgupta.com
```bash
/app/frontend/scripts/build-tools.sh
```

### For demoai.adsgupta.com
```bash
/app/frontend/scripts/build-demo.sh
```

## File Structure
```
/app/frontend/src/
├── modules/
│   └── demo-universe/
│       ├── DemoUniversePage.jsx (with cross-domain link)
│       ├── data/
│       │   └── mockDataGenerators.js (1,400+ data points)
│       └── store/
│           └── demoStore.js (isolated state)
├── components/
│   ├── AIAgentSidebar.jsx (conditionally rendered)
│   ├── SyncStatusBar.jsx
│   └── ...
├── pages/
│   ├── InstantAuditPage.jsx (with demo universe link)
│   ├── NeuralMapPage.jsx (responsive buttons)
│   ├── MultiVaultPage.jsx
│   ├── AnalysisPage.jsx
│   └── ...
├── store/
│   ├── dataStore.js (real data)
│   └── multiFileStore.js (multi-file data)
├── scripts/
│   ├── build-tools.sh
│   └── build-demo.sh
├── .env.tools (production config)
└── .env.demo (demo config)
```

## API Endpoints

### Lead Capture
- POST /api/leads/capture - Save email with source tracking
- GET /api/leads/count - Get total lead count

### Authentication  
- POST /api/auth/register, /api/auth/login
- GET /api/auth/google/login

### Amazon SP-API (Prepared)
- GET /api/amazon/connect
- GET /api/amazon/callback
- GET /api/amazon/status
- POST /api/amazon/disconnect

## Test Results (Phase 9)
- Backend: 100% pass rate (11/11 tests)
- Frontend: 100% pass rate
- Cross-domain links: Verified
- Responsive design: Verified at 375px mobile
- Lead capture: End-to-end verified

## What's MOCKED
- Demo Universe 1,400+ data points (intentional)
- Amazon SP-API integration (planned for future)
- "Run 1,000 Simulations" results (placeholder)
- Email delivery for "Email My Audit" (stores in DB only)

## What's REAL
- All file parsing and analysis
- Cross-pollination calculations
- Lead capture to MongoDB
- State isolation between demo and real data
- Cross-domain navigation

## Next Steps (Backlog)

### P0 - Ready for Deploy
- Deploy tools domain to tools.adsgupta.com
- Deploy demo domain to demoai.adsgupta.com

### P1 - Feature Enhancements
1. Implement "Live Data Syncing" UI for SP-API connected users
2. Build "Recursive Optimizer" logic (1,000 simulations)
3. Enhance Neural Map with Force-Directed Graph
4. Add "Smart Suggest" AI button for charts

### P2 - Infrastructure
1. Full Amazon SP-API backend integration
2. PostgreSQL migration
3. Stripe payment integration
4. Email service for "Email My Audit"
5. Activate Neural Oracle Chatbot
