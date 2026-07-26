// Hand-authored interim content — no Google Sheet tab or design mockup exists yet for this
// tool. Hero + toolLinks only; the rest stays null until `npm run sync:guides` replaces this
// file wholesale once the sheet is filled in. See docs/guide-pages.md §M8.
import type { GuideContentByLocale } from "../types";

const content: GuideContentByLocale = {
    en: {
        name: "Moment Card Maker",
        meta: {
            title: "Moment Card Maker | Turn Photos into Color Cards",
            description:
                "Free moment card maker — upload a photo, pull its dominant color automatically, add a title, and download a shareable card. No sign-up.",
        },
        hero: {
            headline: 'Moment Card Maker for <span class="swash">Photo</span> Color Cards',
            subheadline:
                "Upload a photo, DottyPic pulls the dominant color automatically, add your title, and export a clean card to share.",
            image: null,
            cta: {
                text: "Make a Moment Card",
                href: null,
            },
            formats: ["PNG"],
        },
        toolLinks: {
            lead: "More tools",
            items: [
                { id: "1", label: "Polka Dot", href: "/polka-dot" },
                { id: "2", label: "Geo Pattern", href: "/geometric-patterns" },
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
