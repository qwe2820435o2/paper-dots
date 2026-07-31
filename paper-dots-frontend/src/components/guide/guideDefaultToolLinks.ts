import type { GuideContent } from "@/content/guides";
import { GUIDE_REGISTRY, type GuideSlug } from "@/content/guides/registry";

/** Shared "More tools" fallback for every guide page, not hand-authored per tool — same
 *  reasoning as GuideHeroStudio/GUIDE_DEFAULT_FEATURE_VISUALS: until a tool's sheet fills in
 *  its own Tool Recommendation rows, every guide page cross-links the other three from
 *  `GUIDE_REGISTRY`, the single source of truth for tool labels/routes. Once a sheet supplies
 *  real `toolLinks`, GuideTemplate prefers it automatically. */
export function getDefaultToolLinks(slug: GuideSlug): NonNullable<GuideContent["toolLinks"]> {
    return {
        lead: "More tools",
        items: GUIDE_REGISTRY.filter((entry) => entry.slug !== slug).map((entry, i) => ({
            id: String(i + 1),
            label: entry.label,
            href: entry.guidePath,
        })),
    };
}
