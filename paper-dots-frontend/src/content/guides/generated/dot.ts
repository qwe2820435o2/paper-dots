// Hand-authored interim content — no Google Sheet tab or design mockup exists yet for this
// tool. Hero + toolLinks only; the rest stays null until `npm run sync:guides` replaces this
// file wholesale once the sheet is filled in. See docs/guide-pages.md §M8.
import type { GuideContentByLocale } from "../types";

const content: GuideContentByLocale = {
    en: {
        name: "Dot Photo Decorator",
        meta: {
            title: "Dot Photo Decorator | Scatter Playful Dots on Photos",
            description:
                "Free photo dot decorator — upload a photo, pick a paper background, and scatter playful dots across it. Export PNG, no sign-up.",
        },
        hero: {
            headline: 'Dot Photo Decorator for <span class="swash">Playful</span> Overlays',
            subheadline:
                "Upload a photo, pick a paper background, and scatter dots across it until the look feels right, then download your image.",
            image: null,
            cta: {
                text: "Start Decorating",
                href: null,
            },
            formats: ["PNG"],
        },
        toolLinks: {
            lead: "More tools",
            items: [
                { id: "1", label: "Polka Dot", href: "/polka-dot" },
                { id: "2", label: "Geo Pattern", href: "/geometric-patterns" },
                { id: "3", label: "Moment Card", href: "/moment-card" },
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
