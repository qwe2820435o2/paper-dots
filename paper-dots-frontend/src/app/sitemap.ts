import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { GUIDE_REGISTRY } from "@/content/guides/registry";

const DISABLE_INDEXING = process.env.DISABLE_INDEXING === "true";

// The editor route (registry entry's appPath) is deliberately excluded: it's noindex'd (see
// src/lib/guideSeo.ts) so the guide is the only URL search engines should ever be pointed at
// for a given tool — listing both would just split the signal between two pages about the
// same thing.
export default function sitemap(): MetadataRoute.Sitemap {
  if (DISABLE_INDEXING) {
    return [];
  }

  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    ...GUIDE_REGISTRY.map((tool) => ({
      url: `${SITE_URL}${tool.guidePath}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    { url: `${SITE_URL}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];
}
