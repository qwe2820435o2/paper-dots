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
    sitemap: "https://mochipic.io/sitemap.xml",
  };
}
