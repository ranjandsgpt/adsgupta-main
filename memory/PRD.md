# Ads Gupta - AI Advertising Platform & Enterprise Command Center

## Original Problem Statement
Build the ultimate conversion tool for tools.adsgupta.com - a $50M/year SaaS-grade platform featuring instant AI audits, multi-marketplace support, demo universe, TalentOS career tools, and 20 AI optimization agents.

## Deployment Architecture

### Primary Sites

| Domain | Purpose | Mode |
|--------|---------|------|
| `tools.adsgupta.com` | Production - Multi-Marketplace Audit | `REACT_APP_SHOW_DEMO=false` |
| `demoai.adsgupta.com` | Demo Hub - Interactive Showcases | `REACT_APP_SHOW_DEMO=true` |
| `talentos.adsgupta.com` | TalentOS - Career & Interview AI | Standalone (currently integrated) |

## TalentOS Module (Phase 10 - COMPLETE)

### Overview
TalentOS is an AI-powered interview coach platform specializing in ad-tech roles. It provides resume gap analysis, mock interviews with Web Speech API, and STAR method scoring.

### Routes
```
/talentos              - Landing page (Apple-style dark mode)
/talentos/workspace    - Resume upload + JD input
/talentos/analysis     - Gap analysis results with match score
/talentos/interview    - Live mock interview with speech recognition
```

### Features Implemented
- [x] Apple-style dark mode landing page with hero section
- [x] Resume upload dropzone (PDF, DOC, DOCX, TXT)
- [x] JD input (paste text or LinkedIn URL)
- [x] LinkedIn profile input (optional)
- [x] AI Gap Analysis with match score (0-100%)
- [x] Skill gap identification (match/partial/gap status)
- [x] Custom interview questions based on JD
- [x] Action items for improvement
- [x] Readiness score breakdown (technical, behavioral, industry, communication)
- [x] Interview Room with Web Speech API (Chrome/Edge)
- [x] Real-time speech-to-text transcription
- [x] STAR Method scoring (Situation, Task, Action, Result)
- [x] Interview feedback and follow-up questions

### API Endpoints
```
GET  /api/talentos/health       - Health check
POST /api/talentos/analyze      - Resume vs JD analysis
POST /api/talentos/evaluate-answer - STAR scoring for answers
```

### Technical Details
- Frontend: React with Framer Motion animations
- Backend: FastAPI with Pydantic models
- Speech: Web Speech API (browser-native, Chrome/Edge required)
- Analysis: Keyword matching (LLM integration ready when key configured)
- Design: Dark mode (#050505), Space Grotesk font, cyan/blue gradients

## Multi-Marketplace Audit Engine

### Marketplace Context Switcher
```
Amazon    - Active (full audit engine)
Walmart   - Staging (Notify modal)
Blinkit   - Coming (quick commerce)
Swiggy    - Coming (quick commerce)
Zomato    - Coming (quick commerce)
```

### Lead Capture
- Email capture with marketplace source tracking
- MongoDB storage for waitlist management

## Universal Dashboard

### Sidebar Navigation
1. **Marketplaces**
   - Amazon Seller Hub (Active)
   - Walmart Hub (Coming Soon)

2. **Growth Tools**
   - SEO Intelligence
   - Growth Audit Engine → /audit
   - Affiliate Manager
   - AI Content Studio

## All Routes Summary

### Main Site (tools.adsgupta.com)
```
/                     - Marketing Homepage
/audit               - Multi-Marketplace Audit with Context Switcher
/analysis            - Deep Analysis Report
/multi-vault         - Multi-File Staging
/neural-map          - Marketplace Neural Map
/dashboard           - Universal Dashboard
/tools               - Growth Tools + TalentOS link
/talentos/*          - TalentOS Interview Coach
/blog, /aboutme, /contact, /privacy, /terms
```

### Demo Site (demoai.adsgupta.com)
```
/                     - Redirects to /amazon-audit
/amazon-audit         - Demo Universe with 1,400+ data points
```

## Test Results Summary

| Module | Backend | Frontend |
|--------|---------|----------|
| Phase 9 (Marketplace) | 12/12 (100%) | All verified |
| Phase 10 (TalentOS) | 12/12 (100%) | All 4 routes verified |

## What's MOCKED

### TalentOS
- Resume/JD analysis uses keyword matching (LLM ready when key configured)
- STAR scoring uses keyword detection
- Web Speech API requires Chrome/Edge

### Main Platform
- Demo Universe 1,400+ data points (intentional)
- Amazon SP-API integration (planned)
- Walmart/Quick Commerce integrations (placeholders)

## What's REAL
- All file parsing and analysis
- Cross-pollination calculations
- Lead capture with source tracking
- Multi-marketplace context switching
- Speech-to-text transcription (browser API)
- STAR method evaluation logic

## Next Steps (Backlog)

### P0 - Deploy
- Deploy tools domain to tools.adsgupta.com
- Deploy demo domain to demoai.adsgupta.com

### P1 - TalentOS Enhancement
1. Configure Emergent LLM Key for GPT-powered analysis
2. Add Clerk authentication
3. Implement Razorpay subscription ($1/month)
4. Build LinkedIn profile scraper
5. Add interview question customization

### P2 - Platform Features
1. Walmart Seller Center integration
2. Quick Commerce APIs (Blinkit, Swiggy, Zomato)
3. Recursive Optimizer (1,000 simulations)
4. Force-Directed Graph for Neural Map

### P3 - Future
1. AI Video Persona (SadTalker/LivePortrait)
2. Chrome Extension for Auto-Apply
3. PostgreSQL migration
4. Stripe payment integration

## File Structure

```
/app/frontend/src/
├── modules/
│   ├── talentos/                    # NEW - TalentOS Module
│   │   ├── pages/
│   │   │   ├── TalentOSLanding.jsx
│   │   │   ├── TalentOSWorkspace.jsx
│   │   │   ├── TalentOSAnalysis.jsx
│   │   │   └── TalentOSInterview.jsx
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── store/
│   └── demo-universe/
├── components/
│   ├── MarketplaceContextSwitcher.jsx  # NEW
│   ├── DashboardSidebar.jsx            # NEW
│   └── ...
├── pages/
└── ...

/app/backend/
├── routes/
│   ├── talentos.py                  # NEW - TalentOS API
│   ├── leads.py
│   └── ...
└── ...
```

## Design System

### Colors
- **Background**: `#050505` (TalentOS), `#121212` (main)
- **Cards**: `#0A0A0A`
- **Accents**: `#00FFFF` (cyan), blue-500 to blue-600 gradients
- **Status**: Emerald (match), Amber (partial), Red (gap)

### Typography
- **Headings**: Space Grotesk
- **Body**: Inter/System
