# TalentOS Career OS - PRD

## Original Problem Statement
Build a full-featured Career OS for ad-tech professionals featuring:
- AI-powered interview preparation with STAR method scoring
- Resume-to-JD gap analysis with AI optimization
- Job discovery via Adzuna API
- Razorpay payment integration for Pro subscriptions
- 50+ adtech-specific interview questions

## Tech Stack
- **Frontend:** React, Tailwind CSS, Framer Motion
- **Backend:** FastAPI, Pydantic, Motor (async MongoDB)
- **Database:** MongoDB
- **Payments:** Razorpay (LIVE)
- **Job Search:** Adzuna API
- **LLM:** GPT-4o via Emergent LLM Key

## What's Been Implemented

### December 2025 - Full TalentOS Build
1. **User Model Extension**
   - Added `is_pro`, `credits`, `razorpay_customer_id`, `razorpay_sub_id`
   - Added `linkedin_data`, `linkedin_in_sync` for future LinkedIn integration

2. **Database Models Added**
   - `Resume`: Store parsed resumes with embeddings (for future RAG)
   - `JobMatch`: Resume-to-JD analysis results
   - `InterviewSession`: Mock interview transcripts and feedback
   - `Payment`: Razorpay payment records
   - `JobListing`: Saved jobs from Adzuna

3. **Backend Routes Created**
   - `/api/talentos/interview/start` - Start mock interview session
   - `/api/talentos/interview/message` - Process interview responses
   - `/api/talentos/analyze` - Resume-to-JD analysis
   - `/api/talentos/resume-brief` - AI resume optimizer
   - `/api/talentos/questions/{category}` - Get interview questions
   - `/api/talentos/user/{user_id}` (DELETE) - GDPR data deletion
   - `/api/jobs/search` - Adzuna job search
   - `/api/jobs/scrape` - Job URL scraping (mocked)
   - `/api/jobs/save` - Save job to user's list
   - `/api/payments/config` - Get Razorpay config and pricing
   - `/api/payments/create-order` - Create Razorpay order
   - `/api/payments/verify` - Verify payment signature
   - `/api/payments/webhook` - Razorpay webhook handler

4. **Frontend Pages Created**
   - `TalentOSInterview.jsx` - Full mock interview room with:
     - State machine (IDLE → AI_SPEAKING → USER_LISTENING → ANALYZING → FEEDBACK)
     - STAR method scoring visualization
     - Filler word detection
     - Voice input via Web Speech API
     - Canvas-based audio visualizer
   - `TalentOSJobs.jsx` - Job discovery with:
     - Adzuna API integration
     - Ad-tech keyword filtering
     - Save jobs functionality
     - "Analyze Fit" quick action
   - `TalentOSPricing.jsx` - Payment page with:
     - Free/Pro Monthly/Pro Yearly tiers
     - ₹1 trial option
     - Razorpay checkout integration

5. **Adtech Knowledge Base**
   - 50+ deep-level programmatic questions
   - 10 categories: Header Bidding, DSP/SSP, RTB, Yield Optimization, Privacy, Measurement, Campaign Management, Ad Fraud, Retail Media, CTV/Video

## API Keys Configured
- **Razorpay LIVE:** `rzp_live_SHcuX4DmXA1x5M`
- **Adzuna:** `app_id=021ac0ca`, `app_key=b2cd12944bfc01bfe3f5670fdaa5a658`
- **Emergent LLM Key:** Configured in backend/.env

## Pricing Tiers
| Plan | Price | Features |
|------|-------|----------|
| Free | ₹0 | 3 analyses, 1 interview, basic STAR scoring |
| Pro Monthly | ₹999/mo | Unlimited everything, AI resume brief, filler detection |
| Pro Yearly | ₹7,999/yr | 2 months free, AI video persona, LinkedIn sync, coaching call |
| Pro Trial | ₹1 | All Pro features for testing |

## Route Structure (talentos.adsgupta.com)
```
/                 → TalentOS Landing
/workspace        → Resume/JD Upload
/analysis         → Gap Analysis Results
/interview        → Mock Interview Room
/jobs             → Job Discovery
/pricing          → Pricing/Payment
/privacy          → Privacy Policy
/terms            → Terms of Service
```

## Testing Status
- **Backend:** 100% (14/14 tests passed)
- **Frontend:** 100% (4/4 pages verified)
- **Test Report:** `/app/test_reports/iteration_15.json`

## Verified Integrations
- ✅ Adzuna API - Real job listings
- ✅ Razorpay - LIVE payment processing
- ✅ Emergent LLM (GPT-4o) - Resume analysis, follow-up questions

## Mocked Features
- ⏳ Job URL scraping (Playwright not implemented)
- ⏳ LinkedIn OAuth sync
- ⏳ AI Video Persona generation
- ⏳ MongoDB Vector Search for RAG

## Deployment
- **Preview:** https://monetization-ai.preview.emergentagent.com
- **Target Domain:** talentos.adsgupta.com
- **Health Endpoints:** `/health`, `/api/health`, `/api/talentos/health`

## Next Steps
1. Deploy to `talentos.adsgupta.com`
2. Implement actual job scraping with Playwright
3. Add LinkedIn OAuth for profile sync
4. Implement MongoDB Vector Search for resume RAG
5. Add AI Video Persona with Replicate API
