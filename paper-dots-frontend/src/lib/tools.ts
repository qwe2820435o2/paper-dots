export interface CreateTool {
    label: string;
    href: string;
    description: string;
}

/** Shared source of truth for the "Create" tools, consumed by the header, footer, and sitemap. */
export const CREATE_TOOLS: CreateTool[] = [
    { label: "Photo Quote Maker", href: "/photo-quote-maker", description: "Turn a photo into a color-card" },
    { label: "Photo Overlay Editor", href: "/photo-overlay-editor", description: "Decorate a photo with playful dots" },
    { label: "Polka Dot Generator", href: "/polka-dot", description: "Generate a seamless polka dot background" },
    { label: "Geometric Pattern Generator", href: "/geometric-pattern-generator", description: "Generate seamless geometric background patterns" },
];
