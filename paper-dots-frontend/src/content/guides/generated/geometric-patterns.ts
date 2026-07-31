// Hand-authored interim content — no Google Sheet tab or design mockup exists yet for this
// tool. `npm run sync:guides` replaces this file wholesale once the sheet is filled in. See
// docs/guide-pages.md §M8. Features/How To/Why/FAQ below are hand-written placeholders
// (2026-07-31) sourced only from this tool's real controls — IconSetControls.tsx +
// geometricIconSets.ts (8 shape families), LayoutControls.tsx (grid/density/spacing/rotation/
// opacity + randomize + shuffle), ColorControls.tsx (13 presets + random + custom pickers),
// ExportPanel.tsx (100-4000px custom size, SVG/PNG/JPEG, copy SVG code) — no invented features.
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
        toolLinks: null,
        features: [
            {
                id: "1",
                heading: "Generate a Geometric Pattern in One Click",
                body: "You feel rushed when a randomized grid takes forever to build from scratch. In a few clicks, you already have a clean geometric pattern on screen ready to refine. Generate a pattern instantly in DottyPic, then keep adjusting until your geometric background feels right for banners, posts, or print without opening heavy design software at all.",
                image: null,
            },
            {
                id: "2",
                heading: "8 Shape Families to Choose From",
                body: "A single shape can leave a pattern feeling flat and repetitive fast. Your grid can carry a completely different mood with one switch instead. Pick from shape families like Sector, Pennant, Orbit, Classic, Mosaic, Abstract, Lens, and Vessel, so your geometric pattern reads as considered rather than generic across the whole canvas.",
                image: null,
            },
            {
                id: "3",
                heading: "Shuffle for Instant Layout Variations",
                body: "Tweaking rows, columns, and rotation by hand can eat your whole session before anything looks right. One click can hand you a fresh arrangement worth keeping instead. Adjust rows, columns, density, spacing, rotation, and opacity, or turn on randomized rotation and spacing and hit shuffle for instant variations you would not have set up yourself.",
                image: null,
            },
            {
                id: "4",
                heading: "Color Presets or a Fully Custom Palette",
                body: "Getting background and shape colors to work together can turn into guesswork fast. A palette that already reads as balanced saves you that back and forth. Pick from built-in color presets, tap Random Colors for a fresh pairing, or set your own background and shape colors directly for a geometric pattern that matches your brand.",
                image: null,
            },
            {
                id: "5",
                heading: "Export at Any Size, in Any Format",
                body: "Exports feel frustrating when the file size or format blocks your next step. You leave with the dimensions and format your project actually needs. Set a custom export size from 100 to 4000 pixels and save as SVG, PNG, or JPEG, or copy the SVG code directly, free with no watermarks and no usage limits getting in the way of finishing your layout.",
                image: null,
            },
        ],
        howTo: {
            heading: "How to Make a Geometric Pattern Online",
            steps: [
                {
                    id: "1",
                    heading: "Open the Generator",
                    body: "Open the online tool and start from the default randomized grid so you can see the pattern update as you edit.",
                },
                {
                    id: "2",
                    heading: "Pick Shapes, Layout, and Colors",
                    body: "Choose a shape family, adjust rows, columns, density, spacing, rotation, and opacity, then set colors from a preset or your own palette.",
                },
                {
                    id: "3",
                    heading: "Export Your Pattern",
                    body: "Pick a custom size, then download SVG, PNG, or JPEG, or copy the SVG code straight into your project.",
                },
            ],
        },
        why: {
            heading: "Why Choose DottyPic Geometric Pattern Generator?",
            cards: [
                {
                    id: "1",
                    heading: "More Than One Shape",
                    body: "Most tools stop at a single motif. Here you can switch between eight shape families, so the pattern feels considered instead of stock.",
                },
                {
                    id: "2",
                    heading: "Instant Variations With Shuffle",
                    body: "Randomize rotation and spacing, then shuffle for a fresh arrangement in one click instead of tweaking every value by hand.",
                },
                {
                    id: "3",
                    heading: "Export Ready for Real Projects",
                    body: "Download at a custom size as SVG, PNG, or JPEG, or copy the SVG code directly. That means the same pattern can move from a quick preview into web or print work.",
                },
                {
                    id: "4",
                    heading: "Free, Unlimited, and Uncluttered",
                    body: "Create as many times as you need with no watermark and no ads in the way. The focus stays on making the pattern, not managing limits.",
                },
            ],
        },
        faq: {
            heading: "FAQs",
            items: [
                {
                    id: "1",
                    question: "Is the geometric pattern generator free to use?",
                    answer: "Yes. DottyPic is free, with no usage limits, no watermark, and no ads interrupting your edits or downloads.",
                },
                {
                    id: "2",
                    question: "What file formats can I download?",
                    answer: "You can download SVG, PNG, or JPEG, or copy the SVG code directly. Pick whichever fits your workflow, whether you need a flat image or code for a site.",
                },
                {
                    id: "3",
                    question: "Can I change the shapes in the pattern?",
                    answer: "Yes. Choose from shape families like Sector, Pennant, Orbit, Classic, Mosaic, Abstract, Lens, and Vessel to change the whole feel of the grid.",
                },
                {
                    id: "4",
                    question: "Can I randomize the layout instead of adjusting it by hand?",
                    answer: "Yes. Turn on randomized rotation and spacing, then hit shuffle for an instant new arrangement.",
                },
                {
                    id: "5",
                    question: "Can I use my own colors instead of a preset?",
                    answer: "Yes. Set your own background and shape colors directly, or tap Random Colors for a quick new pairing, alongside the built-in presets.",
                },
                {
                    id: "6",
                    question: "Can I set a custom export size?",
                    answer: "Yes. Choose a width and height between 100 and 4000 pixels before you export, so the file is ready for banners, posts, or print layouts without extra resizing.",
                },
                {
                    id: "7",
                    question: "Do I need design software or an account to use it?",
                    answer: "No. The generator runs in your browser with no sign-up and no design software required.",
                },
            ],
        },
        finalCta: {
            heading: "Build Your Geometric Pattern",
            body: "Try the free geometric pattern generator, shuffle through shapes and colors, and export a clean file when it feels right for your next project.",
            cta: {
                text: "Start Generating",
                href: null,
            },
        },
    },
};

export default content;
