# Monetization Lab v3.2 — DemoAI by AdsGupta

**Live:** [demoai.adsgupta.com](https://demoai.adsgupta.com)  
**Vercel project name:** `adsgupta-demoai`

Ad-Tech SaaS demo for **Monetization Lab v3.2**: a tool for publishers to simulate and integrate AI-driven ad stacks. Built with Vite, React, and Tailwind CSS.

## What’s in this app

- **Header & footer** — Same structure as [adsgupta.com](https://adsgupta.com); footer uses “DemoAI by AdsGupta © 2026” and links to the main site.
- **Liquid Revenue** — Explains the stack: Web Monetization API (v2), AP2 (Agent Payments Protocol), and Contextual Ad-Injection (no SDKs).
- **Three zero-integration demos**  
  - **A. Vibe-Check Paywall** — Dynamic paywall based on data value.  
  - **B. Sponsor-Generated UI** — Real-time sponsor bid (e.g. Nike Volt Green) shapes the tool’s design.  
  - **C. Compute-Arbitrage** — User pays $0.02 GPU cost via wallet or by watching a 15s ad.
- **Agent-Log** — Mock “Monetization Event Log” in a sidebar: BuilderBot, FinanceBot, UserAgent, AdBot with timestamps and streaming-style lines.

## Tech stack

- **Vite** — Build and dev server  
- **React 18** — UI  
- **Tailwind CSS** — Styling  
- **Framer Motion** — Animations  
- **Lucide React** — Icons  

## Commands

```bash
# Install
npm install

# Dev (http://localhost:5173)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deploy on Vercel

### Option A: Deploy from your machine (recommended)

```bash
cd app
npm install
npm run build
npx vercel --prod
```

When prompted, set **Project name** to `adsgupta-demoai`. If the project already exists, Vercel will use it. Add the domain **demoai.adsgupta.com** in the Vercel dashboard under Project → Settings → Domains.

### Option B: GitHub → Vercel (auto-deploy on push)

1. Push this repo to GitHub (e.g. `ranjandsgpt/adsgupta-demoai`).
2. In [Vercel](https://vercel.com): **Add New Project** → Import the repo.
3. Set **Root Directory** to `app` (click Edit, then set and save).
4. **Framework Preset:** Vite. **Build Command:** `npm run build`. **Output:** `dist`.
5. Deploy. Then add **demoai.adsgupta.com** in Project → Settings → Domains.

### One-liner script

From the `app` folder:

```bash
chmod +x scripts/deploy.sh && ./scripts/deploy.sh
```

## Repo

- **GitHub:** [github.com/ranjandsgpt/adsgupta-demoai](https://github.com/ranjandsgpt/adsgupta-demoai)
