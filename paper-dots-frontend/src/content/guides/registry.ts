/** Typed view over `registry.json`.
 *
 *  The registry is authored as JSON rather than TypeScript so that `scripts/sync-guide-content.mjs`
 *  can read the exact same file with `readFile`. That keeps the sheet-tab-to-route mapping in one
 *  place instead of drifting between the app and the sync script. */

import registryJson from "./registry.json";

/** Adding a tool means adding it here and in `registry.json`; the assertion below fails fast
 *  if the two ever disagree, and `GUIDES` in `./index` will not typecheck until the new slug
 *  has a content module. */
export const GUIDE_SLUGS = ["polka-dot", "geometric-patterns", "moment-card", "dot", "before-after"] as const;

export type GuideSlug = (typeof GUIDE_SLUGS)[number];

export interface GuideRegistryEntry {
    slug: GuideSlug;
    /** Human label, kept in sync with CREATE_TOOLS in src/lib/tools.ts by hand — the sync
     *  script reads this (not tools.ts, which it can't import as plain JS) to resolve a Tool
     *  Recommendation card's href when the sheet only gave a name. */
    label: string;
    /** Title of the Google Sheet tab holding this tool's copy. */
    sheetTab: string;
    /** Marketing guide page — the clean, indexable URL. */
    guidePath: string;
    /** The editor itself. Kept out of `GuideContent` because it is locale-invariant. */
    appPath: string;
}

/** `satisfies` checks the JSON's shape; the cast then narrows `slug` from `string` to the
 *  literal union, which the runtime check immediately below actually earns. */
const entries = registryJson satisfies {
    slug: string;
    label: string;
    sheetTab: string;
    guidePath: string;
    appPath: string;
}[] as readonly GuideRegistryEntry[];

const bySlug = new Map<string, GuideRegistryEntry>(entries.map((entry) => [entry.slug, entry]));

if (bySlug.size !== entries.length) {
    throw new Error("registry.json contains duplicate slugs");
}

for (const slug of GUIDE_SLUGS) {
    if (!bySlug.has(slug)) {
        throw new Error(`registry.json is missing an entry for slug "${slug}"`);
    }
}

for (const entry of entries) {
    if (!GUIDE_SLUGS.includes(entry.slug)) {
        throw new Error(`registry.json has slug "${entry.slug}", which is absent from GUIDE_SLUGS`);
    }
}

export const GUIDE_REGISTRY: readonly GuideRegistryEntry[] = entries;

export function getGuideRoute(slug: GuideSlug): GuideRegistryEntry {
    const entry = bySlug.get(slug);
    if (!entry) {
        throw new Error(`No registry entry for slug "${slug}"`);
    }
    return entry;
}
