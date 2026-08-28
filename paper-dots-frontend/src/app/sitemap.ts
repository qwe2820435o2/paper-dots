import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { GUIDE_REGISTRY } from "@/content/guides/registry";
import { DEFAULT_LOCALE, LOCALES } from "@/i18n/locales";
import { localizedPath } from "@/lib/i18nSeo";
import { BLOG_PATH, blogPostPath, wpTimestamp } from "@/lib/blogSeo";
import { getAllPosts } from "@/lib/wordpress";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();

  // Pulled live so publishing a post is enough to get it listed. getAllPosts() swallows its own
  // failures and returns what it has, which is what keeps a sleeping WordPress from taking the
  // whole sitemap — every static route above it — down with it.
  const posts = await getAllPosts(DEFAULT_LOCALE);

  // One entry per locale, each listed as a plain URL. hreflang is deliberately *not* repeated
  // here: every one of these paths already emits the full alternates set in its own <head> via
  // buildAlternates (src/lib/i18nSeo.ts), and Google only needs one of the two. Declaring them
  // here as well makes Next emit <xhtml:link> elements, and an XHTML namespace inside the
  // document is enough for Chrome to drop its built-in XML tree viewer and render the sitemap
  // as a wall of unstyled text.
  const staticEntries = ROUTES.flatMap(({ path, changeFrequency, priority }) =>
    LOCALES.map((code) => ({
      url: `${SITE_URL}${localizedPath(path, code)}`,
      lastModified,
      changeFrequency,
      priority,
    }))
  );

  // Blog URLs are listed for the default locale only, unlike every route above. /jp/blog and
  // /id/blog serve the same English posts and canonicalise to these URLs (see blogSeo.ts), and
  // a sitemap should only ever name canonical URLs — listing all three would ask search engines
  // to crawl two pages we have already told them to ignore.
  const blogEntries: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}${localizedPath(BLOG_PATH, DEFAULT_LOCALE)}`,
      // The index changes exactly when its newest post does.
      lastModified: posts[0] ? new Date(wpTimestamp(posts[0].modified_gmt)) : lastModified,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...posts.map((post) => ({
      url: `${SITE_URL}${localizedPath(blogPostPath(post.slug), DEFAULT_LOCALE)}`,
      lastModified: new Date(wpTimestamp(post.modified_gmt)),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];

  return [...staticEntries, ...blogEntries];
}
