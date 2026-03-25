import type { MetadataRoute } from "next";

const BASE = "https://exchange.adsgupta.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: "https://exchange.adsgupta.com", lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: "https://exchange.adsgupta.com/publisher", lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    {
      url: "https://exchange.adsgupta.com/publisher/register",
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8
    },
    { url: "https://exchange.adsgupta.com/publisher/estimate", lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: "https://exchange.adsgupta.com/demand", lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: "https://exchange.adsgupta.com/demand/create", lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: "https://exchange.adsgupta.com/docs", lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: "https://exchange.adsgupta.com/privacy", lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: "https://exchange.adsgupta.com/status", lastModified: now, changeFrequency: "hourly", priority: 0.5 }
  ];
}
