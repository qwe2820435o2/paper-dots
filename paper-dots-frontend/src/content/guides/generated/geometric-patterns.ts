// Hand-authored interim content — no Google Sheet tab or design mockup exists yet for this
// tool. Hero + toolLinks only; the rest stays null until `npm run sync:guides` replaces this
// file wholesale once the sheet is filled in. See docs/guide-pages.md §M8.
import type { GuideContentByLocale } from "../types";

const content: GuideContentByLocale = {
    en: {
        name: "Geometric Pattern Generator",
        meta: {
            title: "Geometric Pattern Generator | Free Seamless Pattern Maker",
            description:
                "Free geometric pattern generator — build a randomized grid of shapes, tune colors and spacing, then export SVG, PNG, or JPEG. No sign-up.",
        },
        hero: {
            headline: 'Geometric Pattern Generator for <span class="swash">Seamless</span> Backgrounds',
            subheadline:
                "Build a randomized grid of geometric shapes, adjust colors and spacing, and export a clean file for web or print in minutes.",
            image: null,
            cta: {
                text: "Generate a Pattern",
                href: null,
            },
            formats: ["SVG", "PNG", "JPEG"],
        },
        toolLinks: {
            lead: "More tools",
            items: [
                { id: "1", label: "Polka Dot", href: "/polka-dot" },
                { id: "2", label: "Moment Card", href: "/moment-card" },
                { id: "3", label: "Dot", href: "/dot" },
            ],
        },
        features: [],
        howTo: null,
        why: null,
        faq: null,
        finalCta: null,
    },
};

export default content;
