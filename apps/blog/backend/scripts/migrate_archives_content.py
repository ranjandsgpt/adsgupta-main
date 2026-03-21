"""
Content Migration Script - The Archives
Ingests LinkedIn and Blogspot articles into archives_content collection
"""
import asyncio
from datetime import datetime, timezone
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import uuid

# MongoDB connection
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

# Articles to ingest with original publication dates and categories
ARTICLES_TO_INGEST = [
    # LinkedIn Articles - "I was born an Ad" series (Neural Philosophical)
    {
        "title": "If I was born as an Ad (Part 1)",
        "source_tag": "linkedin",
        "category": "neural-philosophical",
        "publish_date": "2019-06-08",  # Original publication
        "external_url": "https://www.linkedin.com/pulse/i-born-ad-ranjan-dasgupta-dreaming-programmatic/",
        "content": """<p>If I was born as an ad, how I would look like and what would have been the Media Planning before my creation and optimization after my birth:</p>

<h2>Introduction</h2>
<p>Hello! My name is Ranjan Ads-gupta, an interactive AI-powered ad unit with in-built Machine Learning, NLP, brand safety, and fraud detection technology.</p>

<p>I was originally trained to thrive on cookies and deterministic identifiers, but the world changed. Privacy regulations, ad-blockers, and walled gardens forced me to adapt.</p>

<p>Now, I no longer rely on cookies to find my audience. Instead, I use:</p>
<ul>
<li>✅ Contextual & AI-driven targeting to understand user intent in real-time.</li>
<li>✅ CTV and retail media integrations to serve on premium, high-attention platforms.</li>
<li>✅ Attention & engagement-based metrics instead of just clicks and views.</li>
<li>✅ Server-side tracking (SSAI) & clean-room solutions to ensure privacy compliance.</li>
</ul>

<p>I am no longer just a web banner or a display ad. I have evolved into a multi-platform monetization engine—thriving in a world where cookies are crumbling, privacy laws are tightening, and measurement is shifting.</p>

<h2>Objective and the Behind Story</h2>
<p>I was created in Feb 1993 by two humans (father: Quality lead in XYZ, mother: teacher), much like an ad launched by an ad-tech company trying to optimize performance in a fast-changing ecosystem.</p>

<p>However, as privacy laws evolved and third-party cookies started disappearing, I had to rethink my strategy.</p>

<h2>What's Next for Me?</h2>
<p>I am still learning & evolving, adapting to the future of programmatic, CTV, and AI-driven monetization.</p>
<ul>
<li>📌 CTV will dominate as ad budgets shift away from web & mobile.</li>
<li>📌 AI will drive more precise yield optimization & contextual relevance.</li>
<li>📌 Measurement will become privacy-safe, using attention & engagement metrics over traditional click-based tracking.</li>
<li>📌 Retail media will grow as brands look for first-party data alternatives.</li>
</ul>

<p>The programmatic world is shifting fast, and I am at the center of it—continuously optimizing, adapting, and evolving.</p>

<p><em>Conceptualized & written by Ranjan in 2019</em></p>"""
    },
    {
        "title": "If I was born as an Ad (Part 2)",
        "source_tag": "linkedin",
        "category": "neural-philosophical",
        "publish_date": "2024-04-04",
        "external_url": "https://www.linkedin.com/pulse/i-born-ad-part-2-ranjan-dasgupta-jau1c/",
        "content": """<p>Continuing after 'Optimization'...</p>

<h2>Performance Analysis: The Evolution of Ad Measurement</h2>
<p>By now, I had grown. I wasn't just serving impressions anymore—I was being measured, analyzed, and optimized in ways that would have seemed impossible in my early days.</p>

<p>The metrics that defined my success evolved alongside the industry:</p>
<ul>
<li>From simple <strong>click-through rates</strong> to <strong>attention metrics</strong></li>
<li>From <strong>last-click attribution</strong> to <strong>multi-touch models</strong></li>
<li>From <strong>viewability</strong> to <strong>time-in-view</strong> and <strong>engagement scores</strong></li>
</ul>

<p>The shift to privacy-first measurement forced everyone—publishers, advertisers, and ad tech—to rethink what "success" really means in advertising.</p>

<h2>The Cookieless Transition</h2>
<p>When Chrome announced the death of third-party cookies (albeit delayed), I knew my survival depended on adaptation. First-party data became gold. Contextual targeting made a comeback. And clean rooms emerged as the bridge between privacy and precision.</p>

<p>To be continued...</p>"""
    },
    {
        "title": "If I was born as an Ad (Part 3): The AI Takeover",
        "source_tag": "linkedin",
        "category": "neural-philosophical",
        "publish_date": "2025-02-17",
        "external_url": "https://www.linkedin.com/pulse/i-born-ad-part-3-ai-takeover-ranjan-dasgupta-vcbsc/",
        "content": """<h2>The Day I Became a Mirror Ad</h2>
<p>At first, I was just a simple display ad, trying to survive in an ever-changing ecosystem. But then something extraordinary happened—AI didn't just optimize me, it transformed me.</p>

<p>I became a <strong>Mirror Ad</strong>—an ad that reflects the viewer's intent, context, and emotional state in real-time.</p>

<h2>The Neural Shift</h2>
<p>Traditional targeting asked: "Who is this user?"</p>
<p>AI-driven targeting asks: "What does this user need right now?"</p>

<p>The difference is profound. Instead of serving based on historical data and demographic assumptions, I now serve based on:</p>
<ul>
<li>Real-time contextual signals</li>
<li>Semantic understanding of content</li>
<li>Predictive intent modeling</li>
<li>Attention-aware creative optimization</li>
</ul>

<p>This is the neural advertising revolution—where the ad becomes intelligent, adaptive, and genuinely useful.</p>"""
    },
    {
        "title": "If I Was Born as an Ad and Grown as a System (Part 4.1)",
        "source_tag": "linkedin",
        "category": "neural-philosophical",
        "publish_date": "2026-02-03",
        "external_url": "https://www.linkedin.com/pulse/i-born-ad-grown-system-part-41-ranjan-dasgupta-uii4c/",
        "content": """<h2>Chapter 1: The Cannibal Phase</h2>
<p><em>We are decorating the exit while the house is on fire.</em></p>

<p>I was born as an Ad to live on a publisher's page. But somewhere along the way, the industry forgot that without publishers, there are no pages. Without pages, there are no ads. Without ads, there is no ecosystem.</p>

<p>The race to the bottom in CPMs, the arbitrage-driven supply paths, the endless intermediaries taking cuts—we've been cannibalizing the very foundation that sustains us.</p>

<h2>The Reckoning</h2>
<p>As I evolved, I realized that sustainable advertising requires a fundamental shift:</p>
<ul>
<li>Publishers must be partners, not just inventory sources</li>
<li>Quality must trump quantity in impression counting</li>
<li>Transparency must replace the black-box mentality</li>
<li>Value creation must supersede value extraction</li>
</ul>

<p>The next phase of my evolution isn't just about better targeting—it's about building a better ecosystem.</p>"""
    },
    {
        "title": "If I Was Born as an Ad and Grown as a System (Part 4.2)",
        "source_tag": "linkedin",
        "category": "neural-philosophical",
        "publish_date": "2026-02-03",
        "external_url": "https://www.linkedin.com/pulse/i-born-ad-grown-system-part-42-ranjan-dasgupta-hiedc/",
        "content": """<h2>Chapter 2: The Transactional Pivot</h2>
<p><strong>Stop selling "Impressions." Start selling "Checkouts."</strong></p>

<p>The future of advertising isn't about how many times I'm seen—it's about how many transactions I enable. The shift from awareness metrics to commerce metrics is the most significant evolution in ad measurement since programmatic began.</p>

<h2>The Commerce Layer</h2>
<p>Retail media networks have shown us the path. When ads are directly tied to purchase data, everyone wins:</p>
<ul>
<li>Advertisers get true ROI visibility</li>
<li>Publishers capture more value from their audience</li>
<li>Consumers see more relevant, shoppable content</li>
</ul>

<p>I am no longer just an ad—I am a commerce enabler, a transaction facilitator, a direct line between intent and action.</p>"""
    },
    
    # LinkedIn Articles - Marketplace Protocols
    {
        "title": "Anticipating The Future of Mobile Lockscreen!",
        "source_tag": "linkedin",
        "category": "marketplace-protocols",
        "publish_date": "2025-04-03",
        "external_url": "https://www.linkedin.com/pulse/anticipating-future-mobile-lockscreen-ranjan-dasgupta-rx7xc/",
        "content": """<p><em>August 2023</em></p>
<p>Over the past few years, I've been immersed in the evolution of the Android lockscreen—a surface once considered dead real estate that's now becoming one of the most valuable pieces of digital advertising inventory.</p>

<h2>The Lockscreen Opportunity</h2>
<p>Consider the numbers: The average smartphone user checks their phone 96 times per day. That's 96 moments of attention on the lockscreen before anything else loads.</p>

<p>Unlike in-app or browser advertising where users are task-focused, the lockscreen catches users in transition moments—when they're most open to discovery and engagement.</p>

<h2>The Technical Evolution</h2>
<p>The shift from static wallpapers to dynamic, personalized content surfaces opens new possibilities:</p>
<ul>
<li>Contextual widgets that adapt to time, location, and user behavior</li>
<li>Glanceable content that respects the 3-second attention window</li>
<li>Native integration with device AI for predictive personalization</li>
</ul>

<p>This is the next frontier of mobile monetization.</p>"""
    },
    {
        "title": "The CTV AdTech Revolution: Where TV Meets the Future of Advertising",
        "source_tag": "linkedin",
        "category": "marketplace-protocols",
        "publish_date": "2025-03-20",
        "external_url": "https://www.linkedin.com/pulse/ctv-adtech-revolution-where-tv-meets-future-ranjan-dasgupta-e1hlc/",
        "content": """<p>Imagine this: You sit down on your couch, grab your remote, and fire up your smart TV. Instead of flipping through channels like your parents did, you're navigating a universe of streaming apps, each one vying for your attention with personalized content recommendations.</p>

<p>Welcome to the CTV revolution—where television meets the precision of digital advertising.</p>

<h2>The Convergence Moment</h2>
<p>For decades, TV advertising and digital advertising existed in parallel universes:</p>
<ul>
<li>TV had reach but lacked targeting precision</li>
<li>Digital had data but struggled with brand safety and viewability</li>
</ul>

<p>CTV bridges these worlds, offering the brand-safe, attention-commanding environment of television with the targeting capabilities, measurement precision, and programmatic efficiency of digital.</p>

<h2>The Measurement Revolution</h2>
<p>Perhaps the most exciting development is how CTV is forcing the industry to rethink measurement:</p>
<ul>
<li>From impressions to attention time</li>
<li>From estimated reach to deterministic household targeting</li>
<li>From last-click attribution to cross-screen journey mapping</li>
</ul>

<p>The big screen is becoming the smart screen—and the advertising industry will never be the same.</p>"""
    },
    {
        "title": "Revenue: The Business of Staying Alive",
        "source_tag": "linkedin",
        "category": "marketplace-protocols",
        "publish_date": "2024-12-13",
        "external_url": "https://www.linkedin.com/pulse/revenue-ranjan-dasgupta-hj1ge/",
        "content": """<p><em>#Revenue, jo har business ki jaan hai,</em><br>
<em>Puri zindagi bigaad di isne, aur bacha bhi liya</em><br>
<em>Dhande ki value creation hai yeh...</em></p>

<p>Revenue isn't just a number on a spreadsheet—it's the lifeblood of every business, the oxygen that keeps teams employed, products developed, and dreams alive.</p>

<h2>The Revenue Mindset</h2>
<p>In my years in ad-tech, I've learned that sustainable revenue comes from understanding one simple truth: you can't extract value faster than you create it.</p>

<p>The best monetization strategies aren't about maximizing short-term gains—they're about building relationships, creating genuine value, and establishing trust that compounds over time.</p>

<h2>The Three Pillars</h2>
<ul>
<li><strong>Value Creation:</strong> What problem are you solving? What need are you meeting?</li>
<li><strong>Value Communication:</strong> Can your customers understand and articulate why they pay you?</li>
<li><strong>Value Capture:</strong> Are you capturing a fair share of the value you create?</li>
</ul>

<p>Master these three, and revenue follows.</p>"""
    },
    {
        "title": "Yes, you! Are you a Publisher? Your potential revenue might drop by 52%!",
        "source_tag": "linkedin",
        "category": "marketplace-protocols",
        "publish_date": "2019-10-23",
        "external_url": "https://www.linkedin.com/pulse/yes-you-publisher-your-potential-revenue-might-drop-ranjan/",
        "content": """<p>Publishers' potential revenue drops by 52% when 3rd party cookies are removed from the equation, according to research by Google.</p>

<p>This isn't a distant future scenario—it's happening now.</p>

<h2>The Cookie Crumble</h2>
<p>Third-party cookies have been the backbone of digital advertising targeting and measurement for over two decades. They enabled:</p>
<ul>
<li>Cross-site user identification</li>
<li>Behavioral targeting and retargeting</li>
<li>Attribution and conversion tracking</li>
<li>Frequency capping across campaigns</li>
</ul>

<h2>The Publisher's Dilemma</h2>
<p>For publishers, the death of third-party cookies creates an existential challenge: How do you maintain ad revenue when advertisers can no longer target and measure with the precision they've grown accustomed to?</p>

<h2>The Path Forward</h2>
<p>Publishers who thrive in the cookieless future will be those who invest in:</p>
<ul>
<li>First-party data strategies and registration walls</li>
<li>Contextual targeting capabilities</li>
<li>Direct advertiser relationships</li>
<li>Privacy-compliant identity solutions</li>
</ul>

<p>The cookie apocalypse is also an opportunity—for publishers willing to adapt.</p>"""
    },
    {
        "title": "...But I'm Not Wrong! (Dreaming Programmatic 4 Years)",
        "source_tag": "linkedin",
        "category": "marketplace-protocols",
        "publish_date": "2019-06-05",
        "external_url": "https://www.linkedin.com/pulse/im-wrong-ranjan-dasgupta-dreaming-programmatic-4-years/",
        "content": """<p>So, I did something wrong! But I'm happy!</p>

<p>Yes, I've made a transition in my career: From Free Food to PG Food (Paying Guest/hostel days recalled!).</p>

<h2>Four Years in Programmatic</h2>
<p>When I started in programmatic advertising four years ago, I was told I was making a mistake. "It's too technical," they said. "The industry is too volatile." "You should stick with traditional advertising."</p>

<p>They weren't entirely wrong—programmatic IS technical, the industry IS volatile. But they missed the bigger picture: this is where advertising is going, whether we like it or not.</p>

<h2>What I've Learned</h2>
<p>In four years of navigating the programmatic landscape, here's what I've discovered:</p>
<ul>
<li>The technology changes fast, but the fundamentals don't</li>
<li>Relationships matter more than algorithms</li>
<li>The best optimization is understanding the human behind the impression</li>
<li>Being wrong about tactics is fine—being wrong about direction is fatal</li>
</ul>

<p>So yes, maybe I was wrong about some things. But the decision to bet on programmatic? That, I'm confident, was right.</p>"""
    },
    {
        "title": "200 Interview Questions for Programmatic Advertising",
        "source_tag": "linkedin",
        "category": "marketplace-protocols",
        "publish_date": "2019-03-02",
        "external_url": "https://www.linkedin.com/pulse/interview-questions-programmatic-analyst-account-ranjan/",
        "content": """<h2>What is Programmatic Advertising?</h2>
<p>Programmatic Advertising is an automatic real-time buying & selling process of digital advertising inventory across multiple publishers' websites.</p>

<h2>Core Concepts</h2>
<ol>
<li>What is the difference between RTB and Programmatic Direct?</li>
<li>Explain the role of DSPs, SSPs, and Ad Exchanges</li>
<li>What is a DMP and how does it integrate with DSPs?</li>
<li>Describe the header bidding process</li>
<li>What is the difference between first-price and second-price auctions?</li>
</ol>

<h2>Technical Questions</h2>
<ol start="6">
<li>What are VAST and VPAID tags?</li>
<li>Explain the concept of bid shading</li>
<li>What is ad pod optimization in CTV?</li>
<li>How does frequency capping work across devices?</li>
<li>What is the significance of ads.txt and sellers.json?</li>
</ol>

<h2>Strategy Questions</h2>
<ol start="11">
<li>How do you optimize for viewability vs. completion rate?</li>
<li>What factors influence floor price decisions?</li>
<li>How do you approach brand safety in programmatic?</li>
<li>Explain yield optimization strategies</li>
<li>How do you measure incremental lift from programmatic campaigns?</li>
</ol>

<p><em>This is a selection from the full 200 questions compiled for programmatic professionals preparing for interviews.</em></p>"""
    },
    {
        "title": "The Ecosystem of Programmatic Ad Serving",
        "source_tag": "linkedin",
        "category": "marketplace-protocols",
        "publish_date": "2019-02-15",
        "external_url": "https://www.linkedin.com/pulse/ecosystem-programmatic-ad-serving-ranjan-dasgupta/",
        "content": """<h2>Understanding the Programmatic Ecosystem</h2>
<p>The programmatic advertising ecosystem can seem like an impenetrable maze of acronyms and technologies. But at its core, it's simply a marketplace connecting those who have ad space (publishers) with those who want to buy it (advertisers).</p>

<h2>The Key Players</h2>

<h3>Supply Side</h3>
<ul>
<li><strong>Publishers:</strong> The content creators with inventory to sell</li>
<li><strong>SSPs (Supply-Side Platforms):</strong> Technology that helps publishers sell inventory</li>
<li><strong>Ad Servers:</strong> The traffic directors that decide which ad to show</li>
</ul>

<h3>Demand Side</h3>
<ul>
<li><strong>Advertisers:</strong> Brands wanting to reach audiences</li>
<li><strong>Agencies:</strong> Strategic partners managing ad spend</li>
<li><strong>DSPs (Demand-Side Platforms):</strong> Technology for buying inventory programmatically</li>
</ul>

<h3>The Connectors</h3>
<ul>
<li><strong>Ad Exchanges:</strong> The marketplace where SSPs and DSPs meet</li>
<li><strong>DMPs (Data Management Platforms):</strong> The data layer enabling targeting</li>
<li><strong>Verification Partners:</strong> Ensuring ads are viewable, brand-safe, and fraud-free</li>
</ul>

<p>Understanding how these pieces fit together is essential for anyone working in digital advertising.</p>"""
    },
    {
        "title": "What's Next in Programmatic Advertising?",
        "source_tag": "linkedin",
        "category": "marketplace-protocols",
        "publish_date": "2019-01-20",
        "external_url": "https://www.linkedin.com/pulse/whats-next-programmatic-advertising-ranjan-dasgupta/",
        "content": """<h2>The Evolution Continues</h2>
<p>Programmatic advertising has come a long way from its humble beginnings as a way to sell remnant inventory. Today, it represents the majority of digital ad spending—and it's still evolving.</p>

<h2>Trends Shaping the Future</h2>

<h3>1. CTV and OTT Dominance</h3>
<p>Connected TV is the fastest-growing segment in programmatic, bringing television buying into the digital fold.</p>

<h3>2. Privacy-First Targeting</h3>
<p>With cookies crumbling and privacy regulations tightening, contextual targeting and first-party data strategies are resurging.</p>

<h3>3. Supply Path Optimization</h3>
<p>Buyers are demanding transparency and efficiency, forcing consolidation in the intermediary landscape.</p>

<h3>4. AI-Powered Optimization</h3>
<p>Machine learning is moving beyond bid optimization to creative optimization, audience discovery, and predictive analytics.</p>

<h3>5. Retail Media Explosion</h3>
<p>Commerce media is becoming the third major pillar of digital advertising, alongside search and social.</p>

<p>The question isn't whether programmatic will continue to grow—it's whether you'll be part of that growth.</p>"""
    },
    
    # Blogspot Articles - Neural Philosophical
    {
        "title": "100 Stories on Programmatic Advertising",
        "source_tag": "blogspot",
        "category": "neural-philosophical",
        "publish_date": "2024-04-15",
        "external_url": "https://ifiwasbornasanad.blogspot.com/2024/04/100-stories-on-programmatic-advertising.html",
        "content": """<h2>A Collection of Industry Insights</h2>
<p>Over the years, I've accumulated hundreds of stories from the front lines of programmatic advertising—tales of triumph, cautionary lessons, and the occasional absurdity that only our industry can produce.</p>

<h2>Story #1: The Million-Dollar Typo</h2>
<p>A campaign manager once set a daily budget of $100,000 instead of $10,000. By the time anyone noticed, they'd spent three days' worth of quarterly budget on a single weekend. The silver lining? It was their best-performing campaign ever.</p>

<h2>Story #27: The Contextual Comeback</h2>
<p>When GDPR hit, everyone panicked about targeting. One publisher doubled down on contextual—and saw their CPMs increase by 40% as advertisers realized context mattered more than cookies ever did.</p>

<h2>Story #53: The Bot Farm Bust</h2>
<p>We once traced suspicious traffic patterns to a data center in Eastern Europe running thousands of virtual machines, each simulating "engaged users" across hundreds of sites. The investigation changed how we think about verification.</p>

<p>These stories are more than anecdotes—they're the collective wisdom of an industry learning in public, failing forward, and building something unprecedented.</p>

<p><em>More stories to come...</em></p>"""
    },
    {
        "title": "The Digital Adventure: Story of Ads and Dreams",
        "source_tag": "blogspot",
        "category": "neural-philosophical",
        "publish_date": "2024-04-10",
        "external_url": "https://ifiwasbornasanad.blogspot.com/2024/04/the-digital-adventure-story-of-ads-and.html",
        "content": """<h2>Once Upon a Time in Adland</h2>
<p>This is a story about dreams—not the kind you have when you sleep, but the kind that drive you to build, create, and transform an industry.</p>

<h2>The Beginning</h2>
<p>I entered advertising when banners were king and "rich media" meant an ad that expanded. The idea that machines would one day buy and sell billions of ad impressions in milliseconds seemed like science fiction.</p>

<h2>The Journey</h2>
<p>From those early days to now, I've witnessed:</p>
<ul>
<li>The rise of programmatic from novelty to necessity</li>
<li>The mobile revolution that put ads in everyone's pocket</li>
<li>The data awakening and subsequent privacy reckoning</li>
<li>The streaming surge that's redefining television</li>
<li>The AI transformation that's only just beginning</li>
</ul>

<h2>The Dream</h2>
<p>My dream isn't just about better advertising—it's about advertising that genuinely serves people. Ads that inform rather than intrude. Experiences that add value rather than extract attention.</p>

<p>The technology exists to make this possible. The question is whether we have the wisdom to use it well.</p>

<p>The adventure continues...</p>"""
    }
]


def generate_slug(title: str) -> str:
    """Generate URL-friendly slug from title"""
    slug = title.lower().strip()
    slug = re.sub(r'[^\w\s-]', '', slug)
    slug = re.sub(r'[\s_-]+', '-', slug)
    slug = re.sub(r'^-+|-+$', '', slug)
    return slug[:100]


async def migrate_content():
    """Main migration function"""
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print(f"Connected to MongoDB: {DB_NAME}")
    print(f"Migrating {len(ARTICLES_TO_INGEST)} articles...")
    
    migrated = 0
    skipped = 0
    
    for article_data in ARTICLES_TO_INGEST:
        title = article_data["title"]
        slug = generate_slug(title)
        external_url = article_data.get("external_url", "")
        
        # Check if already exists
        existing = await db.archives_content.find_one(
            {"$or": [{"slug": slug}, {"external_url": external_url}]},
            {"_id": 0}
        )
        
        if existing:
            print(f"  SKIPPED: {title} (already exists)")
            skipped += 1
            continue
        
        # Parse publish date
        publish_date_str = article_data["publish_date"]
        try:
            publish_date = datetime.strptime(publish_date_str, "%Y-%m-%d").replace(tzinfo=timezone.utc)
        except ValueError:
            publish_date = datetime.now(timezone.utc)
        
        # Create article document
        article_doc = {
            "article_id": f"article_{uuid.uuid4().hex[:12]}",
            "title": title,
            "content": article_data["content"],
            "slug": slug,
            "source_tag": article_data["source_tag"],
            "author": "Ranjan Das",
            "publish_date": publish_date.isoformat(),
            "external_url": external_url,
            "category": article_data["category"],
            "is_published": True,  # Publish immediately
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.archives_content.insert_one(article_doc)
        print(f"  MIGRATED: {title} [{article_data['category']}]")
        migrated += 1
    
    print(f"\n✅ Migration complete!")
    print(f"   Migrated: {migrated}")
    print(f"   Skipped: {skipped}")
    print(f"   Total in collection: {await db.archives_content.count_documents({})}")
    
    # Close connection
    client.close()


if __name__ == "__main__":
    asyncio.run(migrate_content())
