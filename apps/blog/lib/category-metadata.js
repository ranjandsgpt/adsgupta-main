import { getAllPosts } from "./posts.js";
import { isPostgresConfigured } from "./cms-runtime.js";

export const CATEGORY_DEFINITIONS = [
  {
    id: "neural-philosophical",
    name: "Neural Philosophical",
    description:
      "Explorations at the intersection of cognition, neural networks, and attention economies.",
  },
  {
    id: "marketplace-protocols",
    name: "Marketplace Protocols",
    description: "How to win in Amazon, Walmart, and marketplace auctions with AI-native playbooks.",
  },
  {
    id: "adtech-infrastructure",
    name: "AdTech Infrastructure",
    description: "Architecture notes for bidders, data pipelines, and experimentation frameworks.",
  },
  {
    id: "revenue-engineering",
    name: "Revenue Engineering",
    description: "Monetization strategy and revenue systems.",
  },
  {
    id: "programmatic-strategy",
    name: "Programmatic Strategy",
    description: "Header bidding, auction dynamics, and programmatic buying.",
  },
  {
    id: "media-buying-systems",
    name: "Media Buying Systems",
    description: "Media buying optimization and infrastructure.",
  },
];

/** Category cards with live counts from Postgres (or markdown posts when DB off). */
export async function getCategoriesWithCounts() {
  const byName = {};

  if (isPostgresConfigured()) {
    try {
      const { listPublishedCategories } = await import("./cms-pg.js");
      const rows = await listPublishedCategories();
      (rows || []).forEach((r) => {
        if (r.category) byName[r.category] = r.count ?? 0;
      });
    } catch {
      /* POSTGRES_URL set but schema not migrated yet (e.g. first Vercel deploy) — fall back like DB-off */
      const posts = await getAllPosts();
      (posts || []).forEach((post) => {
        const cat = post.meta?.category;
        if (!cat) return;
        byName[cat] = (byName[cat] || 0) + 1;
      });
    }
  } else {
    const posts = await getAllPosts();
    (posts || []).forEach((post) => {
      const cat = post.meta?.category;
      if (!cat) return;
      byName[cat] = (byName[cat] || 0) + 1;
    });
  }

  return CATEGORY_DEFINITIONS.map((c) => ({
    ...c,
    count: byName[c.name] ?? 0,
  }));
}
