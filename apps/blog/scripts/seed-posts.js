/**
 * Seed 100 blog posts into the CMS (SQLite).
 * Run from project root: node scripts/seed-posts.js
 * Categories: Neural Philosophical, Marketplace Protocols, AdTech Infrastructure,
 * Revenue Engineering, Programmatic Strategy, Media Buying Systems.
 */

const path = require("path");
const Database = require("better-sqlite3");
const bcrypt = require("bcryptjs");
const fs = require("fs");

const dir = path.join(process.cwd(), ".data");
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
const dbPath = path.join(dir, "adsgupta-blog.db");
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// Ensure schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT UNIQUE NOT NULL, password TEXT NOT NULL, created_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, content TEXT NOT NULL, excerpt TEXT, source TEXT, category TEXT, external_url TEXT, publish_date TEXT, status TEXT DEFAULT 'draft', reading_time INTEGER, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')));
  CREATE TABLE IF NOT EXISTS monetization (id INTEGER PRIMARY KEY AUTOINCREMENT, script TEXT NOT NULL, position TEXT DEFAULT 'after_paragraph_3', created_at TEXT DEFAULT (datetime('now')));
`);
const adminExists = db.prepare("SELECT 1 FROM users WHERE email = ?").get("ranjan@adsgupta.com");
if (!adminExists) {
  const hash = bcrypt.hashSync("ranjan@123", 10);
  db.prepare("INSERT INTO users (email, password) VALUES (?, ?)").run("ranjan@adsgupta.com", hash);
}

const CATEGORIES = [
  "Neural Philosophical",
  "Marketplace Protocols",
  "AdTech Infrastructure",
  "Revenue Engineering",
  "Programmatic Strategy",
  "Media Buying Systems",
];

function slugify(text) {
  return String(text).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 120);
}

// Paragraphs pool for 1200–2000 word articles (programmatic / ad-tech themed)
const PARAGRAPHS = [
  "Programmatic advertising has transformed how brands reach audiences at scale. Real-time bidding (RTB) and supply-side platforms (SSPs) have created an ecosystem where impressions are bought and sold in milliseconds, with machine learning optimizing for outcomes rather than mere reach.",
  "Header bidding emerged as a response to the waterfall limitations of the early programmatic era. By allowing multiple demand partners to compete simultaneously before the ad server call, publishers unlocked higher CPMs and more transparent auction dynamics.",
  "The cookieless future is not a distant scenario—it is already reshaping identity resolution and attribution. First-party data, contextual signals, and privacy-preserving technologies like FLoC and Topics are becoming the new currency of digital advertising.",
  "Ad exchange mechanics sit at the heart of programmatic. Understanding bid streams, clearing prices, and win rates is essential for both publishers seeking yield and advertisers seeking efficient reach.",
  "Auction dynamics in open RTB follow a second-price logic in many cases, but first-price auctions have gained traction. The shift has forced buyers to rethink bid shading and has increased transparency in what they actually pay.",
  "Media buying optimization today relies on a stack of DSPs, DMPs, and activation platforms. The convergence of creative and media—dynamic creative optimization (DCO)—allows messaging to adapt in real time to audience and context.",
  "AdTech infrastructure—from ad servers to data pipelines—must scale to handle billions of events per day. Latency, data quality, and fraud detection are table stakes for any serious platform.",
  "Revenue engineering for publishers means balancing direct sales, programmatic guaranteed, and open auction. Yield management and floor pricing strategies directly impact fill rates and overall revenue.",
  "Neural and AI-driven bidding is moving beyond rule-based bidding. Predictive models that ingest contextual and behavioral signals are beginning to set bids at the impression level, closing the loop between data and execution.",
  "Marketplace protocols for retail media—Amazon, Walmart, and others—differ from the open web. Closed ecosystems, first-party purchase data, and sponsored product auctions require specialized strategies and measurement.",
  "Open web identity is fragmenting. Solutions range from authenticated environments and clean rooms to probabilistic matching and cohort-based targeting. The industry is coalescing around privacy-first frameworks.",
  "Supply-path optimization (SPO) lets buyers reduce waste and improve transparency by choosing the most direct and efficient paths to inventory. Throttling low-quality or redundant paths can lift performance and reduce cost.",
  "Viewability and attention metrics are evolving beyond served impressions. Brands and publishers are experimenting with attention-based buying and selling, aligning incentives with human attention rather than raw delivery.",
  "The shift to first-price auctions across major exchanges has made bid strategy more critical. Advertisers must continuously calibrate bids to avoid overpaying while still winning enough inventory to hit reach and frequency goals.",
  "Creative fatigue and frequency capping are classic problems that ML can address. By varying creative and pacing delivery, systems can maintain performance while reducing waste and improving user experience.",
  "Retail media networks represent one of the fastest-growing channels. The ability to target shoppers by intent and past purchase, and to measure closed-loop sales, makes retail media a key part of the performance marketer's toolkit.",
  "Data clean rooms enable collaboration between brands and publishers without sharing raw PII. They support attribution, audience overlap analysis, and activation in a privacy-compliant way.",
  "Unified ID 2.0 and other identity initiatives aim to create a common, consent-based identifier for the open web. Adoption will determine how much addressability remains outside walled gardens.",
  "CTV and streaming inventory are growing rapidly. Programmatic guaranteed and private marketplaces are common, and measurement is evolving to include incrementality and brand lift alongside reach.",
  "The future of programmatic lies in the convergence of automation, identity, and creativity. Systems that can plan, buy, optimize, and attribute across channels with minimal manual intervention will define the next decade.",
];

function pick(arr, n) {
  const out = [];
  for (let i = 0; i < n; i++) out.push(arr[Math.floor(Math.random() * arr.length)]);
  return out;
}

function generateArticle(title, category, source = "AdsGupta") {
  const numParas = 12 + Math.floor(Math.random() * 8);
  const selected = pick(PARAGRAPHS, numParas);
  const intro = `<p>${title} is a defining theme in today's advertising landscape. This essay explores how practitioners and platforms are adapting.</p>`;
  const body = selected.map((p) => `<p>${p}</p>`).join("\n");
  const close = `<p>The intersection of data, automation, and creativity will continue to shape ${category.toLowerCase()} and the wider AdTech ecosystem. Those who invest in infrastructure and strategy today will lead tomorrow.</p>`;
  return intro + "\n" + body + "\n" + close;
}

const TITLES = [
  "Programmatic Advertising in the Next Decade",
  "Header Bidding and the Future of Publisher Yield",
  "Auction Dynamics: First-Price vs Second-Price",
  "Ad Exchange Mechanics Every Trader Should Know",
  "The Cookieless Future and Identity Resolution",
  "Media Buying Optimization with Machine Learning",
  "AdTech Infrastructure at Scale",
  "Revenue Engineering for Modern Publishers",
  "Neural Bidding and Predictive Ad Buying",
  "Marketplace Protocols: Amazon and Retail Media",
  "Open Web Identity After Third-Party Cookies",
  "Supply-Path Optimization and Transparency",
  "Viewability and Attention-Based Buying",
  "Creative Fatigue and Frequency in Programmatic",
  "Retail Media Networks and Closed-Loop Measurement",
  "Data Clean Rooms and Privacy-Safe Activation",
  "Unified ID 2.0 and the Open Web",
  "CTV and Streaming: Programmatic's Next Frontier",
  "From Waterfall to Header Bidding",
  "Bid Shading in First-Price Auctions",
  "DCO: When Creative Meets Programmatic",
  "Publisher Yield Management Best Practices",
  "The Role of DSPs in Modern Media Buying",
  "Fraud Detection in the Programmatic Supply Chain",
  "Contextual Targeting in a Post-Cookie World",
  "Retail Media vs Open Web: Strategy Notes",
  "Latency and Performance in Real-Time Bidding",
  "Attribution and Incrementality in Programmatic",
  "Private Marketplaces and Deal IDs",
  "Neural Systems and Auction Graph Theory",
  "Identity Graphs and Probabilistic Matching",
  "Floor Pricing and Reserve Prices",
  "Creative Optimization at the Impression Level",
  "Walled Gardens and the Open Internet",
  "SPO and Path Efficiency",
  "Brand Safety and Suitability in Programmatic",
  "The Convergence of TV and Digital",
  "Consent and Privacy in Programmatic",
  "Demand-Side Platforms: Evolution and Selection",
  "Supply-Side Platforms and Header Bidding",
  "Real-Time Bidding: A Technical Overview",
  "Cohort-Based Targeting and FLoC",
  "Measurement and MMM in Programmatic",
  "Direct Deals and Programmatic Guaranteed",
  "Open Auction Economics",
  "Machine Learning for Bid Optimization",
  "Publishers and the First-Party Data Advantage",
  "Ad Verification and Viewability",
  "The Future of Programmatic Creative",
  "Cross-Device and Cross-Environment Buying",
  "Programmatic Strategy for Mid-Market Brands",
  "Header Bidding 2.0 and Prebid",
  "Auction Mechanics and Clearing Prices",
  "Identity Resolution Without Cookies",
  "Yield Optimization for Publishers",
  "DSP and Agency Trading Desks",
  "Data Management Platforms in 2025",
  "Retail Media Measurement Standards",
  "Creative Sequencing and Storytelling",
  "Blockchain and Ad Transparency",
  "In-App Programmatic and Mobile",
  "Video and CTV Programmatic",
  "Native Advertising and Programmatic",
  "Programmatic Out-of-Home",
  "Audience Extension and Lookalikes",
  "Frequency and Reach Optimization",
  "Brand Lift in Programmatic Campaigns",
  "The Economics of Ad Exchanges",
  "Pricing Models: CPM, CPC, CPA in Programmatic",
  "Multi-Touch Attribution in RTB",
  "Creative Testing at Scale",
  "Publishers and Header Bidding Setup",
  "Demand Path Optimization",
  "Transparency and Fee Disclosure",
  "Programmatic and Brand Safety",
  "Contextual Signals and Targeting",
  "First-Party Data Strategy",
  "Programmatic Guaranteed Deals",
  "Private Auctions and PMPs",
  "Bid Request and Bid Response Flow",
  "Ad Serving and Decisioning",
  "Real-Time Reporting and Analytics",
  "Budget Pacing in Programmatic",
  "Targeting and Audience Segments",
  "Geographic and Demographic Targeting",
  "Device and Environment Targeting",
  "Time-of-Day and Dayparting",
  "Creative Rotation Strategies",
  "Landing Page and Conversion Optimization",
  "Programmatic and SEO Synergies",
  "The Role of Ad Tech in Martech",
  "Consolidation in the Ad Tech Space",
  "Independent vs Walled Garden Inventory",
  "Premium vs Remnant Inventory",
  "Programmatic Direct and Automated Guaranteed",
  "Deal ID Best Practices",
  "Negotiating Programmatic Deals",
  "Fraud and Invalid Traffic",
  "Brand Safety Tools and Vendors",
  "Viewability Standards and MRC",
  "Ad Blocking and Programmatic",
  "Regulation and Privacy Laws",
  "GDPR and Programmatic in Europe",
  "CCPA and US Privacy",
  "Consent Management Platforms",
  "The Future of Addressability",
  "Neural Engine and Auction Intelligence",
  "From Segments to Paths: Neural Pathing",
  "Predictive Creative and the Auction Graph",
];

const insert = db.prepare(`
  INSERT INTO posts (title, slug, content, excerpt, source, category, external_url, publish_date, status, reading_time)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

let used = new Set();
const startDate = new Date("2024-01-01");
for (let i = 0; i < 100; i++) {
  const title = TITLES[i % TITLES.length];
  let slug = slugify(title);
  if (used.has(slug)) slug = slug + "-" + (i + 1);
  used.add(slug);
  const category = CATEGORIES[i % CATEGORIES.length];
  const content = generateArticle(title, category);
  const wordCount = content.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  const reading_time = Math.max(1, Math.ceil(wordCount / 220));
  const excerpt = content.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) + "…";
  const publish_date = new Date(startDate);
  publish_date.setDate(publish_date.getDate() + i);
  const publishStr = publish_date.toISOString().slice(0, 10);
  insert.run(
    title,
    slug,
    content,
    excerpt,
    "AdsGupta",
    category,
    "",
    publishStr,
    "published",
    reading_time
  );
  console.log(`Inserted ${i + 1}/100: ${slug}`);
}

db.close();
console.log("Seed complete. 100 posts in database.");
