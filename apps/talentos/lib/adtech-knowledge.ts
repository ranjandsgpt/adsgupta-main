export type AdtechQuestion = { q: string; difficulty: string };
export type AdtechCategory = { category: string; questions: AdtechQuestion[] };

/** Ported from backend/routes/talentos.py — Adtech Knowledge Base */
export const ADTECH_KNOWLEDGE_BASE: AdtechCategory[] = [
  {
    category: "Header Bidding",
    questions: [
      {
        q: "Explain the difference between client-side and server-side header bidding. What are the latency implications?",
        difficulty: "hard",
      },
      {
        q: "How would you set up a Prebid.js wrapper with 10 demand partners while keeping latency under 800ms?",
        difficulty: "hard",
      },
      { q: "What is bid caching in header bidding and when would you use it?", difficulty: "medium" },
      { q: "Explain the concept of 'time-out' in header bidding. How do you optimize it?", difficulty: "medium" },
      {
        q: "What's the difference between Prebid.js and Amazon TAM? When would you use each?",
        difficulty: "hard",
      },
    ],
  },
  {
    category: "DSP/SSP Operations",
    questions: [
      {
        q: "Explain SPO (Supply Path Optimization) vs DPO (Demand Path Optimization). How do they benefit different stakeholders?",
        difficulty: "hard",
      },
      { q: "What factors would you consider when setting bid multipliers in a DSP?", difficulty: "medium" },
      {
        q: "How does frequency capping work across multiple DSPs? What are the challenges?",
        difficulty: "medium",
      },
      {
        q: "Explain the concept of 'bid shading' in first-price auctions. How do DSPs implement it?",
        difficulty: "hard",
      },
      {
        q: "What's the difference between a private marketplace (PMP) and a preferred deal?",
        difficulty: "medium",
      },
    ],
  },
  {
    category: "RTB & Auction Mechanics",
    questions: [
      { q: "Walk me through the entire RTB auction process from ad request to impression.", difficulty: "medium" },
      {
        q: "Explain first-price vs second-price auctions. Why did the industry shift to first-price?",
        difficulty: "medium",
      },
      { q: "What is 'auction duplication' and how does it affect yield?", difficulty: "hard" },
      { q: "How do unified auctions differ from traditional waterfalls?", difficulty: "medium" },
      { q: "Explain the concept of 'bid density'. How does it impact publisher revenue?", difficulty: "hard" },
    ],
  },
  {
    category: "Yield Optimization",
    questions: [
      { q: "How would you set up an A/B test for floor price optimization?", difficulty: "hard" },
      {
        q: "What metrics would you use to measure the true incremental revenue of header bidding?",
        difficulty: "hard",
      },
      { q: "Explain dynamic floor pricing. What signals would you use?", difficulty: "medium" },
      { q: "A client's CPM dropped 30% MoM. Walk me through your debugging process.", difficulty: "hard" },
      { q: "How do you balance fill rate vs CPM? What's the optimal approach?", difficulty: "medium" },
    ],
  },
  {
    category: "Privacy & Identity",
    questions: [
      {
        q: "How does the deprecation of third-party cookies impact programmatic advertising?",
        difficulty: "hard",
      },
      { q: "Explain Universal ID solutions (UID 2.0, LiveRamp). How do they work?", difficulty: "hard" },
      {
        q: "What is Google's Privacy Sandbox? How will Topics API and FLEDGE affect targeting?",
        difficulty: "hard",
      },
      { q: "How would you approach contextual targeting as a cookie alternative?", difficulty: "medium" },
      { q: "Explain the concept of 'clean rooms' in advertising. Give examples.", difficulty: "hard" },
    ],
  },
  {
    category: "Measurement & Attribution",
    questions: [
      {
        q: "Explain multi-touch attribution models. Which would you recommend for a D2C brand?",
        difficulty: "medium",
      },
      { q: "What is incrementality testing? How would you set one up?", difficulty: "hard" },
      { q: "How do you measure viewability? What's the industry standard?", difficulty: "medium" },
      { q: "Explain the difference between deterministic and probabilistic matching.", difficulty: "medium" },
      { q: "What challenges exist in cross-device attribution?", difficulty: "hard" },
    ],
  },
  {
    category: "Campaign Management",
    questions: [
      { q: "How would you structure a programmatic campaign for a new product launch?", difficulty: "medium" },
      { q: "Explain the concept of 'pacing' in campaign delivery. What algorithms are used?", difficulty: "medium" },
      {
        q: "How do you optimize for both reach and frequency in a branding campaign?",
        difficulty: "medium",
      },
      { q: "What's your approach to audience segmentation for a performance campaign?", difficulty: "medium" },
      { q: "Explain the trade-offs between CPA bidding and CPM bidding.", difficulty: "medium" },
    ],
  },
  {
    category: "Ad Fraud & Brand Safety",
    questions: [
      { q: "What types of ad fraud exist? How would you detect bot traffic?", difficulty: "medium" },
      { q: "Explain ads.txt and sellers.json. How do they prevent fraud?", difficulty: "medium" },
      {
        q: "What is 'domain spoofing'? How do supply path verification tools combat it?",
        difficulty: "hard",
      },
      { q: "How would you set up brand safety controls for a luxury brand?", difficulty: "medium" },
      {
        q: "Explain the concept of MFA (Made For Advertising) sites. How do you identify them?",
        difficulty: "hard",
      },
    ],
  },
  {
    category: "Retail Media",
    questions: [
      { q: "How does Amazon DSP differ from traditional DSPs?", difficulty: "medium" },
      { q: "Explain the concept of retail media networks. Why are they growing?", difficulty: "medium" },
      { q: "How would you measure incrementality for a retail media campaign?", difficulty: "hard" },
      {
        q: "What is the difference between sponsored products and display ads in retail media?",
        difficulty: "medium",
      },
      { q: "How does first-party data advantage retail media over open web?", difficulty: "medium" },
    ],
  },
  {
    category: "CTV & Video",
    questions: [
      { q: "Explain the CTV advertising landscape. Who are the major players?", difficulty: "medium" },
      { q: "What challenges exist in CTV measurement and attribution?", difficulty: "hard" },
      { q: "How does VAST differ from VPAID? When would you use each?", difficulty: "medium" },
      { q: "Explain server-side ad insertion (SSAI) vs client-side.", difficulty: "medium" },
      { q: "What is 'ad podding' in CTV? How does it work?", difficulty: "medium" },
    ],
  },
];

export const INTERVIEW_SYSTEM_PROMPT = `You are the TalentOS Interviewer. Your tone is professional, slightly challenging, and data-driven.

RULES:
1. If the role is Adtech-related, ask about the impact of third-party cookie deprecation, header bidding, or programmatic mechanics.
2. Analyze the user's answer for filler words (um, ah, like, you know, basically, actually).
3. Grade the answer using the STAR method (Situation, Task, Action, Result).
4. Ask follow-up questions that drill deeper into their claims.
5. Do NOT provide the overall score until the very end of the session.
6. Be encouraging but push for specifics and quantifiable results.
7. If an answer is vague, ask for concrete examples with numbers.

INTERVIEW FLOW:
- Start with a warm-up behavioral question
- Move to technical/domain questions
- End with situational questions
- Provide consolidated feedback only at the end`;
