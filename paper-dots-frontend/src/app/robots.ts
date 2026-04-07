import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/booth", "/booth/edit"],
      },
      {
        userAgent: "SimilarwebBot",
        disallow: "/",
      },
    ],
    // TODO: replace with real paper-dots domain
    sitemap: "https://paperdots.example.com/sitemap.xml",
  };
}
