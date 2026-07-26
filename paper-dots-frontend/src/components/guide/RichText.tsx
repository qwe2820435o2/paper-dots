/** Renders guide copy that carries a small allowlist of inline HTML: <strong>, <em>, <br>,
 *  and <span class="swash"> (the headline underline). The sync script is what enforces the
 *  allowlist — see scripts/sync-guide-content.mjs — by validating every cell before it is
 *  written to a generated content file.
 *
 *  This is not a user-input sink. The HTML here was authored in a spreadsheet, validated by
 *  the sync script, written to a file, and reviewed in a `git diff` by a human before being
 *  committed — exactly as trusted as the JSX markup sitting next to it. Do not swap this for
 *  a sanitizer "to be safe"; that would be solving a problem this component doesn't have. */

interface RichTextProps {
    as?: "p" | "h1" | "h2" | "h3" | "span";
    html: string;
    className?: string;
}

export default function RichText({ as: Tag = "p", html, className }: RichTextProps) {
    return <Tag className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
