// Maps the Google Sheet's flat rows (Section | Item ID | Field Name | EN | HTML Tag | JP)
// onto the GuideContent shape declared in src/content/guides/types.ts.
//
// The exact Field Name strings below are confirmed against a live pull of the real sheet
// (Polka Dot Generator tab). A few fields that show up in the sheet have no home in
// GuideContent yet (Meta::OG Title/OG Description/OG Image Alt, Feature::Feature Button,
// How To::How To Image) — they're deliberately left unmapped and keep warning until the
// content type grows to carry them. A sheet row that doesn't match anything here is never
// silently dropped: it prints an "unknown Section/Field Name" warning naming the tab and
// row, so a mismatch is a five-minute fix to this file rather than a copy that quietly
// never made it into the page.

export function normalize(value) {
    return String(value ?? "")
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();
}

/** Section/Field Name pairs whose value is a single field, not a repeated collection.
 *  Key is `normalize(section)::normalize(fieldName)`; value is the dot-path into
 *  GuideContent. `Url` is deliberately absent — it's cross-checked against
 *  registry.guidePath in the main script, never written into content. */
export const FIELD_MAP = {
    "name::name": "name",

    "meta information::meta title": "meta.title",
    "meta information::meta description": "meta.description",

    "hero::headline": "hero.headline",
    "hero::subheadline": "hero.subheadline",
    "hero::primary cta text": "hero.cta.text",
    "hero::primary cta link": "hero.cta.href",

    "tool recommendation::lead": "toolLinks.lead",

    "how to::how to title": "howTo.heading",
    "why::why title": "why.heading",
    "faq::faq title": "faq.heading",

    "cta::cta headline": "finalCta.heading",
    "cta::cta subtext": "finalCta.body",
    "cta::button text": "finalCta.cta.text",
    "cta::button link": "finalCta.cta.href",
};

/** Section/Field Name pairs that repeat once per Item ID. `path` is where the array lives
 *  in GuideContent; `fields` maps a normalized Field Name to the property written onto each
 *  array item. Item IDs are sorted numerically and compacted — see collectRows() in
 *  sync-guide-content.mjs — so array position never depends on sheet row order. */
export const COLLECTIONS = {
    "tool recommendation": {
        path: "toolLinks.items",
        fields: {
            "tool name": "label",
            "tool link": "href",
        },
    },
    feature: {
        path: "features",
        fields: {
            "feature title": "heading",
            "feature description": "body",
        },
    },
    "how to": {
        path: "howTo.steps",
        fields: {
            "step title": "heading",
            "step description": "body",
        },
    },
    why: {
        path: "why.cards",
        fields: {
            "why title": "heading",
            "why description": "body",
        },
    },
    faq: {
        path: "faq.items",
        fields: {
            question: "question",
            answer: "answer",
        },
    },
};

/** Repeatable scalar: several `Hero::Format` rows (ordered by Item ID) OR one comma-separated
 *  cell under the singleton `hero::format` key are both accepted. */
export const FORMATS_COLLECTION_SECTION = "hero";
export const FORMATS_COLLECTION_FIELD = "format";

/** Dot-paths that must resolve to a non-empty string for a locale to ship. Any one missing
 *  aborts the whole tab — see docs/guide-pages.md's "按 tab 全有或全无". */
export const REQUIRED_PATHS = ["meta.title", "meta.description", "hero.headline", "hero.cta.text"];

/** Inline tags the sheet is allowed to use inside EN/JP cell text. RichText renders these
 *  with dangerouslySetInnerHTML — see src/components/guide/RichText.tsx for why that's safe
 *  here. Anything else gets escaped, not silently dropped. */
export const ALLOWED_TAGS = new Set(["strong", "em", "br"]);
export const ALLOWED_SPAN_CLASS = "swash";
