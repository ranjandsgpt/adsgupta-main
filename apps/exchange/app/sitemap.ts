import type { MetadataRoute } from "next";

const BASE = "https://exchange.adsgupta.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/publisher`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/publisher/estimate`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/demand`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE}/stats`, lastModified: now, changeFrequency: "daily", priority: 0.65 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/status`, lastModified: now, changeFrequency: "daily", priority: 0.5 }
  ];
}
