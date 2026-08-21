/** The two hero graphics are injected with `dangerouslySetInnerHTML`, so any translated string
 *  spliced into their `<text>` nodes has to be XML-escaped first — a stray `&` or `<` in a
 *  Japanese or Indonesian string would otherwise break the whole SVG rather than just that
 *  label. */
export function escapeXml(value: string): string {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}
