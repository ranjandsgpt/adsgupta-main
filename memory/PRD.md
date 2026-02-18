# Ads Gupta - AI Advertising Platform & Enterprise Command Center

## Original Problem Statement
Build the ultimate conversion tool for tools.adsgupta.com - a $50M/year SaaS-grade platform featuring instant AI audits, multi-marketplace support, demo universe, TalentOS career tools, and 20 AI optimization agents.

## Deployment Architecture

### Primary Sites

| Domain | Purpose | Mode |
|--------|---------|------|
| `adsgupta.com` | Production - Main Landing/Marketing | Primary domain |
| `tools.adsgupta.com` | Production - Multi-Marketplace Audit | `REACT_APP_SHOW_DEMO=false` |
| `demoai.adsgupta.com` | Demo Hub - Protocol Showcase Hub | `REACT_APP_SHOW_DEMO=true` |
| `talentos.adsgupta.com` | TalentOS - Career & Interview AI | Standalone (currently integrated) |

## AdsGupta Core Architecture Overhaul (Phase 14 - COMPLETE) ✅

### Overview
Major architecture update with unified naming, dynamic navigation, and persistent SLM chatbot integration.

### Brand Naming Protocol (February 2026)
- **The Neural Engine**: The foundational AI layer powering all protocols (formerly "The Core/Ecosystem")
- **The Protocols**: The product suite (Amazon Audit, TalentOS, Monetization, etc.) (formerly "Solutions/Hub")
- Navigation updated to reflect new naming throughout

### New Components Created

#### 1. protocolsConfig.js - Single Source of Truth
```javascript
// /app/frontend/src/config/protocolsConfig.js
export const protocolsConfig = [
  { id: 'amazon-audit', name: 'Amazon Audit', status: 'live', href: 'https://demoai.adsgupta.com/amazon-audit' },
  { id: 'walmart-audit', name: 'Walmart Audit', status: 'coming-soon' },
  { id: 'insights-engine', name: 'Insights Engine', status: 'live' },
  { id: 'demoai', name: 'DemoAI Sandbox', status: 'live' },
  { id: 'talentos', name: 'TalentOS', status: 'live' },
  { id: 'monetization', name: 'Monetization AI', status: 'live' },
];
```

#### 2. MegaMenu.jsx - Dynamic Protocols Menu
- Hover-triggered dropdown from "The Protocols" nav item
- Auto-populates from protocolsConfig.js
- Shows LIVE/COMING SOON badges
- External link indicators

#### 3. OmniNav.jsx - Sticky Sub-Navigation
- Appears on tool pages (/audit, /tools, etc.)
- Dynamically pulls from protocolsConfig.js
- Always visible for protocol switching

#### 4. PersistentSLMChat.jsx - Browser SLM Chatbot
- Persists across ALL pages
- Uses Chrome's Prompt API (Gemini Nano) when available
- Privacy-first: processes on-device, no external data sent
- Fallback mode with contextual preset responses
- Positioned at bottom: 80px to avoid sticky ad overlap

### UI/UX Fixes

#### Hero Section Responsive Fix
- Replaced `position: absolute` with Flexbox wrapper
- Text container: 55% width, Animation: 40% width
- Uses `clamp()` for responsive font sizing
- Tested at 1440p, 1080p, 720p - zero overlap

#### /aboutme Page Redesign
- Minimalist two-card layout
- Pousali Dasgupta: "Strategic Ad-Tech Leader & Growth Architect"
- Ranjan Dasgupta: "Technical Visionary & Neural Systems Specialist"
- Portfolio + LinkedIn CTAs with avatar placeholders

#### /privacy Page Created
- "Your Data, Your Control" heading
- Three key principles: Local SLM Processing, Privacy-First Ad Serving, Edge Computing
- GAM/TAM/Prebid transparency section
- 2026 data privacy standards compliance

### Route Changes

| Route | Action |
|-------|--------|
| `/amazon-audit` | 301 redirect → `demoai.adsgupta.com/amazon-audit` |
| MARKETPLACE INTEL section | REMOVED from homepage |

### Test Results
**Phase 14:** 100% pass rate (25/25 features verified)
- Hero overlap fix ✓
- Brand naming update ✓
- MegaMenu dynamic population ✓
- Persistent SLM Chat ✓
- About page two-card ✓
- Privacy page ✓
- /amazon-audit redirect ✓

---

## Monetization AI - Native Ad Engine (Phase 13 - COMPLETE) ✅

### Overview
Unified Ad-Hook System with SLM Intelligence. Completely refactored MonetizationPage.jsx into modular components.

### Brand Update (February 2025)
- Renamed "AdsGupta AI" → "Monetization AI" in sidebar and headers
- Removed "Made with Emergent" watermark from all pages
- Updated index.html title to "AdsGupta | AI Advertising Platform"

### Refactored Component Architecture
```
/app/frontend/src/modules/demo-universe/components/monetization/
├── index.js                 # Barrel exports
├── GlobalSidebar.jsx        # Unified navigation sidebar
├── DynamicPopup.jsx         # Unified popup (hyperlinks + chatbot + sticky ad)
├── StickyAd.jsx             # 320x50 sticky footer ad
├── DynamicHyperlink.jsx     # Content-aware ad hooks
├── AdContainer.jsx          # VideoAd, BannerAd, NativeAd components
└── AdProvider.jsx           # Enterprise Ad-Stack (GAM + TAM + OpenWrap)
```

### Key Features Implemented

#### 1. Dynamic Hyperlinking
- Analyzes page content on load and converts key terms ("Coconut oil", "MCTs", "weight gain") into clickable cyan ad-hooks
- Re-initializes when content changes (content-fluidity)
- Keywords highlighted with cyan (#00FFFF) styling

#### 2. Unified Ad-Hook System
Three triggers → One Dynamic Popup:
| Trigger | Action |
|---------|--------|
| Hyperlinked Text | Opens popup with that keyword context |
| Chatbot Panel (Neural Oracle Floater) | Opens popup in chat mode |
| Sticky Footer Ad | Opens popup in products mode |

#### 3. Sticky 320x50 Footer Ad
- Fixed position at viewport bottom
- Close button to dismiss
- Impression/click logging (console)
- Mobile & desktop compatible

#### 4. SLM Integration (Chrome Prompt API)
- Checks for `window.ai.languageModel` availability
- When available: Uses Gemini Nano for content summarization, ad suggestions, prompt generation
- Graceful fallback: Shows "SLM Unavailable" badge and uses preset responses
- Functions: `summarize()`, `generateAdSuggestions()`, `generatePromptSuggestions()`, `chat()`

#### 5. Enterprise Ad-Stack Architecture
AdProvider.jsx contains ready-to-use configuration objects:
- **GAM Config**: Network code, ad unit paths, targeting keys
- **TAM Config**: Amazon publisher ID, slots, bid timeout
- **Prebid Config**: OpenWrap/Prebid.js setup with bidder configs (PubMatic, AppNexus, OpenX, Rubicon)

### Layout
- **Header:** Hamburger menu | "Monetization AI" (cyan) | Share button
- **Global Sidebar:** Retractable navigation (Command Center, Amazon Optimizer, Native Monetization, TalentOS, Neural Oracle)
- **Article Content:** Dynamic hyperlinks on key terms
- **Video Ad:** Inline with skip countdown
- **Products Carousel:** 6 sponsored products with Buy Now CTA
- **Neural Oracle Floater:** AI badge + rotating text + online indicator
- **Sticky Footer:** 320x50 ad slot

### Test Results
**Phase 13:** 100% pass rate (14/14 features verified)
- Made with Emergent badge removed ✓
- Monetization AI branding ✓
- Dynamic hyperlinks working ✓
- Sticky footer ad visible ✓
- Unified popup system working ✓
- Mobile responsive ✓

### What's MOCKED
- **Chrome SLM (Gemini Nano):** Falls back to preset responses when Chrome Prompt API unavailable
- **AdProvider:** Uses placeholder network IDs (GAM_NETWORK_CODE, etc.)
- **Chat responses:** Simulated 1.5s delay with contextual fallback text

## DemoAI Showcase Hub (Phase 11 - COMPLETE) ✅

### Overview
The Protocol Showcase Hub is the entry point for the demoai.adsgupta.com domain. It features an "Industrial Luxury Tech" aesthetic with a bento grid layout showcasing all AdsGupta protocols.

### Routes
```
/                     - Protocol Showcase Hub (demoai domain)
/showcase             - Protocol Showcase Hub (accessible from tools domain)
/amazon-audit         - Marketplace Optimizer Demo (1,400+ data points)
/monetization         - Native Widget & LLM Monetization Demo
```

### Features Implemented
- [x] Industrial Luxury Tech aesthetic with deep black (#000000) canvas
- [x] Non-uniform 3x3 Bento Grid with Glassmorphism cards
- [x] Magnetic hover effect with cyan (#00FFFF) outer glow
- [x] Terminal overlay with scanline + typewriter effect
- [x] Protocol status badges (ACTIVE, PREVIEW, STAGING, COMING SOON)
- [x] Waitlist modal for staging protocols
- [x] Retractable global sidebar with navigation
- [x] System Status: ONLINE indicator
- [x] Staggered entrance animations (Framer Motion)

### Protocol Cards
| Protocol | Status | Destination | Type |
|----------|--------|-------------|------|
| Marketplace Optimizer | ACTIVE | /amazon-audit | Working |
| Native Widget / Monetization | ACTIVE | /monetization | Working |
| TalentOS | PREVIEW | https://talentos.adsgupta.com | External |
| Neural Oracle (Chat) | STAGING | Waitlist modal | Placeholder |
| Influencer AI Video | STAGING | Waitlist modal | Placeholder |
| Walmart / Quick Commerce | COMING SOON | Waitlist modal | Placeholder |

### Design Specifications
- **Canvas**: Deep Black (#000000)
- **Cards**: Glassmorphism (rgba(255,255,255,0.03), backdrop-blur 12px)
- **Accent**: Cyan (#00FFFF) glow on hover
- **Terminal**: Scanline effect, typewriter animation, progress bar
- **Fonts**: Space Grotesk (headings), System (body)

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
/                     - Protocol Showcase Hub (Bento Grid)
/showcase             - Protocol Showcase Hub (alias)
/amazon-audit         - Demo Universe with 1,400+ data points
/monetization         - Native Widget & LLM Monetization Demo
```

## Test Results Summary

| Module | Backend | Frontend |
|--------|---------|----------|
| Phase 9 (Marketplace) | 12/12 (100%) | All verified |
| Phase 10 (TalentOS) | 12/12 (100%) | All 4 routes verified |
| Phase 11 (DemoAI Hub) | N/A | 11/11 (100%) |
| Phase 12 (Monetization) | N/A | 12/12 + 8 additional (100%) |

## What's MOCKED

### Monetization Demo Page
- AI Chat responses are simulated (1.5s delay, preset responses)
- Video ad uses Big Buck Bunny sample video
- Product prices/ratings are static mock data
- Live Metrics are static display values

### DemoAI Showcase Hub
- Neural Oracle, Influencer AI Video, Walmart protocols → Waitlist modal only
- TalentOS external link points to planned domain (talentos.adsgupta.com)

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
- DemoAI Showcase Hub terminal transitions and navigation
- Monetization page real-time visualizations

## Next Steps (Backlog)

### P0 - Deploy (READY)
- Deploy tools domain to tools.adsgupta.com
- Deploy demo domain to demoai.adsgupta.com
- DemoAI Showcase Hub is complete and ready

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
│   ├── talentos/                    # TalentOS Module
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
│       ├── DemoShowcaseHub.jsx      # NEW - Protocol Showcase Hub
│       ├── MonetizationPage.jsx     # NEW - LLM Monetization Demo
│       ├── DemoUniversePage.jsx     # Amazon Audit Demo
│       ├── data/
│       │   └── mockDataGenerators.js
│       └── store/
│           └── demoStore.js
├── components/
│   ├── MarketplaceContextSwitcher.jsx
│   ├── DashboardSidebar.jsx
│   └── ...
├── pages/
└── ...

/app/backend/
├── routes/
│   ├── talentos.py                  # TalentOS API
│   ├── leads.py                     # Lead capture
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
