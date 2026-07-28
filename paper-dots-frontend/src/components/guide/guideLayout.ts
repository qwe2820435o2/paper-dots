/** Shared section wrapper width, matching the mockup's `.wrap` (max-width: 1180px). Plain
 *  Tailwind arbitrary value rather than a new @theme token — it's a single number reused by
 *  every guide section, not a design decision worth naming. */
export const GUIDE_WRAP = "mx-auto max-w-[1180px] px-6 lg:px-10";

/** Section heading wrapper, matching the mockup's `.sec-head` (max-width: 640px). Caps
 *  h2/intro copy so long headings wrap onto multiple lines like the mockup instead of
 *  stretching across the full 1180px section width. Left-aligned by default, matching the
 *  mockup's plain `.sec-head` (e.g. Why) — callers add `mx-auto text-center` for the centered
 *  variant (`.sec-head.center`, e.g. How To). */
export const GUIDE_SEC_HEAD = "max-w-[640px]";

/** Feature-block media aspect ratio, matching the mockup's `.shot` — a fixed 340px tall
 *  against a 518px-wide `.feat` column (1180px wrap, 64px gap, minus padding, halved). Using
 *  that ratio instead of a round 4/3 keeps the box proportioned like the mockup at any width,
 *  rather than a fixed height that would only look right at that one reference viewport.
 *  Shared by GuideFeatureBlock's GuideMedia fallback and GuideFeaturePattern's mock shots so
 *  real and mocked feature images stay the same shape. */
export const GUIDE_FEATURE_SHOT_ASPECT = "aspect-[259/170]";
