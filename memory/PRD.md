# Ads Gupta - AI Advertising Platform & Enterprise Command Center

## Original Problem Statement
Build the ultimate conversion tool for tools.adsgupta.com - a $50M/year SaaS-grade platform featuring instant AI audits, multi-marketplace support, demo universe, TalentOS career tools, and 20 AI optimization agents.

## Deployment Architecture (Production Ready)

### Primary Sites

| Domain | Purpose | Mode |
|--------|---------|------|
| `tools.adsgupta.com` | Production - Multi-Marketplace Audit | `REACT_APP_SHOW_DEMO=false` |
| `demoai.adsgupta.com` | Demo Hub - Interactive Showcases | `REACT_APP_SHOW_DEMO=true` |
| `talentos.adsgupta.com` | TalentOS - Career & Interview AI | Standalone (planned) |

### Cross-Domain Navigation
- **tools → demo**: "See the Full AI Demo Universe" on /audit
- **tools → demo**: "Explore Demo Universe" on /marketplacesolutions
- **demo → tools**: "Analyze Your Own Data" button
- **tools → talentos**: "Launch TalentOS" on /tools

## Multi-Marketplace Audit Engine (`/audit`)

### Marketplace Context Switcher
A responsive top-bar allowing users to switch between:

| Marketplace | Status | Behavior |
|-------------|--------|----------|
| **Amazon** | Active | Full audit engine with file upload |
| **Walmart** | Staging | "Protocol Development" state with Notify modal |
| **Blinkit** | Coming | Quick commerce protocol - Notify modal |
| **Swiggy Instamart** | Coming | Quick commerce protocol - Notify modal |
| **Zomato** | Coming | Quick commerce protocol - Notify modal |

### Lead Capture for Waitlists
- Each non-active marketplace shows a "Notify Me at Launch" modal
- Captures email with marketplace source tracking
- Stores in MongoDB leads collection

## Universal Dashboard (`/dashboard`)

### Architecture
- **Persistent Sidebar Navigation** (only visible when logged in)
- **Dynamic Content Area** that updates based on selected module

### Sidebar Sections
1. **Marketplaces**
   - Amazon Seller Hub (Active)
   - Walmart Hub (Coming Soon)

2. **Growth Tools**
   - SEO Intelligence
   - Growth Audit Engine → links to `/audit`
   - Affiliate Manager
   - AI Content Studio

## TalentOS Integration (`/tools`)

### Moved to Standalone Platform
- Interview AI Coach - RAG-based mock interviews
- Career Path Navigator - Personalized career recommendations

### Navigation
- "Launch TalentOS" button links to `talentos.adsgupta.com`
- Separate from main Growth Tools section

## Routes Summary

### Tools Domain (`tools.adsgupta.com`)
```
/ - Marketing Homepage
/audit - Multi-Marketplace Audit with Context Switcher
/analysis - Deep Analysis Report
/multi-vault - Multi-File Staging
/neural-map - Marketplace Neural Map
/dashboard - Universal Dashboard (with sidebar when logged in)
/tools - Growth Tools + TalentOS section
/demo - Redirects to demoai.adsgupta.com/amazon-audit
/blog, /aboutme, /contact, /privacy, /terms, /marketplacesolutions
```

### Demo Domain (`demoai.adsgupta.com`)
```
/ - Redirects to /amazon-audit
/amazon-audit - Demo Universe with 1,400+ data points
/monetization - (Planned) Native Widget & LLM Monetization demos
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
- [x] Dual-domain deployment architecture

### Phase 9 - Ecosystem Re-Architecture (Feb 2026) - COMPLETE
- [x] Marketplace Context Switcher component
- [x] Amazon/Walmart/Others tabs with proper status indicators
- [x] "Protocol Development in Progress" state for staging marketplaces
- [x] Notify Me modal with lead capture for marketplace waitlists
- [x] Lead capture API updated with marketplace source tracking
- [x] Dashboard Sidebar component
- [x] Sidebar navigation with Marketplaces and Growth Tools sections
- [x] ToolsPage reorganized with TalentOS separate section
- [x] "Launch TalentOS" external link
- [x] MarketplaceSolutions CTA updated to demoai domain
- [x] /demo route redirects to demoai.adsgupta.com/amazon-audit
- [x] Visual theme solidified (#121212 background, #00FFFF accents)

## Design System

### Colors
- **Background**: `#121212` (primary), `#0A1628` (cards/sidebar)
- **Accents**: `#00FFFF` (cyan) for borders, active states, buttons
- **Status**: Green for active, Blue for staging, Cyan for coming

### Typography
- **Headings**: Space Grotesk
- **Body/Data**: Inter (system default)

## API Endpoints

### Lead Capture (Updated)
- `POST /api/leads/capture` - Accepts email + optional marketplace field
  - Source tracking: `marketplace_waitlist_{marketplace_id}`
- `GET /api/leads/count` - Returns total lead count

### Authentication
- `POST /api/auth/register`, `/api/auth/login`
- `GET /api/auth/google/login`

## Test Results (Phase 9)
- Backend: 100% pass rate (12/12 tests)
- Frontend: 100% pass rate
- Marketplace switcher: Verified
- Notify modals: All working
- Lead capture: Source tracking verified

## What's MOCKED
- Demo Universe 1,400+ data points (intentional)
- TalentOS (talentos.adsgupta.com) - external link exists, platform not yet deployed
- Amazon SP-API integration (planned)
- Walmart actual integration (placeholder only)
- Quick commerce integrations (Blinkit, Swiggy, Zomato - placeholders)

## What's REAL
- All file parsing and analysis
- Cross-pollination calculations
- Lead capture with marketplace source tracking
- Multi-marketplace context switching
- State isolation between demo and real data
- Cross-domain navigation

## Next Steps (Backlog)

### P0 - Ready for Deploy
- Deploy tools domain to tools.adsgupta.com
- Deploy demo domain to demoai.adsgupta.com

### P1 - TalentOS Standalone App
1. Initialize Next.js 14+ project for talentos.adsgupta.com
2. Build RAG-based AI Interview Coach
3. Resume/JD upload widget with comparison engine
4. Mock Interview Room with Web Speech API
5. STAR method grading feedback engine

### P1 - Demo Hub Expansion (demoai domain)
1. Create root `/` as Multi-Product Showcase gallery
2. Move existing Native Widget logic to `/monetization`
3. Create "Active Protocols" cards for each demo

### P2 - Feature Enhancements
1. Implement Walmart Seller Center integration (when API available)
2. Add Quick Commerce APIs (Blinkit, Swiggy, Zomato)
3. Build "Recursive Optimizer" logic (1,000 simulations)
4. Enhance Neural Map with Force-Directed Graph

### P3 - Infrastructure
1. Full Amazon SP-API backend integration
2. PostgreSQL migration
3. Stripe payment integration
4. Email service for "Email My Audit"
