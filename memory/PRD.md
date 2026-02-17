# Ads Gupta - AI Advertising Platform & Enterprise Command Center

## Original Problem Statement
Build the ultimate conversion tool for adsgupta.com that looks like a $50M/year SaaS, featuring instant AI audits, demo universe with 1,400+ data points, 20 AI optimization agents, and a hyper-advanced Multi-File Cross-Pollination Engine.

## Architecture

### Frontend
- **Framework**: React with React Router
- **Styling**: Tailwind CSS with premium dark theme (#050B18)
- **Charts**: Recharts for interactive data visualization
- **File Parsing**: PapaParser (CSV), SheetJS (XLSX)
- **State Management**: Zustand with sessionStorage persistence
- **Animations**: Framer Motion
- **PDF Export**: jsPDF + html2canvas

### Backend
- **Framework**: FastAPI
- **Database**: MongoDB
- **Authentication**: JWT + Google OAuth (Emergent Auth)
- **AI Integration**: Gemini 3 Flash via emergentintegrations
- **Background Worker**: Async task for Amazon Reports API polling

## Routes
```
/ - Homepage
/audit - Instant AI Audit (single file upload + analysis)
/analysis - Deep Analysis Report (20 AI agents results)
/multi-vault - Multi-File Cross-Pollination Upload (up to 10 files)
/neural-map - Marketplace Neural Map (cross-pollination visualization)
/demo - Demo Universe (1,400+ mock data points)
/dashboard - Amazon Seller Analytics Dashboard (auth-gated)
/marketplacesolutions - Marketplace Intel page
/supply - Neural Supply Protocol
/demand - Universal Demand Engine
/tools - The Lab (Web Tools)
/blog, /aboutme, /contact, /privacy, /terms
```

## Features Implemented

### Phase 1-5 (Previous) - Landing Page & Multi-Page Ecosystem
- [x] Landing page with kinetic typography hero
- [x] 6-card Hub grid with protocol badges
- [x] Dedicated solution pages
- [x] Neural Oracle chatbot
- [x] Founders' Circle, Blog, Contact pages

### Phase 6 - Amazon Seller Dashboard
- [x] JWT + Google OAuth authentication
- [x] Amazon SP-API OAuth flow (Website Authorization Workflow)
- [x] Dashboard KPIs (Sales, Sessions, Conversion, Buy Box%, PPC metrics)
- [x] AI Insights bar (Gemini 3 Flash)
- [x] Background worker for 4-hour report polling

### Phase 7 - Ultimate Conversion Tool ($50M SaaS)

#### 1. INSTANT AI AUDIT ENGINE (/audit) - COMPLETE
- [x] Glowing dropzone with drag-and-drop
- [x] CSV/XLSX file parsing (client-side, no server wait)
- [x] Processing animation with "Running 20 AI optimization checks"
- [x] Automatic redirect to /analysis page
- [x] Trust indicators: "Client-side processing", "Data never leaves browser"

#### 2. DEEP ANALYSIS PAGE (/analysis) - COMPLETE
- [x] Health Score gauge (0-100) based on findings
- [x] 8 KPI cards: Sales, Units, Spend, ACOS, Sessions, Conversion, ROAS, Unique ASINs
- [x] 4 Tabs: Overview, Findings, ASINs, Charts
- [x] Pareto Analysis (80/20 Rule) bar + line chart
- [x] Spend vs Conversion scatter chart
- [x] Export CSV and Download PDF functionality

#### 3. 20 AI OPTIMIZATION AGENTS - COMPLETE
All agents calculate findings from actual uploaded data (zero hallucination).

### Phase 8 - Multi-File Cross-Pollination Engine - COMPLETE (Feb 2026)

#### 1. MULTI-VAULT UPLOADER (/multi-vault) - COMPLETE
- [x] Batch upload up to 10 files simultaneously
- [x] Universal Mapping Engine auto-detects report types from headers
- [x] Report type detection: Business, Search Term, Settlement, Returns, Inventory, FBA Fees, Brand Analytics
- [x] SKU/ASIN join key identification
- [x] Cross-pollination readiness indicators (green when file combinations available)
- [x] File cards with report type badges and row counts
- [x] "Begin Quantum Analysis" CTA button

#### 2. PROCESSING MATRIX ANIMATION - COMPLETE
- [x] Full-screen overlay with futuristic design
- [x] Rotating brain icon with animated rings
- [x] 8-step progress tracking:
  - Parsing File Structures
  - Detecting Report Types
  - Cleaning & Normalizing Data
  - Quantum Merging on SKU/ASIN
  - Computing Correlations
  - Running 20 AI Agents
  - Generating Cross-Pollination Insights
  - Building Neural Map
- [x] Step-by-step checkmarks with percentage progress
- [x] Gradient progress bar

#### 3. QUANTUM MERGER ENGINE - COMPLETE
- [x] Field name normalization across different CSV formats
- [x] Intelligent field aliasing (sales → ordered_product_sales, 7_day_total_sales, etc.)
- [x] Currency and percentage value cleaning
- [x] SKU/ASIN primary key extraction
- [x] Multi-file merge with aggregation logic
- [x] Join statistics (total rows, joined records, orphan records)

#### 4. CROSS-POLLINATION INSIGHTS - COMPLETE
- [x] **True Profit Audit** (Business + Settlement): Calculates actual net margin per SKU
- [x] **PPC Cannibalization** (PPC + Business): Detects high ad sales ratio with low ACOS
- [x] **Inventory-Ad Velocity** (PPC + Inventory): Flags SKUs with high spend but low inventory
- [x] **ROAS Leak / Waste Map** (Search Term + Returns): Finds trap keywords driving returns
- [x] **Price Elasticity Engine** (Multiple Business Reports): Price vs volume correlation

#### 5. MARKETPLACE NEURAL MAP (/neural-map) - COMPLETE
- [x] Header with unified record count and cross-referenced count
- [x] Interactive Scatter Plot with custom X, Y, Size axis dropdowns
- [x] Color-coded scatter points based on correlation
- [x] "Smart Suggest" alarming correlations detection
- [x] Click-to-apply correlation suggestions
- [x] Discovered Correlations grid (strength, direction, data points)
- [x] Cross-Pollination Insights expandable cards
- [x] Analysis Summary (Total Insights, Correlations Found, Alarming Patterns)

#### 6. RECURSIVE OPTIMIZER - COMPLETE
- [x] "Run 1,000 Simulations" button with amber gradient
- [x] Loading state with spinner
- [x] Golden Path modal with:
  - Projected ROAS Increase (+12-30%)
  - Monthly Savings estimate
  - Confidence Level (85-95%)
  - 5-step action plan with impact descriptions

#### 7. LEAD CAPTURE - COMPLETE
- [x] "Email My Audit" button opens modal
- [x] Modal shows insight count found
- [x] Benefits list (50-page PDF, 15-min strategy call, custom action plan)
- [x] Email input with validation
- [x] Submit to `/api/leads/capture` endpoint
- [x] Success animation with "You're In!" message
- [x] MongoDB storage with interaction tracking
- [x] Duplicate email handling with "Welcome back!"

## API Endpoints

### Lead Capture (NEW)
- POST /api/leads/capture - Capture email from Neural Map
- GET /api/leads/count - Get total lead count (admin)

### Authentication
- POST /api/auth/register, /api/auth/login
- GET /api/auth/google/login, /api/auth/google/callback

### Amazon SP-API
- GET /api/amazon/connect, /api/amazon/callback, /api/amazon/status

### Dashboard & AI
- GET /api/dashboard/kpis
- POST /api/ai/insights

## Database Schema

### leads (MongoDB Collection)
```json
{
  "email": "user@example.com",
  "source": "neural_map",
  "insightCount": 15,
  "created_at": "2026-02-17T12:00:00Z",
  "last_seen": "2026-02-17T12:00:00Z",
  "visit_count": 1,
  "interactions": [{
    "source": "neural_map",
    "insightCount": 15,
    "timestamp": "2026-02-17T12:00:00Z"
  }],
  "status": "new"
}
```

## Test Results (Feb 2026)
- Backend: 100% (8/8 tests) - Lead capture, validation, duplicate handling
- Frontend Multi-Vault/Neural Map: 100% - All 15 features verified
- Cross-Pollination Engine: Working correctly with real data calculations

## What's MOCKED
- Amazon SP-API (requires LWA credentials)
- Demo Universe 1,400+ data points (generated mock data)
- Simulation "1,000 permutations" (deterministic calculation based on findings)

## What's REAL (Zero Hallucination)
- All file parsing and merging (client-side)
- All cross-pollination calculations (True Profit, Cannibalization, etc.)
- Correlation detection between metrics
- Lead capture to MongoDB

## Next Steps (Backlog)
1. Full Amazon SP-API backend integration
2. PostgreSQL migration (when environment supports)
3. Stripe payment integration for Pro subscriptions
4. Web Workers for processing large files (10+ CSVs)
5. Force-Directed Graph for SKU relationship visualization
6. Historical trend tracking for SKU-Level Profit Decay
