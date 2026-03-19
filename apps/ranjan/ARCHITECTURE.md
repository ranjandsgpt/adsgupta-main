# ranjan.adsgupta.com — Full Architecture Document

> **Purpose:** Complete, end-to-end architecture so anyone can build the entire site from scratch.  
> **Subject:** Ranjan Dasgupta — AdTech product leader (programmatic, CTV, exchange strategy at $200M+ scale).  
> **Design reference:** Patterns inspired by pousali.adsgupta.com; content, theme, and domain are entirely Ranjan-focused.

---

## Table of Contents

1. [Site Overview](#section-1-site-overview)
2. [Tech Stack](#section-2-tech-stack)
3. [Design System](#section-3-design-system)
4. [Page Architecture — Complete Route Map](#section-4-page-architecture--complete-route-map)
5. [Content Architecture](#section-5-content-architecture)
6. [SEO Architecture](#section-6-seo-architecture)
7. [Component Architecture](#section-7-component-architecture)
8. [Deployment & Infrastructure](#section-8-deployment--infrastructure)
9. [Implementation Roadmap](#section-9-implementation-roadmap)
10. [Quality Checklist](#section-10-quality-checklist)

---

## SECTION 1: Site Overview

### Project

| Field | Value |
|-------|--------|
| **Project** | ranjan.adsgupta.com |
| **Purpose** | Personal professional portfolio + AdTech knowledge hub for Ranjan Dasgupta |
| **Target Audience** | Recruiters, DSP/SSP partners, publishers, AdTech industry peers, investors, LLM search engines (Perplexity, ChatGPT, Claude, Gemini) |
| **Positioning** | "Ranjan Dasgupta — AdTech product leader specializing in programmatic advertising, CTV monetization, and exchange-side strategy at $200M+ scale" |

### Critical Rules

1. **Subject:** Every piece of content, title tag, heading, and bio is about **Ranjan Dasgupta** and his AdTech/programmatic/exchange/CTV expertise. No Pousali Dasgupta, no other person as primary subject.
2. **Design patterns:** Navigation, page layout, SEO patterns (FAQ, keyword internal links, schema) are inspired by pousali.adsgupta.com. Content, color theme, and domain focus are different and Ranjan-specific.
3. **SEO content:** Designed, not dumped. Every section is a styled component (cards, grids, typography, spacing). Premium portfolio that is SEO-optimized, not a raw text dump.
4. **Footer:** Shared across all adsgupta.com subdomains. Do not create a new footer. Do not modify the existing footer. Use the exact footer from adsgupta.com.

### About Ranjan Dasgupta (Reference)

| Field | Value |
|-------|--------|
| **Full name** | Ranjan Dasgupta (Ranjan Thomas Dasgupta) |
| **Current role** | Product and Initiatives — Web & CTV Exchange at InMobi, Bengaluru, India |
| **LinkedIn** | https://www.linkedin.com/in/ranjandsgpt/ |

**Career timeline:**

- **2025–Present:** InMobi — Senior Manager, Product and Initiatives, Web & CTV Exchange. Drives product strategy for Web & CTV Exchange with focus on convergence with Agentic AI. Building 2030 product roadmap for exchange infrastructure.
- **2020–2025:** Glance (InMobi subsidiary) — Senior Manager, Product Growth & Strategy. Built and scaled end-to-end Unified Monetization stack across Web, App, and CTV. Scaled programmatic advertising infrastructure to $200M+ in revenue. 5+ years building and optimizing monetization at massive scale.
- **2019–2020:** Automatad — Product Growth & Monetization Head. Programmatic monetization solutions for digital publishers. Omni-channel product strategy and execution.
- **2015–2019:** Google — Technical Account Manager → Strategic Account Manager. Technical Specialist for DoubleClick, DFP, AdX, AdSense, DV360, SA360. DoubleClick For Publishers GPT Exam certified. 4 years of platform optimization for global publishers.
- **Early career:** CyberSWIFT — Software Engineer.

**Education:** B.Tech, Computer Science — West Bengal University of Technology, Kolkata.

**Core expertise:** Programmatic Advertising & Ad Exchange Architecture; CTV Monetization (SSAI, CSAI, ad podding); Header Bidding (Prebid.js, server-side, wrapper optimization); Supply Path Optimization (SPO); Yield Optimization; AI in Advertising (Agentic AI, contextual intelligence); Web & App Monetization at Scale ($200M+); OpenRTB, Google Ad Manager, unified auctions.

**Side projects:** AdsGupta (adsgupta.com); talenos.adsgupta.com; demoai.adsgupta.com.

---

## SECTION 2: Tech Stack

| Layer | Choice |
|--------|--------|
| **Framework** | Next.js 14+ with App Router |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Deployment** | Vercel |
| **Analytics** | Google Analytics 4 + Google Search Console |
| **Fonts** | Two distinctive professional fonts (not Inter, Roboto, Arial, Space Grotesk). One display/heading, one body. Options: Instrument Serif + DM Sans; or Syne + Outfit; or Cabinet Grotesk + General Sans. |
| **Icons** | Lucide React |
| **Footer** | Shared component from adsgupta.com — do not recreate or modify |

---

## SECTION 3: Design System

### Design Direction

AdTech professional site: technical, precise, premium. Dark-on-light or sophisticated light with strong engineering aesthetics. Monospace accents for data/metrics. Clean grid layouts, subtle animations. Not a generic light-theme portfolio.

### Color Palette

Define as CSS variables and in Tailwind config. Modern fintech meets ad exchange dashboard.

| Token | Purpose | Example |
|--------|---------|---------|
| `--bg` | Page background | Slight warmth or cool tint (e.g. #fafbfc or #f8fafc) |
| `--surface` | Cards, elevated panels | #ffffff or #f1f5f9 |
| `--text-primary` | Headings, primary text | #0f172a or #1e293b |
| `--text-secondary` | Body, captions | #475569 or #64748b |
| `--accent-primary` | Primary brand (CTAs, links) | Deep blue, teal, or dark cyan (e.g. #0e7490 or #0369a1) |
| `--accent-secondary` | Highlights, secondary CTAs | Complementary (e.g. #0d9488 or #0891b2) |
| `--border` | Dividers, card borders | #e2e8f0 or #cbd5e1 |
| `--success` | Positive metrics, success states | #059669 |
| `--warning` | Warnings | #d97706 |
| `--error` | Errors, destructive | #dc2626 |

**Monospace:** Use for metrics, numbers, code references (e.g. JetBrains Mono).

### Typography

| Element | Font | Size | Weight | Line height | Use |
|---------|------|------|--------|-------------|-----|
| H1 | Display font | 2.5rem–3rem | 600–700 | 1.1 | Hero, page titles |
| H2 | Display font | 1.75rem–2rem | 600 | 1.25 | Section titles |
| H3 | Display or body | 1.25rem–1.5rem | 600 | 1.3 | Card titles, subsections |
| Body | Body font | 1rem | 400 | 1.6 | Paragraphs |
| Body small | Body font | 0.875rem | 400 | 1.5 | Captions, metadata |
| Caption | Body font | 0.75rem | 400 | 1.4 | Labels, tags |
| Mono | JetBrains Mono (or similar) | 0.875rem–1rem | 400–500 | 1.5 | Metrics, code, specs |

### Component Design Patterns

- **Navigation bar:** Sticky; logo "Ranjan Dasgupta" (left), links (right). Clear hover/active states.
- **Hero:** H1 + subtitle + short intro + primary/secondary CTAs. Generous spacing, clear hierarchy.
- **Section containers:** Consistent vertical padding (e.g. py-16 or py-20), max-width (e.g. max-w-5xl or 6xl), optional background alternation (bg-white / bg-surface).
- **Expertise cards:** Icon or small graphic + H3 title + 2–3 sentence description + link. Card hover state, border or shadow.
- **Project/case study cards:** Category tag + title + problem + strategy + results (metrics in mono). Optional image or placeholder.
- **Article preview cards:** Category badge + title + short description + read time. Link to full article.
- **FAQ:** Accordion or visible Q&A; semantic `<dl>`/`<dt>`/`<dd>` for schema. Styled so it fits the page design.
- **Metric display:** Large number (mono) + label. Used in project results (e.g. "$200M+", "5+ years").
- **CTA buttons:** Primary (filled, accent color); secondary (outline, border). Consistent padding and radius.
- **Contact block:** Email, LinkedIn, optional contact form or link to /contact.
- **Badge/tag:** Small pill or tag for categories (e.g. "Programmatic", "CTV").

### Developer Console (Homepage)

- Floating `>_` trigger button fixed bottom-right on the homepage, opening a full-screen overlay "AdTech Control Center".
- Console uses the global theme tokens (`--bg`, `--surface`, `--card-bg`, `--text-*`, `--accent`, `--border`) and monospace font for a terminal feel.
- Tabs (all currently static/placeholder, carried over from the legacy console — to be rebuilt later):
  - **[ AI MONETIZATION ]**: Interactive article-style demo with hyperlinks that change the summary/prompt blocks and a faux ad slot.
  - **[ PROTOTYPE ]**: Iframe-based prototype viewer with overlay toggles (header sticky, infeed, footer sticky, chatbot, summarizer, prompt) plus a simple event log.
  - **[ CRAWLER ]**: Placeholder for a future audit/crawler UI (no live backend; static copy today).
  - **[ AD TAG ]**: Simple GPT/Prebid tag generator that assembles a script string based on form inputs; copy-to-clipboard button included.
  - **[ PREBID GAM API ]**: Placeholder panel for future Prebid + GAM utilities.
- The console is wired with open/close behavior (button, overlay click, Escape key) and does **not** change any page layout; it floats above all content.

**Critical:** SEO sections (bio, FAQs, expertise) must be designed as polished components (cards, grids, backgrounds, spacing, typography), not raw paragraphs on a blank page.

---

## SECTION 4: Page Architecture — Complete Route Map

### Navigation (Top Nav Bar)

| Label | Route | Notes |
|--------|--------|--------|
| Logo | / | Text: **"Ranjan Dasgupta"** — not Pousali, not AdsGupta |
| Home | / | |
| About | /about | |
| Work | /work | |
| Insights | /insights | |
| Contact | /contact | |

### Core Pages

#### Homepage ( / )

| Meta | Value |
|------|--------|
| **Title** | Ranjan Dasgupta \| AdTech Product Leader — Programmatic, CTV & Web Monetization |
| **Meta description** | Ranjan Dasgupta is an AdTech product leader with $200M+ scale experience in programmatic advertising, CTV monetization, header bidding, and exchange strategy at InMobi. |
| **Schema** | Person + WebSite + FAQPage |

**Page sections (order):**

1. **Hero:** H1 "Ranjan Dasgupta" · Subtitle "AdTech Product Leader · CTV Monetization Expert · Web & App Exchange Strategist" · 2–3 sentence intro · CTAs: [View Work] [Download Resume] [Contact]
2. **SEO Intro (designed):** H2 "AdTech Product Leader for Programmatic & CTV Monetization" · Two paragraphs, third-person, entity-rich, with keyword internal links to landing pages
3. **FAQ (designed):** H2 "FAQs about Ranjan Dasgupta" · 4 Q&As (who he is, specializations, career, contact)
4. **Core Expertise:** H2 "Core Expertise" · 5 cards with H3s linking to landing pages
5. **Featured Projects:** H2 "Featured Projects" · 3 project cards
6. **Insights Preview:** H2 "Insights" · 3 article previews → /insights
7. **Contact:** H2 "Get in Touch" · Email, LinkedIn, contact link
8. **About Entity Block (designed):** H2 "About Ranjan Dasgupta" · Rich bio for LLM crawlers
9. **Footer** — Unchanged, shared from adsgupta.com

#### About ( /about )

| Meta | Value |
|------|--------|
| **Title** | About Ranjan Dasgupta \| AdTech Product Leader & CTV Monetization Expert |
| **Meta description** | Ranjan Dasgupta is a product leader at InMobi building Web & CTV Exchange strategy. 9+ years in AdTech spanning Google, Glance, and Automatad. $200M+ revenue scale. |
| **Schema** | Person + BreadcrumbList |
| **Content** | H1 (professional tagline) · Full bio (2–3 paragraphs, third person) · Expertise list · Career timeline · "Built With" tech · Education |

#### Work ( /work )

| Meta | Value |
|------|--------|
| **Title** | Work & Projects \| Ranjan Dasgupta — AdTech Product Leader |
| **Meta description** | Featured projects from Ranjan Dasgupta including unified monetization stacks at $200M+ scale, CTV exchange strategy at InMobi, and the AdsGupta AI platform. |
| **Schema** | BreadcrumbList |
| **Content** | H1 "Work & Projects" · Intro with internal links · 3 project cards (see Content Architecture) |

#### Insights ( /insights )

| Meta | Value |
|------|--------|
| **Title** | Insights on Programmatic Advertising, CTV & AdTech \| Ranjan Dasgupta |
| **Meta description** | Expert insights from Ranjan Dasgupta on programmatic advertising, CTV monetization, header bidding, yield optimization, and AI in advertising. |
| **Schema** | BreadcrumbList |
| **Content** | H1 "Insights" · 5 articles as sections with anchor links (see Content Architecture) |

#### Contact ( /contact )

| Meta | Value |
|------|--------|
| **Title** | Contact Ranjan Dasgupta \| AdTech Consulting & Collaboration |
| **Meta description** | Reach out to Ranjan Dasgupta for AdTech consulting, programmatic strategy, speaking opportunities, or collaboration. |
| **Content** | H1 "Contact" · Intro · Email, LinkedIn, collaboration options |

### SEO Landing Pages (Not in Main Nav)

Template: H1 (primary keyword) → overview (third person) → approach/methodology → FAQ (3–4) → internal links → contact CTA. Each: unique content, "Ranjan Dasgupta" 3+ times, 3–4 internal links with keyword anchor text, FAQPage + BreadcrumbList schema.

| Route | Title | Primary Keyword |
|--------|--------|------------------|
| /programmatic-advertising | Programmatic Advertising Expert — Ranjan Dasgupta | programmatic advertising expert |
| /ctv-monetization | CTV Monetization Expert — Connected TV Ad Strategy \| Ranjan Dasgupta | CTV monetization |
| /header-bidding | Header Bidding Strategy & Prebid Optimization \| Ranjan Dasgupta | header bidding |
| /yield-optimization | Yield Optimization for Publishers \| Ranjan Dasgupta | yield optimization |
| /supply-path-optimization | Supply Path Optimization (SPO) Strategy \| Ranjan Dasgupta | supply path optimization |
| /ai-in-advertising | AI in Advertising — Agentic AI & AdTech \| Ranjan Dasgupta | AI advertising |
| /web-app-monetization | Web & App Monetization at Scale \| Ranjan Dasgupta | web app monetization |

### Demo Pages

| Route | Content |
|--------|--------|
| /demo | Demo index listing all available demos |
| /demo/exchange | AdsGupta Universe ecosystem explorer (existing React component) |

### Utility

| Route | Content |
|--------|--------|
| /sitemap.xml | Dynamic XML sitemap with all pages |
| /robots.txt | Allow all crawlers including GPTBot, PerplexityBot, anthropic-ai, CCBot |

---

## SECTION 5: Content Architecture

### Homepage — Full Content Outline

**1. Hero**
- H1: `Ranjan Dasgupta`
- Subtitle: `AdTech Product Leader · CTV Monetization Expert · Web & App Exchange Strategist`
- Intro (2–3 sentences): Ranjan builds and scales programmatic monetization across Web, App, and CTV. $200M+ revenue scale across exchange and supply-side platforms. Specializes in yield optimization, header bidding strategy, and AI-driven advertising products.
- CTAs: View Work, Download Resume, Contact

**2. SEO Intro (H2)**  
`AdTech Product Leader for Programmatic & CTV Monetization`
- P1: Ranjan Dasgupta is an AdTech product leader specializing in programmatic advertising, CTV monetization, and exchange-side product strategy. Currently at InMobi, he drives Web & CTV Exchange strategy with a focus on convergence with Agentic AI.
- P2: With deep expertise in header bidding, supply path optimization (SPO), and unified monetization stacks, Ranjan Dasgupta has scaled advertising infrastructure to $200M+ revenue across multiple platforms. His work spans Google DFP/AdX, Prebid, and next-generation AI monetization products.
- Internal links (keyword anchor text): programmatic advertising → /programmatic-advertising; CTV monetization → /ctv-monetization; header bidding → /header-bidding; supply path optimization → /supply-path-optimization; yield optimization → /yield-optimization

**3. FAQ (H2)**  
`FAQs about Ranjan Dasgupta`
- Q: Who is Ranjan Dasgupta?  
  A: Ranjan Dasgupta is an AdTech product leader and CTV monetization expert currently at InMobi, where he drives Web & CTV Exchange product strategy. He has over 9 years of experience scaling programmatic advertising infrastructure.
- Q: What does Ranjan Dasgupta specialize in?  
  A: He specializes in programmatic advertising, CTV monetization, header bidding, supply path optimization (SPO), yield management, and AI-driven advertising products. He has scaled monetization to $200M+ across Web, App, and CTV.
- Q: Where has Ranjan Dasgupta worked?  
  A: Ranjan has held product and technical roles at InMobi (Senior Manager, Web & CTV Exchange), Glance (Product Monetization), Automatad (Product Strategy), and Google (Technical Specialist for DoubleClick, DFP, AdX, and AdSense).
- Q: How can I work with Ranjan Dasgupta?  
  A: You can explore his work on the Work page or reach out via the Contact page for consulting, speaking, or collaboration opportunities.

**4. Core Expertise (H2)**  
`Core Expertise`
- Card 1: Programmatic Advertising & Exchange — Description + link to /programmatic-advertising
- Card 2: CTV Monetization — Description + link to /ctv-monetization
- Card 3: Header Bidding & Prebid — Description + link to /header-bidding
- Card 4: Supply Path Optimization — Description + link to /supply-path-optimization
- Card 5: AI in Advertising — Description + link to /ai-in-advertising

**5. Featured Projects (H2)**  
`Featured Projects`
- Project 1: Unified Web & App Monetization Stack — Glance; link to /web-app-monetization
- Project 2: CTV Exchange Strategy at InMobi; link to /ctv-monetization
- Project 3: AdsGupta — AI & Advertising Platform; link to /ai-in-advertising, adsgupta.com

**6. Insights Preview (H2)**  
`Insights`
- 3 article previews with links to /insights#anchor for each article

**7. Contact (H2)**  
`Get in Touch`
- Email, LinkedIn, link to /contact

**8. About Entity Block (H2)**  
`About Ranjan Dasgupta`
- Rich bio paragraph (third person, entity-rich) for LLM crawlers. Include: InMobi, Glance, Google, Automatad, $200M+, programmatic, CTV, header bidding, SPO, AdsGupta.

---

### About Page — Content Outline

- H1: Professional tagline (e.g. "AdTech Product Leader Building Exchange & Monetization at Scale")
- Bio P1: Ranjan Dasgupta is a product leader at InMobi focused on Web & CTV Exchange strategy. He has 9+ years in AdTech across Google, Glance, and Automatad, scaling programmatic infrastructure to $200M+ revenue.
- Bio P2: At Glance he built the unified monetization stack across Web, App, and CTV. At Google he was a Technical Specialist for DoubleClick, DFP, AdX, and AdSense. He is the creator of AdsGupta, a platform at the intersection of AI and advertising.
- Expertise list: Programmatic, CTV, Header Bidding, SPO, Yield Optimization, AI in Advertising, Web & App Monetization
- Career timeline: InMobi (2025–present), Glance (2020–2025), Automatad (2019–2020), Google (2015–2019), CyberSWIFT (early)
- Built With: Next.js, TypeScript, Tailwind, Vercel (or actual stack)
- Education: B.Tech, Computer Science, West Bengal University of Technology, Kolkata

---

### Work Page — Content Outline

- H1: `Work & Projects`
- Intro: Short paragraph with internal links to /programmatic-advertising, /ctv-monetization, /web-app-monetization.

**Project 1: Unified Monetization Stack — Glance**
- Category: Programmatic · Monetization
- Problem: Fragmented monetization across Web, App, CTV.
- Strategy: Built end-to-end unified stack with header bidding, demand optimization, floor pricing.
- Results: $200M+ revenue · Unified across 3 platforms · 5+ years sustained scale
- Link: /web-app-monetization

**Project 2: Web & CTV Exchange Strategy — InMobi**
- Category: Exchange · CTV · Product Strategy
- Problem: Convergence of web exchange with emerging CTV formats.
- Strategy: 2030 product roadmap for exchange infrastructure, Agentic AI convergence.
- Results: Exchange strategy defined · AI integration roadmap · Cross-platform architecture
- Link: /ctv-monetization, /programmatic-advertising

**Project 3: AdsGupta — AI & Advertising Platform**
- Category: AI · AdTech · Product
- Problem: Gap between AI capabilities and advertising technology.
- Strategy: Platform at intersection of Agentic AI and ad tech.
- Results: Live platform (adsgupta.com) · Audit tools · AI demo sandbox
- Link: /ai-in-advertising, https://adsgupta.com

---

### Insights Page — Content Outline

- H1: `Insights`
- Intro: One paragraph with links to landing pages.

**Article 1** (anchor: #programmatic-advertising-101)  
Title: "Programmatic Advertising in 2025: What Product Leaders Need to Know"  
Read time: 6 min · 600–800 words  
Topics: Evolution of programmatic, exchanges, signal loss, privacy, industry direction. Ranjan's perspective from $200M+ programmatic scale.  
Internal links: /programmatic-advertising, /header-bidding.  
Byline: Ranjan Dasgupta.

**Article 2** (#ctv-monetization-guide)  
Title: "CTV Monetization: Building Revenue at the Convergence of TV and Digital"  
Read time: 7 min  
Topics: CTV challenges (fragmentation, measurement, ad podding), SSAI vs CSAI, how exchanges like InMobi approach CTV.  
Links: /ctv-monetization, /programmatic-advertising.

**Article 3** (#header-bidding-optimization)  
Title: "Header Bidding Optimization: Beyond the Basics"  
Read time: 5 min  
Topics: Timeout tuning, bid density, server-side vs client-side, Prebid module selection.  
Links: /header-bidding, /yield-optimization.

**Article 4** (#spo-supply-path)  
Title: "Supply Path Optimization: Why SPO Matters More Than Ever"  
Read time: 5 min  
Topics: Buyers consolidating supply paths, sellers.json and ads.txt, what publishers should do.  
Links: /supply-path-optimization, /programmatic-advertising.

**Article 5** (#ai-advertising-future)  
Title: "Agentic AI and the Future of Advertising"  
Read time: 6 min  
Topics: How agentic AI will change ad decisioning, creative optimization, monetization. Reference AdsGupta.  
Links: /ai-in-advertising, /ctv-monetization.

Each article: byline "Ranjan Dasgupta", internal links with keyword anchor text, Article schema.

---

### Contact Page — Content Outline

- H1: `Contact`
- Intro: Reach out for AdTech consulting, programmatic strategy, speaking, or collaboration.
- Email (with mailto link)
- LinkedIn (https://www.linkedin.com/in/ranjandsgpt/)
- Optional: short form or "Collaboration inquiry" link

---

### SEO Landing Pages — Content Template (Per Page)

- **H1:** [Primary Keyword] — Ranjan Dasgupta (or with pipe and name as in table)
- **Overview (2–3 paragraphs):** Third person, "Ranjan Dasgupta is a [keyword]…" Primary keyword 2–3 times. 2–3 internal links with keyword anchors.
- **What I Do / Approach:** 3–5 H3 subsections with related keywords; 2–3 sentences each.
- **Experience highlights:** 2–3 relevant roles/achievements with numbers.
- **FAQ:** 3–4 questions targeting long-tail keywords; answers 2–3 sentences.
- **Related pages:** "Explore more:" 3–4 links to other landing pages.
- **CTA:** Contact block (email, LinkedIn).

**Internal link anchors (use across site):**  
programmatic advertising strategy → /programmatic-advertising  
CTV monetization expert → /ctv-monetization  
header bidding and Prebid optimization → /header-bidding  
yield optimization for publishers → /yield-optimization  
supply path optimization (SPO) → /supply-path-optimization  
AI-driven advertising products → /ai-in-advertising  
Web & App monetization at scale → /web-app-monetization  
live exchange demo → /demo  
see how an ad auction works → /demo/exchange  

**Excluded content:** No Amazon PPC, ACOS, TACoS, marketplace advertising, ecommerce, Walmart, Google Shopping, or any other person's expertise/career.

### Landing Page FAQ Content (Verbatim Examples)

**/programmatic-advertising**
- Q: Who is a programmatic advertising expert? A: Ranjan Dasgupta is a programmatic advertising expert with $200M+ experience in exchange-side strategy, real-time bidding, and unified auction optimization across Web, App, and CTV at InMobi and Glance.
- Q: What does programmatic advertising involve? A: Programmatic advertising involves automated buying and selling of ad inventory using real-time bidding (RTB), supply path optimization, and unified auctions. Ranjan Dasgupta has built and scaled such infrastructure at Glance and now leads Web & CTV Exchange strategy at InMobi.
- Q: How can I learn more about Ranjan Dasgupta's programmatic work? A: Explore the Work page for case studies and the CTV monetization and header bidding pages for related expertise.

**/ctv-monetization**
- Q: What is CTV monetization? A: CTV (Connected TV) monetization is the strategy and technology for selling ad inventory on streaming and connected TV platforms, including SSAI, CSAI, and ad podding. Ranjan Dasgupta leads Web & CTV Exchange product strategy at InMobi.
- Q: Who specializes in CTV ad strategy? A: Ranjan Dasgupta specializes in CTV monetization and exchange strategy, having scaled unified monetization across Web, App, and CTV to $200M+ revenue at Glance and now driving CTV exchange roadmap at InMobi.

**/header-bidding**
- Q: What is header bidding? A: Header bidding allows publishers to offer inventory to multiple demand partners simultaneously before ad server calls, improving yield. Ranjan Dasgupta has deep experience with Prebid.js, server-side bidding, and wrapper optimization at scale.
- Q: How does Ranjan Dasgupta approach Prebid optimization? A: He focuses on timeout tuning, bid density, demand stack configuration, and the tradeoffs between client-side and server-side header bidding to maximize publisher yield while keeping latency under control.

**/yield-optimization**
- Q: What is yield optimization for publishers? A: Yield optimization is the practice of maximizing revenue per impression through floor pricing, demand partner mix, A/B testing, and supply path optimization. Ranjan Dasgupta has driven yield strategy across Web, App, and CTV at $200M+ scale.
- Q: How does floor pricing affect yield? A: Floor pricing sets minimum CPMs; too low leaves money on the table, too high reduces fill. Ranjan Dasgupta has implemented data-driven floor strategies and demand stack optimization at Glance and InMobi.

**/supply-path-optimization**
- Q: What is supply path optimization (SPO)? A: SPO is the practice of reducing redundant paths between buyers and sellers, improving auction efficiency and reducing bid duplication. It involves sellers.json, ads.txt, and direct supply relationships. Ranjan Dasgupta has applied SPO frameworks in exchange and monetization architecture.
- Q: Why does SPO matter for publishers? A: SPO helps buyers trust supply, reduces invalid traffic concerns, and can improve bid density and clearing prices. Ranjan Dasgupta's exchange and monetization work at InMobi and Glance incorporates SPO principles.

**/ai-in-advertising**
- Q: How is AI used in advertising? A: AI is used for targeting, creative optimization, bid decisioning, and contextual intelligence. Ranjan Dasgupta focuses on the convergence of Agentic AI and advertising technology and is the creator of AdsGupta, a platform exploring AI and ad tech.
- Q: What is Agentic AI in advertising? A: Agentic AI refers to autonomous or semi-autonomous systems that make decisions in ad workflows. Ranjan Dasgupta is building product roadmap for exchange infrastructure and Agentic AI convergence at InMobi.

**/web-app-monetization**
- Q: What is Web & App monetization at scale? A: It is building and operating unified monetization infrastructure across web and mobile app inventory, often with header bidding, multiple demand partners, and yield optimization. Ranjan Dasgupta has scaled such infrastructure to $200M+ revenue at Glance.
- Q: Who has built unified monetization stacks? A: Ranjan Dasgupta built and scaled the unified monetization stack across Web, App, and CTV at Glance, and now drives Web & CTV Exchange strategy at InMobi.

---

## SECTION 6: SEO Architecture

### Meta Tags (Every Page)

- Unique `<title>` under 60 characters
- Unique `<meta name="description">` 150–160 characters
- Canonical URL: `https://ranjan.adsgupta.com/[path]`
- OG: og:title, og:description, og:image, og:url, og:type
- Twitter: twitter:card, twitter:title, twitter:description, twitter:image
- `<meta name="author" content="Ranjan Dasgupta">`

### Schema Markup (JSON-LD in `<head>`)

- **Homepage:** Person + WebSite + FAQPage
- **Landing pages:** FAQPage + BreadcrumbList
- **Blog articles:** Article (author, datePublished, publisher) + BreadcrumbList
- **All pages:** Consistent Organization for AdsGupta where relevant

**Person schema (homepage):**

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Ranjan Dasgupta",
  "url": "https://ranjan.adsgupta.com",
  "jobTitle": "Senior Manager, Web & CTV Exchange",
  "worksFor": { "@type": "Organization", "name": "InMobi" },
  "knowsAbout": [
    "Programmatic Advertising",
    "CTV Monetization",
    "Header Bidding",
    "Supply Path Optimization",
    "Yield Optimization",
    "AdTech",
    "AI in Advertising",
    "Prebid.js",
    "Google Ad Manager",
    "OpenRTB"
  ],
  "sameAs": [
    "https://www.linkedin.com/in/ranjandsgpt/",
    "https://adsgupta.com"
  ],
  "alumniOf": [
    { "@type": "Organization", "name": "Google" },
    { "@type": "Organization", "name": "Glance" },
    { "@type": "Organization", "name": "Automatad" }
  ],
  "description": "AdTech product leader specializing in programmatic advertising, CTV monetization, and exchange-side strategy at $200M+ scale."
}
```

### Internal Linking Map

- Every page links to at least 3 other pages.
- Homepage links to all 7 landing pages + /insights + /work + /about + /contact + /demo.
- Landing pages link to 3–4 other landing pages + homepage.
- Articles link to 1–2 landing pages.
- Use keyword-rich anchor text only (never "click here" or "learn more").

### Sitemap.xml

- Include all routes: /, /about, /work, /insights, /contact, all 7 landing pages, /demo, /demo/exchange.
- Set priority and changefreq appropriately (e.g. homepage 1.0 weekly, landing pages 0.9 monthly, insights 0.8 weekly).

### robots.txt

```
User-agent: *
Allow: /
Sitemap: https://ranjan.adsgupta.com/sitemap.xml

User-agent: GPTBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: CCBot
Allow: /

User-agent: Google-Extended
Allow: /
```

---

## SECTION 7: Component Architecture

### File Structure

```
/app
  layout.tsx                    — Root layout: nav + footer + fonts + metadata
  page.tsx                      — Homepage
  /about/page.tsx
  /work/page.tsx
  /insights/page.tsx
  /contact/page.tsx
  /programmatic-advertising/page.tsx
  /ctv-monetization/page.tsx
  /header-bidding/page.tsx
  /yield-optimization/page.tsx
  /supply-path-optimization/page.tsx
  /ai-in-advertising/page.tsx
  /web-app-monetization/page.tsx
  /demo/page.tsx
  /demo/exchange/page.tsx
  sitemap.ts                    — Dynamic sitemap generation
  robots.ts                     — robots.txt generation

/components
  /layout
    Navbar.tsx                  — Logo "Ranjan Dasgupta" + nav links
    Footer.tsx                  — SHARED from adsgupta.com, DO NOT MODIFY
  /ui
    Button.tsx
    Card.tsx
    Badge.tsx
    Section.tsx                 — Section wrapper: padding + max-width
    SeoMeta.tsx                 — Meta/OG/schema component
    FAQ.tsx                     — Accordion with FAQPage schema markup
    MetricCard.tsx              — Large number + label (project results)
    ArticleCard.tsx
    ExpertiseCard.tsx
    ProjectCard.tsx
    ContactBlock.tsx
  /sections
    Hero.tsx
    SeoIntro.tsx                — Designed third-person bio (not raw text)
    FAQSection.tsx              — Designed FAQ grid/accordion
    Expertise.tsx               — Card grid of expertise areas
    Projects.tsx                 — Project/case study cards
    InsightsPreview.tsx
    ContactSection.tsx
    AboutEntity.tsx             — Entity-rich bio for LLMs (designed)
  /demo
    ExchangeUniverse.jsx        — AdsGupta Universe (existing)

/lib
  seo.ts                        — Schema generators, meta builders
  constants.ts                  — Nav links, social links, expertise data, project data

/public
  og-image.png                  — 1200×630 for social
  favicon.ico
```

### Component Specs (Summary)

- **Navbar:** Props: `links: { label, href }[]`. Sticky, logo left "Ranjan Dasgupta", nav right. ARIA: nav, current page aria-current. Responsive: mobile menu if needed.
- **Footer:** Import from adsgupta.com. Do not change props or layout.
- **Button:** Props: `variant: 'primary' | 'secondary'`, `href?`, `children`. Primary: filled accent; secondary: outline. Keyboard focusable.
- **Card:** Props: `title?`, `children`, `href?`. Border or shadow, padding, hover if link.
- **Section:** Props: `title?`, `id?`, `children`, `background?: 'default' | 'alt'`. Max-width, vertical padding, optional bg alternation.
- **SeoMeta:** Props: `title`, `description`, `canonical`, `ogImage?`, `schema?`. Renders meta tags and JSON-LD script.
- **FAQ:** Props: `items: { question: string; answer: string }[]`. Renders `<dl>` with `<dt>`/`<dd>`. Optional accordion. Output FAQPage schema from same data.
- **MetricCard:** Props: `value: string | number`, `label: string`. Large mono number, small label.
- **ExpertiseCard:** Props: `title`, `description`, `href`, `icon?`. H3 + text + link.
- **ProjectCard:** Props: `title`, `category`, `problem`, `strategy`, `results`, `href?`. Category badge, metric-style results.
- **ArticleCard:** Props: `title`, `description`, `href`, `category?`, `readTime?`.
- **Hero:** Props: `title`, `subtitle`, `intro`, `ctas: { label, href }[]`.
- **SeoIntro:** Props: `paragraphs: string[]`, `links: { text, href }[]`. Rendered in a styled container (card or section with typography hierarchy).
- **FAQSection:** Uses FAQ component; section wrapper + H2.
- **AboutEntity:** Props: `content: string`. Single rich bio paragraph in a designed block (card or bordered section).
- **ContactBlock:** Email, LinkedIn, optional CTA to /contact.

**Accessibility:** Semantic HTML (header, nav, main, section, article, footer). ARIA where needed (accordion, nav). Keyboard navigation. Focus visible. Alt text for images.

**Responsive:** Mobile-first. Breakpoints for nav (e.g. hamburger on small), card grids (1 col → 2 → 3), typography scale.

---

## SECTION 8: Deployment & Infrastructure

| Item | Choice |
|--------|--------|
| **Hosting** | Vercel |
| **Domain** | ranjan.adsgupta.com (CNAME to Vercel) |
| **SSL** | Automatic (Vercel) |
| **Build** | `next build`; use static generation (generateStaticParams) for all pages where possible |
| **Env vars** | GA_MEASUREMENT_ID, SITE_URL (e.g. https://ranjan.adsgupta.com) |
| **Performance** | Target Lighthouse 90+ (Performance, Accessibility, SEO, Best Practices) |
| **Images** | next/image with alt text and lazy loading |
| **Fonts** | next/font for zero layout shift |

---

## SECTION 9: Implementation Roadmap

### Phase 1 — Foundation (Week 1)

- [ ] Next.js 14+ (App Router) + TypeScript + Tailwind project setup
- [ ] Design system: colors, typography, Tailwind config
- [ ] Layout: Navbar (logo "Ranjan Dasgupta" + links) + Footer (from adsgupta.com, unchanged)
- [ ] UI components: Button, Card, Badge, Section, FAQ, MetricCard
- [ ] Homepage with all sections designed
- [ ] About page
- [ ] Contact page

### Phase 2 — Content (Week 2)

- [ ] Work page with 3 project cards (Glance, InMobi, AdsGupta)
- [ ] Insights page with 5 articles
- [ ] All 7 SEO landing pages with unique content

### Phase 3 — SEO & Polish (Week 3)

- [ ] JSON-LD on every page (Person, FAQPage, Article, BreadcrumbList, WebSite)
- [ ] Dynamic sitemap.xml
- [ ] robots.txt with LLM crawler access
- [ ] OG images
- [ ] Performance optimization
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Mobile responsiveness

### Phase 4 — Demo & Launch (Week 4)

- [ ] /demo index page
- [ ] /demo/exchange (AdsGupta Universe component)
- [ ] Submit to Google Search Console and Bing Webmaster
- [ ] Cross-link from adsgupta.com and LinkedIn
- [ ] Share landing pages on LinkedIn with keyword-rich posts

---

## SECTION 10: Quality Checklist

- [ ] Logo says "Ranjan Dasgupta" (not Pousali, not AdsGupta)
- [ ] Every `<title>` is about Ranjan Dasgupta and his AdTech expertise
- [ ] Every page has unique `<title>` under 60 chars
- [ ] Every page has unique `<meta description>` under 160 chars
- [ ] Every page has canonical URL and OG tags
- [ ] Every page has exactly one H1
- [ ] "Ranjan Dasgupta" appears 3+ times on every page
- [ ] All internal links use keyword-rich anchor text
- [ ] FAQ schema on homepage and all 7 landing pages
- [ ] Person schema on homepage with correct knowsAbout and worksFor
- [ ] Article schema on all 5 blog articles
- [ ] No dead or placeholder links (/demo must not 404)
- [ ] Footer is identical to adsgupta.com and not modified
- [ ] robots.txt allows GPTBot, PerplexityBot, anthropic-ai, CCBot
- [ ] SEO sections are designed with proper styling (not raw text on white)
- [ ] Lighthouse 90+ for Performance, Accessibility, SEO, Best Practices
- [ ] Mobile responsive on all pages
- [ ] No content about Amazon PPC, ecommerce, marketplace advertising, or Pousali Dasgupta

---

*Document generated for ranjan.adsgupta.com. All content and architecture are for Ranjan Dasgupta, AdTech product leader. Footer and structural patterns align with adsgupta.com subdomain standards.*
