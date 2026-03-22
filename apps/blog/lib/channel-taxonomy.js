/**
 * Maps posts to publication "channels" for homepage sections (UI only — no DB changes).
 */

export const CHANNELS = [
  { id: "programmatic", label: "Programmatic", slug: "programmatic", color: "#00D4FF" },
  { id: "search", label: "Search & PPC", slug: "search", color: "#FFE600" },
  { id: "social", label: "Social Ads", slug: "social", color: "#FF3CAC" },
  { id: "marketplaces", label: "Marketplaces", slug: "marketplaces", color: "#B06CFF" },
  { id: "creative", label: "Creative & Formats", slug: "creative", color: "#7CFF4A" },
  { id: "data", label: "Data & Measurement", slug: "data", color: "#00E5C3" },
  { id: "ctv", label: "CTV & Emerging", slug: "ctv", color: "#FF6B2B" },
  { id: "agency", label: "Agency & Strategy", slug: "agency", color: "#FF3B3B" },
];

const KEYWORD_RULES = [
  {
    id: "agency",
    keywords: ["agency", "brand strategy", "consulting", "go-to-market", "gtm"],
  },
  {
    id: "ctv",
    keywords: ["ctv", "connected tv", "streaming", "vast", "vmap", "ssai", "csai", "roku", "fire tv"],
  },
  {
    id: "data",
    keywords: [
      "measurement",
      "attribution",
      "analytics",
      "privacy",
      "identity",
      "clean room",
      "neural",
      "data ",
    ],
  },
  {
    id: "creative",
    keywords: ["creative", "dco", "dynamic creative", "ad format", "native ad"],
  },
  {
    id: "marketplaces",
    keywords: ["marketplace", "amazon", "retail media", "walmart", "tiktok shop", "commerce media"],
  },
  {
    id: "social",
    keywords: ["social ads", "meta ads", "facebook ads", "instagram", "tiktok ads", "linkedin ads"],
  },
  {
    id: "search",
    keywords: ["search", "ppc", "sem", "google ads", "paid search", "media buying", "shopping ads"],
  },
  {
    id: "programmatic",
    keywords: [
      "programmatic",
      "header bidding",
      "prebid",
      "openrtb",
      "ssp",
      "dsp",
      "exchange",
      "auction",
      "yield",
      "spo",
      "supply path",
      "adtech infrastructure",
      "programmatic strategy",
      "revenue engineering",
      "monetization",
      "ad server",
    ],
  },
];

function normalizeBlob(post) {
  const cat = String(post.meta?.category || "").toLowerCase();
  const title = String(post.meta?.title || "").toLowerCase();
  const ex = String(post.excerpt || "").slice(0, 400).toLowerCase();
  return `${cat} ${title} ${ex}`;
}

export function assignChannel(post) {
  const blob = normalizeBlob(post);
  const cat = String(post.meta?.category || "").toLowerCase();

  for (const { id, keywords } of KEYWORD_RULES) {
    if (keywords.some((k) => blob.includes(k.trim()))) {
      return id;
    }
  }

  if (cat.includes("marketplace")) return "marketplaces";
  if (cat.includes("programmatic") || cat.includes("adtech") || cat.includes("infrastructure")) {
    return "programmatic";
  }
  if (cat.includes("media buying")) return "search";
  if (cat.includes("revenue")) return "programmatic";
  if (cat.includes("neural")) return "data";

  return "programmatic";
}

export function getChannelMeta(id) {
  return CHANNELS.find((c) => c.id === id) || CHANNELS[0];
}

export function groupPostsByChannel(posts, perSection = 6) {
  const map = Object.fromEntries(CHANNELS.map((c) => [c.id, []]));

  for (const post of posts) {
    const id = assignChannel(post);
    map[id].push(post);
  }

  return CHANNELS.map((c) => ({
    ...c,
    posts: (map[c.id] || []).slice(0, perSection),
  }));
}
