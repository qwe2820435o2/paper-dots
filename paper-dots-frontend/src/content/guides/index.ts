/** Entry point for guide-page copy.
 *
 *  `GUIDES` is deliberately `Partial`: tools are rolled out one at a time as their sheet tab
 *  gets filled in, so a slug can legitimately have a registry entry and a route long before
 *  it has content. Registering a tool here is the last step of its rollout. */

import type { GuideContent, GuideContentByLocale, GuideLocale } from "./types";
import type { GuideSlug } from "./registry";
import polkaDot from "./generated/polka-dot";
import geometricPatterns from "./generated/geometric-patterns";
import momentCard from "./generated/moment-card";
import dot from "./generated/dot";

const GUIDES: Partial<Record<GuideSlug, GuideContentByLocale>> = {
    "polka-dot": polkaDot,
    "geometric-patterns": geometricPatterns,
    "moment-card": momentCard,
    "dot": dot,
};

export function hasGuideContent(slug: GuideSlug): boolean {
    return slug in GUIDES;
}

/** Falls back to English whenever the requested locale was not translated — the Google Sheet
 *  rolls translations out one tool at a time, so an untranslated guide renders in English
 *  rather than 404ing or showing blanks. */
export function getGuideContent(slug: GuideSlug, locale: GuideLocale = "en"): GuideContent {
    const byLocale = GUIDES[slug];
    if (!byLocale) {
        throw new Error(`No guide content registered for slug "${slug}"`);
    }
    return byLocale[locale] ?? byLocale.en;
}

export type {
    GuideContent,
    GuideContentByLocale,
    GuideLocale,
    GuideImage,
    GuideCta,
    GuideItem,
    GuideFeature,
    GuideFaqItem,
    GuideToolLink,
} from "./types";
