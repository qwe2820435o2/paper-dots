// Validates the small inline-HTML allowlist a sheet cell is allowed to carry — see
// ALLOWED_TAGS / ALLOWED_SPAN_CLASS in sheet-schema.mjs and the safety note in
// src/components/guide/RichText.tsx. A cell that uses anything outside the allowlist has its
// HTML escaped rather than passed through, and the caller is told so it can warn.

import { ALLOWED_SPAN_CLASS, ALLOWED_TAGS } from "./sheet-schema.mjs";

const TAG_PATTERN = /<\/?([a-zA-Z0-9]+)((?:\s+[^<>]*)?)\/?>/g;

function escapeHtml(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

/** @returns {{ html: string, violations: string[] }} */
export function sanitizeRichText(raw) {
    const text = String(raw ?? "");
    const violations = [];

    TAG_PATTERN.lastIndex = 0;
    let match;
    while ((match = TAG_PATTERN.exec(text))) {
        const [full, tagName, attrs] = match;
        const tag = tagName.toLowerCase();

        if (!ALLOWED_TAGS.has(tag) && tag !== "span") {
            violations.push(`disallowed tag <${tag}>`);
            continue;
        }

        if (tag === "span") {
            const isClosing = full.startsWith("</");
            const trimmedAttrs = (attrs ?? "").trim();
            const isAllowedSpanOpen = !isClosing && trimmedAttrs === `class="${ALLOWED_SPAN_CLASS}"`;
            const isAllowedSpanClose = isClosing && trimmedAttrs === "";
            if (!isAllowedSpanOpen && !isAllowedSpanClose) {
                violations.push(`disallowed <span> markup: "${full}"`);
            }
            continue;
        }

        // strong/em/br must carry no attributes at all.
        if ((attrs ?? "").trim().length > 0) {
            violations.push(`disallowed attributes on <${tag}>: "${full}"`);
        }
    }

    if (violations.length > 0) {
        return { html: escapeHtml(text), violations };
    }
    return { html: text, violations: [] };
}

/** Strips the allowlisted tags back out for contexts that need plain text — e.g. a future
 *  JSON-LD emitter that receives already-generated content instead of raw sheet cells could
 *  reuse this, though src/lib/guideSeo.ts currently does its own equivalent strip at render
 *  time since it works off the emitted GuideContent, not raw cells. */
export function stripTags(html) {
    return String(html ?? "").replace(/<[^>]+>/g, "");
}
