export interface CreateTool {
    /** Key under the `tools` message namespace, holding `label` and `navDescription`. Copy
     *  deliberately does not live here: the header and footer render this list in three
     *  locales, and a hardcoded label would silently stay English in two of them. */
    key: string;
    /** Locale-invariant — the locale prefix is added by `Link` from `@/i18n/navigation`. */
    href: string;
}

/** Shared source of truth for the "Create" tools, consumed by the header and footer. */
export const CREATE_TOOLS: CreateTool[] = [
    { key: "momentCard", href: "/photo-quote-maker" },
    { key: "dot", href: "/photo-overlay-editor" },
    { key: "polkaDot", href: "/polka-dot" },
    { key: "geometricPatterns", href: "/geometric-pattern-generator" },
    { key: "beforeAfter", href: "/before-after-photo-maker" },
];
