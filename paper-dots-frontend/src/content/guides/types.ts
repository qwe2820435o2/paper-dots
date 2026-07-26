/** Content contract for the templated tool guide pages.
 *
 *  Everything below `meta` and `hero` is nullable or an array. A half-filled Google Sheet
 *  tab therefore produces a shorter page rather than a crash or a failed build, which is
 *  what lets each tool's guide ship independently of the others' copy being ready.
 *
 *  Route information deliberately lives in `registry.json`, not here: it is locale-invariant,
 *  so keeping it out of `GuideContent` means a translation can never drift the URL. */

export type GuideLocale = "en" | "ja";

/** `src` is a path under `public/`. The whole object is `null` when no image was supplied,
 *  so the renderer only ever has one emptiness check to make. */
export interface GuideImage {
    src: string;
    alt: string;
}

/** `href` is `null` when the sheet left the link cell empty, which means "send the user to
 *  this tool's editor". The template resolves it against the registry's `appPath` — the
 *  route never gets baked into generated content. */
export interface GuideCta {
    text: string;
    href: string | null;
}

/** `id` is the sheet's Item ID, kept for traceability back to a spreadsheet row.
 *  Ordering comes from the array position, which the sync script derives by sorting
 *  Item IDs numerically — never from the row's position in the sheet. */
export interface GuideItem {
    id: string;
    heading: string;
    body: string;
}

export interface GuideFeature extends GuideItem {
    image: GuideImage | null;
}

export interface GuideFaqItem {
    id: string;
    question: string;
    answer: string;
}

export interface GuideToolLink {
    id: string;
    label: string;
    href: string;
}

/** Body copy may carry a small allowlist of inline HTML — see `RichText`. */
export interface GuideContent {
    name: string;
    meta: {
        title: string;
        description: string;
    };
    hero: {
        headline: string;
        subheadline: string;
        image: GuideImage | null;
        cta: GuideCta;
        formats: string[];
    };
    toolLinks: {
        lead: string;
        items: GuideToolLink[];
    } | null;
    features: GuideFeature[];
    howTo: {
        heading: string;
        steps: GuideItem[];
    } | null;
    why: {
        heading: string;
        cards: GuideItem[];
    } | null;
    faq: {
        heading: string;
        items: GuideFaqItem[];
    } | null;
    finalCta: {
        heading: string;
        body: string;
        cta: GuideCta;
    } | null;
}

/** `en` is mandatory, every other locale optional: the sync script omits a locale entirely
 *  unless that column filled in all the required fields. `getGuideContent` falls back to
 *  `en`, so adding a `/ja` route later is a routing change with no content-layer edits. */
export type GuideContentByLocale = { en: GuideContent } & Partial<Record<GuideLocale, GuideContent>>;
