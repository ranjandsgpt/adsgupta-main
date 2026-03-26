import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/platform", "/admin", "/api"]
      }
    ],
    sitemap: "https://exchange.adsgupta.com/sitemap.xml"
  };
}

