// Edge-case coverage for transformSheetRows that the byte-for-byte fixture test
// (transform.smoke.mjs) doesn't exercise, since that fixture is a clean, complete tab.
//
// Run with: node scripts/test/transform.edgecases.mjs

import { transformSheetRows } from "../lib/transform.mjs";
import { loadRegistry, makeToolLabelResolver } from "../lib/registry.mjs";

let rowNumber = 1;
function row(section, itemId, fieldName, en, ja = "") {
    rowNumber++;
    return { rowNumber, section, itemId: itemId === null ? "" : String(itemId), fieldName, en, htmlTag: "", ja };
}

const failures = [];
function check(label, condition) {
    if (!condition) failures.push(label);
}

async function main() {
    const registry = await loadRegistry();
    const registryEntry = registry.find((r) => r.slug === "polka-dot");
    const resolveToolLabel = makeToolLabelResolver(registry);
    const ctx = { registryEntry, toolLabelResolver: resolveToolLabel };

    const minimalRequired = [
        row("Meta Information", null, "Meta Title", "T"),
        row("Meta Information", null, "Meta Description", "D"),
        row("Hero", null, "Headline", "H"),
        row("Hero", null, "Primary CTA Text", "Go"),
    ];

    // 1. Missing a required field aborts the tab with content === null.
    {
        const rows = minimalRequired.filter((r) => r.fieldName !== "Meta Description");
        const { content, errors } = transformSheetRows(rows, ctx);
        check("missing required field -> content is null", content === null);
        check("missing required field -> error names meta.description", errors.some((e) => e.includes("meta.description")));
    }

    // 2. A complete required set produces content.
    {
        const { content, errors } = transformSheetRows(minimalRequired, ctx);
        check("complete required set -> content produced", content !== null);
        check("complete required set -> no errors", errors.length === 0);
    }

    // 3. Item ID gaps are compacted into a dense array, with a warning.
    {
        const rows = [
            ...minimalRequired,
            row("Why", null, "Why Title", "Why"),
            row("Why", 1, "Why Title", "First"),
            row("Why", 1, "Why Description", "First body"),
            row("Why", 4, "Why Title", "Second"), // gap: 1, 4
            row("Why", 4, "Why Description", "Second body"),
        ];
        const { content, warnings } = transformSheetRows(rows, ctx);
        check("gap compaction -> exactly 2 why cards", content.en.why.cards.length === 2);
        check("gap compaction -> order preserved (First, Second)", content.en.why.cards[0].heading === "First" && content.en.why.cards[1].heading === "Second");
        check("gap compaction -> warns about the gap", warnings.some((w) => w.includes("gaps")));
    }

    // 4. Disallowed inline HTML in a rich field gets escaped, not passed through, with a warning.
    {
        const rows = [
            ...minimalRequired,
            row("Feature", 1, "Feature Title", "Heading"),
            row("Feature", 1, "Feature Description", 'Body with <script>alert(1)</script> and <em>ok</em>'),
        ];
        const { content, warnings } = transformSheetRows(rows, ctx);
        const body = content.en.features[0].body;
        check("disallowed tag -> <script> not present verbatim", !body.includes("<script>"));
        check("disallowed tag -> escaped to &lt;script&gt;", body.includes("&lt;script&gt;"));
        check("disallowed tag -> warns", warnings.some((w) => w.includes("disallowed tag")));
    }

    // 5. Allowed inline HTML (strong/em/br/span.swash) passes through unchanged.
    {
        const rows = [
            ...minimalRequired,
            row("Feature", 1, "Feature Title", "Heading"),
            row("Feature", 1, "Feature Description", "Body with <strong>bold</strong> and <em>em</em> and<br>a break"),
        ];
        const { content, warnings } = transformSheetRows(rows, ctx);
        check(
            "allowed tags -> passed through unchanged",
            content.en.features[0].body === "Body with <strong>bold</strong> and <em>em</em> and<br>a break"
        );
        check("allowed tags -> no warnings", warnings.length === 0);
    }

    // 6. A plain-text field carrying something that looks like a tag is warned about, not
    //    silently stripped or escaped (it renders as literal text, which is a copy bug, not
    //    a security issue).
    {
        const rows = [
            ...minimalRequired,
            row("Why", null, "Why Title", "Why"),
            row("Why", 1, "Why Title", "A <strong>bold</strong> title"),
            row("Why", 1, "Why Description", "plain body"),
        ];
        const { content, warnings } = transformSheetRows(rows, ctx);
        check(
            "plain field with tag-looking text -> value unchanged",
            content.en.why.cards[0].heading === "A <strong>bold</strong> title"
        );
        check("plain field with tag-looking text -> warns", warnings.some((w) => w.includes("plain text")));
    }

    // 7. Tool Recommendation: label resolves via the registry when Tool Link is blank.
    {
        const rows = [...minimalRequired, row("Tool Recommendation", 1, "Tool Name", "Geo Pattern")];
        const { content, warnings } = transformSheetRows(rows, ctx);
        check("tool link resolves via registry", content.en.toolLinks.items[0].href === "/geometric-patterns");
        check("tool link resolution -> no warnings", warnings.length === 0);
    }

    // 8. Tool Recommendation: unresolvable label is dropped, not emitted as href="#".
    {
        const rows = [...minimalRequired, row("Tool Recommendation", 1, "Tool Name", "Nonexistent Tool")];
        const { content, warnings } = transformSheetRows(rows, ctx);
        check("unresolvable tool link -> dropped, not null section (lead absent too)", content.en.toolLinks === null);
        check("unresolvable tool link -> warns", warnings.some((w) => w.includes("didn't resolve")));
    }

    // 9. Tool Recommendation: a card pointing at the tool's own guide is dropped.
    {
        const rows = [...minimalRequired, row("Tool Recommendation", 1, "Tool Name", "Polka Dot")];
        const { content, warnings } = transformSheetRows(rows, ctx);
        check("self-link -> dropped", content.en.toolLinks === null);
        check("self-link -> warns", warnings.some((w) => w.includes("own guide")));
    }

    // 10. An unrecognized Section/Field Name is skipped with a warning, not fatal.
    {
        const rows = [...minimalRequired, row("Nonsense Section", null, "Nonsense Field", "value")];
        const { content, errors, warnings } = transformSheetRows(rows, ctx);
        check("unknown field -> content still produced", content !== null);
        check("unknown field -> no errors", errors.length === 0);
        check("unknown field -> warns", warnings.some((w) => w.includes("unrecognized")));
    }

    // 11. Sheet's Url column mismatching the registry is a hard error.
    {
        const rows = [...minimalRequired, row("Url", null, "URL", "/wrong-path")];
        const { errors } = transformSheetRows(rows, ctx);
        check("Url mismatch -> error", errors.some((e) => e.includes("does not match registry.guidePath")));
    }

    // 12. Incomplete JA column omits ja entirely rather than emitting half-translated content.
    {
        const rows = [...minimalRequired, row("Hero", null, "Headline", "H", "JA headline only, no meta title")];
        const { content, warnings } = transformSheetRows(rows, ctx);
        check("incomplete ja -> ja omitted", content.ja === undefined);
        check("incomplete ja -> warns", warnings.some((w) => w.includes("JA column incomplete")));
    }

    if (failures.length > 0) {
        console.error(`FAIL (${failures.length}/12 checks failed):`);
        for (const f of failures) console.error("  - " + f);
        process.exit(1);
    }
    console.log("PASS: all edge-case checks passed.");
}

main().catch((err) => {
    console.error(err.stack ?? String(err));
    process.exit(1);
});
