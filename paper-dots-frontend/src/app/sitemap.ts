import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { GUIDE_REGISTRY } from "@/content/guides/registry";
import { LOCALES } from "@/i18n/locales";
import { localizedPath } from "@/lib/i18nSeo";

const DISABLE_INDEXING = process.env.DISABLE_INDEXING === "true";

// The editor route (registry entry's appPath) is deliberately excluded: it's noindex'd (see
// src/lib/guideSeo.ts) so the guide is the only URL search engines should ever be pointed at
// for a given tool — listing both would just split the signal between two pages about the
// same thing.
const ROUTES: Array<{
  path: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
}> = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  ...GUIDE_REGISTRY.map((tool) => ({
    path: tool.guidePath,
    changeFrequency: "monthly" as const,
    priority: 0.9,
  })),
  { path: "/contact", changeFrequency: "monthly", priority: 0.5 },
  { path: "/privacy", changeFrequency: "yearly", priority: 0.3 },
  { path: "/terms", changeFrequency: "yearly", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  // One entry per locale, each listed as a plain URL. hreflang is deliberately *not* repeated
  // here: every one of these paths already emits the full alternates set in its own <head> via
  // buildAlternates (src/lib/i18nSeo.ts), and Google only needs one of the two. Declaring them
  // here as well makes Next emit <xhtml:link> elements, and an XHTML namespace inside the
  // document is enough for Chrome to drop its built-in XML tree viewer and render the sitemap
  // as a wall of unstyled text.
  return ROUTES.flatMap(({ path, changeFrequency, priority }) =>
    LOCALES.map((code) => ({
      url: `${SITE_URL}${localizedPath(path, code)}`,
      lastModified,
      changeFrequency,
      priority,
    }))
  );
}
