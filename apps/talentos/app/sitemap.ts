import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://talentos.adsgupta.com";
  const now = new Date();
  const routes = ["/", "/workspace", "/analysis", "/interview", "/jobs", "/pricing", "/login", "/prep", "/dashboard"];
  return routes.map((route) => ({
    url: `${base}${route}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route === "/" ? 1 : 0.8,
  }));
}
