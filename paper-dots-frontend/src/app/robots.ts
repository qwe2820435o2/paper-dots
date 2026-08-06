import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

const DISABLE_INDEXING = process.env.DISABLE_INDEXING === "true";

export default function robots(): MetadataRoute.Robots {
  if (DISABLE_INDEXING) {
    return {
      rules: [
        {
          userAgent: "*",
          disallow: "/",
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
      {
        userAgent: "SimilarwebBot",
        disallow: "/",
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
