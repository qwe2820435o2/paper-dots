export interface CreateTool {
    label: string;
    href: string;
    description: string;
}

/** Shared source of truth for the "Create" tools, consumed by the header, footer, and sitemap. */
export const CREATE_TOOLS: CreateTool[] = [
    { label: "Dot", href: "/photo-overlay-editor", description: "Decorate a photo with playful dots" },
    { label: "Moment Card", href: "/photo-quote-maker", description: "Turn a photo into a color-card" },
    { label: "Polka Dot", href: "/polka-dot", description: "Generate a seamless polka dot background" },
    { label: "Geo Pattern", href: "/geometric-pattern-generator", description: "Generate seamless geometric background patterns" },
];
