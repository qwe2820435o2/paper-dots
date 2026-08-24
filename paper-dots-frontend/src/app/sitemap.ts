import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { GUIDE_REGISTRY } from "@/content/guides/registry";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META } from "@/i18n/locales";
import { localizedPath } from "@/lib/i18nSeo";

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

  // One entry per locale, each carrying the full alternates set so a crawler that reaches any
  // one of them learns about the other two. `languages` keys are BCP 47 tags (`ja`), which is
  // why they come from LOCALE_META rather than the routing code.
  return ROUTES.flatMap(({ path, changeFrequency, priority }) => {
    const languages = Object.fromEntries([
      ...LOCALES.map((code) => [LOCALE_META[code].htmlLang, `${SITE_URL}${localizedPath(path, code)}`]),
      ["x-default", `${SITE_URL}${localizedPath(path, DEFAULT_LOCALE)}`],
    ]);

    return LOCALES.map((code) => ({
      url: `${SITE_URL}${localizedPath(path, code)}`,
      lastModified,
      changeFrequency,
      priority,
      alternates: { languages },
    }));
  });
}
