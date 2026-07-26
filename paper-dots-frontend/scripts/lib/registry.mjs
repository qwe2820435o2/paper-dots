// Reads the same registry.json the app's src/content/guides/registry.ts reads — see that
// file's comment for why the registry is JSON rather than TypeScript.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { normalize } from "./sheet-schema.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
export const REGISTRY_PATH = join(__dirname, "..", "..", "src", "content", "guides", "registry.json");
export const CONTENT_ROOT = join(__dirname, "..", "..", "src", "content", "guides");

export async function loadRegistry() {
    const raw = await readFile(REGISTRY_PATH, "utf8");
    return JSON.parse(raw);
}

function slugify(label) {
    return normalize(label).replace(/\s+/g, "-");
}

/** Resolves a Tool Recommendation card's label against the registry: exact label match,
 *  then case-insensitive, then a slugified match against the tool's own slug. Returns the
 *  guidePath, or null if nothing matched. */
export function makeToolLabelResolver(registry) {
    return function resolve(label) {
        const exact = registry.find((r) => r.label === label);
        if (exact) return exact.guidePath;

        const ci = registry.find((r) => normalize(r.label) === normalize(label));
        if (ci) return ci.guidePath;

        const bySlug = registry.find((r) => r.slug === slugify(label));
        if (bySlug) return bySlug.guidePath;

        return null;
    };
}
