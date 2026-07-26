// Local smoke test for the pure row->content mapping — no network, no credentials. Feeds a
// synthetic row set (mirroring exactly what the real "Polka Dot Generator" tab should
// contain, using the Field Name strings sheet-schema.mjs expects) through transformSheetRows
// and diffs the result against the hand-transcribed src/content/guides/generated/polka-dot.ts
// from M1. A structural difference here means the schema in sheet-schema.mjs is wrong; a
// copy-only difference is fine (it would just mean the fixture and this test's strings
// drifted, not a mapping bug).
//
// Run with: node scripts/test/transform.smoke.mjs

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { transformSheetRows } from "../lib/transform.mjs";
import { renderContentModule } from "../lib/emit.mjs";
import { loadRegistry, makeToolLabelResolver } from "../lib/registry.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

let rowNumber = 1;
function row(section, itemId, fieldName, en) {
    rowNumber++;
    return { rowNumber, section, itemId: itemId === null ? "" : String(itemId), fieldName, en, htmlTag: "", ja: "" };
}

const rows = [
    row("Name", null, "Name", "Polka Dot Generator"),
    row("Meta Information", null, "Meta Title", "Polka Dot Generator | Free Polka Dot Pattern & Background"),
    row(
        "Meta Information",
        null,
        "Meta Description",
        "Need a free Polka dot generator without design software? Customize colors, shapes, and spacing, then download PNG, JPEG, SVG, or CSS. Try it free & no sign up."
    ),
    row("Meta Information", null, "Url", "/polka-dot"),
    row("Hero", null, "Headline", 'Polka Dot Generator for <span class="swash">Custom Dot</span> Backgrounds'),
    row(
        "Hero",
        null,
        "Subheadline",
        "Skip the blank canvas. DottyPic helps you build a playful dotted look, tweak every detail, and export clean files for web or print in minutes."
    ),
    row("Hero", null, "Hero Image", ""),
    row("Hero", null, "Primary CTA Text", "Generate Polka Dots"),
    row("Hero", null, "Primary CTA Link", ""),
    row("Hero", null, "Format", "PNG, JPEG, SVG, CSS code, custom size"),

    row("Tool Recommendation", null, "Lead", "More tools"),
    row("Tool Recommendation", 1, "Tool Name", "Geo Pattern"),
    row("Tool Recommendation", 2, "Tool Name", "Moment Card"),
    row("Tool Recommendation", 3, "Tool Name", "Dot"),

    row("Feature", 1, "Heading", "Polka dot generator in One Click"),
    row(
        "Feature",
        1,
        "Body",
        "You feel rushed when a simple dotted look takes too long to build from scratch. In a few clicks, you already have a clean pattern on screen ready to refine. Generate polka dots instantly in DottyPic, then keep editing until your <strong>polka dot background</strong> feels right for posts, banners, or print without opening heavy design software at all."
    ),
    row("Feature", 2, "Heading", "Shapes, Emoji, and Text as Dots"),
    row(
        "Feature",
        2,
        "Body",
        "Plain round dots leave your layout feeling stuck and too basic for the mood you want. Your pattern can look playful and personal instead of like a stock fill. Choose preset shapes, emoji, or custom text as the repeating unit, so your <strong>polka dots pattern</strong> carries personality while still reading as a classic dotted field across the canvas."
    ),
    row("Feature", 3, "Heading", "Upload Images as Polka Dots"),
    row(
        "Feature",
        3,
        "Body",
        "Brand work feels mismatched when every tool only offers plain circles. Now your own art can repeat across the whole canvas as dots. Upload an image and use it as the repeating unit to build a branded <strong>dot pattern background</strong> that still keeps the familiar polka rhythm your audience recognizes at a glance on every surface."
    ),
    row("Feature", 4, "Heading", "How Size, Spacing, Colors, and Tilt Work"),
    row(
        "Feature",
        4,
        "Body",
        "You get impatient when colors, spacing, and angle will not line up with your frame. After a few tweaks, the pattern sits where you need it and matches your palette. Adjust size, spacing, opacity, colors, direction, and tilt, then pick themes like muted tones, sunset, or mono for a balanced <strong>dotted pattern</strong> or <strong>polka dot texture</strong>."
    ),
    row("Feature", 5, "Heading", "What Formats and Sizes You Can Export"),
    row(
        "Feature",
        5,
        "Body",
        "Exports feel frustrating when the file size or format blocks your next step. You leave with the dimensions and format your project actually needs. Set a custom download size and save as PNG, JPEG, SVG, or CSS code, free with no watermarks, no ads, and no usage limits getting in the way of finishing your layout."
    ),

    row("How To", null, "Heading", "How to Make a Polka Dot Pattern Online"),
    row("How To", 1, "Heading", "Open the Generator"),
    row(
        "How To",
        1,
        "Body",
        "Open the online tool and start from a blank canvas or a simple preset so you can see the pattern update as you edit."
    ),
    row("How To", 2, "Heading", "Customize Your Dots"),
    row(
        "How To",
        2,
        "Body",
        "Set size, spacing, colors, tilt, and optional shapes, emoji, text, or an uploaded image as the repeating unit."
    ),
    row("How To", 3, "Heading", "Download Your File"),
    row("How To", 3, "Body", "Choose your canvas size, then export PNG, JPEG, SVG, or CSS code for web, social, or print use."),

    row("Why", null, "Heading", "Why Choose DottyPic Polka Dot Generator?"),
    row("Why", 1, "Heading", "More Than Round Dots"),
    row(
        "Why",
        1,
        "Body",
        "Most tools stop at circles. Here you can use shapes, emoji, text, or your own upload as the repeating unit, so the pattern feels personal instead of stock."
    ),
    row("Why", 2, "Heading", "Full Control Without Friction"),
    row(
        "Why",
        2,
        "Body",
        "Tune size, spacing, opacity, colors, tilt, and direction in one place. You get a custom look without jumping into complex design software."
    ),
    row("Why", 3, "Heading", "Export Ready for Real Projects"),
    row(
        "Why",
        3,
        "Body",
        "Download at a custom size as PNG, JPEG, SVG, or CSS code. That means the same pattern can move from a quick preview into web or print work."
    ),
    row("Why", 4, "Heading", "Free, Unlimited, and Uncluttered"),
    row(
        "Why",
        4,
        "Body",
        "Create as many times as you need with no watermark and no ads in the way. The focus stays on making the pattern, not managing limits."
    ),

    row("FAQ", null, "Heading", "FAQs"),
    row("FAQ", 1, "Question", "How do I make a polka dot pattern without Photoshop?"),
    row(
        "FAQ",
        1,
        "Answer",
        "Open the online generator, adjust size, spacing, and colors, then download your file. You can skip design software and still get a clean <strong>polka dot pattern</strong> for web or print."
    ),
    row("FAQ", 2, "Question", "Can I create a polka dot background in custom colors?"),
    row(
        "FAQ",
        2,
        "Answer",
        "Yes. Set the dot color and background color yourself, or start from a theme palette like muted tones, sunset, or mono, then refine until it matches your brand."
    ),
    row("FAQ", 3, "Question", "Can the dots be shapes, emoji, or text instead of circles?"),
    row(
        "FAQ",
        3,
        "Answer",
        "Yes. Besides round dots, you can use preset shapes, emoji, or custom text as the repeating unit so the pattern feels more playful or on-brand."
    ),
    row("FAQ", 4, "Question", "Can I upload my own image to use as a polka dot?"),
    row(
        "FAQ",
        4,
        "Answer",
        "Yes. Upload an image and use it as the repeating unit. That helps when you want a branded <strong>dot pattern</strong> instead of a plain circle fill."
    ),
    row("FAQ", 5, "Question", "What file formats can I download?"),
    row(
        "FAQ",
        5,
        "Answer",
        "You can download PNG, JPEG, SVG, and CSS code. Pick the format that fits your workflow, whether you need a flat image or code for a site."
    ),
    row("FAQ", 6, "Question", "Can I set a custom download size?"),
    row(
        "FAQ",
        6,
        "Answer",
        "Yes. Choose the dimensions you need before you export, so the file is ready for banners, posts, or print layouts without extra resizing."
    ),
    row("FAQ", 7, "Question", "Is the Polka dot generator free to use?"),
    row(
        "FAQ",
        7,
        "Answer",
        "Yes. DottyPic is free, with no usage limits, no watermark, and no ads interrupting your edits or downloads."
    ),
    row("FAQ", 8, "Question", "How do I add tilt or change the direction of the dots?"),
    row(
        "FAQ",
        8,
        "Answer",
        "Use the direction and tilt controls to angle the pattern. Small changes can make a <strong>dotted background pattern</strong> feel more dynamic without redrawing it."
    ),

    row("Final CTA", null, "Heading", "Make Your Dotted Look"),
    row(
        "Final CTA",
        null,
        "Body",
        "Try the free Polka dot generator, tweak every detail, and download a clean pattern when it feels right for your next project."
    ),
    row("Final CTA", null, "CTA Text", "Start Generating"),
    row("Final CTA", null, "CTA Link", ""),
];

async function main() {
    const registry = await loadRegistry();
    const registryEntry = registry.find((r) => r.slug === "polka-dot");
    const resolveToolLabel = makeToolLabelResolver(registry);

    const { content, errors, warnings } = transformSheetRows(rows, {
        registryEntry,
        toolLabelResolver: resolveToolLabel,
    });

    let ok = true;

    if (errors.length > 0) {
        console.error("FAIL: transform reported errors:");
        for (const e of errors) console.error("  " + e);
        ok = false;
    }
    if (warnings.length > 0) {
        console.error("FAIL: transform reported unexpected warnings (fixture should be clean):");
        for (const w of warnings) console.error("  " + w);
        ok = false;
    }
    if (!content) {
        console.error("FAIL: content is null");
        process.exit(1);
    }

    const produced = renderContentModule("Polka Dot Generator", content);
    const fixturePath = join(__dirname, "..", "..", "src", "content", "guides", "generated", "polka-dot.ts");
    const fixture = (await readFile(fixturePath, "utf8")).replace(/\r\n/g, "\n");

    if (produced !== fixture) {
        console.error("FAIL: transform output does not match generated/polka-dot.ts byte-for-byte.\n");
        const producedLines = produced.split("\n");
        const fixtureLines = fixture.split("\n");
        const max = Math.max(producedLines.length, fixtureLines.length);
        for (let i = 0; i < max; i++) {
            if (producedLines[i] !== fixtureLines[i]) {
                console.error(`  line ${i + 1}:`);
                console.error(`    fixture:  ${JSON.stringify(fixtureLines[i] ?? "<missing>")}`);
                console.error(`    produced: ${JSON.stringify(producedLines[i] ?? "<missing>")}`);
            }
        }
        ok = false;
    }

    if (!ok) {
        process.exit(1);
    }
    console.log("PASS: synthetic sheet rows reproduce generated/polka-dot.ts byte-for-byte.");
}

main().catch((err) => {
    console.error(err.stack ?? String(err));
    process.exit(1);
});
