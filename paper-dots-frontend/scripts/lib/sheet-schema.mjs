// Maps the Google Sheet's flat rows (Section | Item ID | Field Name | EN | HTML Tag | JP)
// onto the GuideContent shape declared in src/content/guides/types.ts.
//
// The exact Field Name strings below are the sync script's best-effort read of the sheet
// structure — confirmed for Name/Url/Meta/Hero/Tool Recommendation from the columns Travis
// has already filled in, inferred by pattern for Feature/How To/Why/FAQ/Final CTA. A sheet
// row that doesn't match anything here is never silently dropped: it prints an "unknown
// Section/Field Name" warning naming the tab and row, so a mismatch is a five-minute fix to
// this file rather than a copy that quietly never made it into the page.

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
    "hero::hero image": "hero.image.src",
    "hero::hero image alt": "hero.image.alt",
    "hero::primary cta text": "hero.cta.text",
    "hero::primary cta link": "hero.cta.href",

    "tool recommendation::lead": "toolLinks.lead",

    "how to::heading": "howTo.heading",
    "why::heading": "why.heading",
    "faq::heading": "faq.heading",

    "final cta::heading": "finalCta.heading",
    "final cta::body": "finalCta.body",
    "final cta::cta text": "finalCta.cta.text",
    "final cta::cta link": "finalCta.cta.href",
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
            heading: "heading",
            body: "body",
            image: "image.src",
            "image alt": "image.alt",
        },
    },
    "how to": {
        path: "howTo.steps",
        fields: {
            heading: "heading",
            body: "body",
        },
    },
    why: {
        path: "why.cards",
        fields: {
            heading: "heading",
            body: "body",
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
