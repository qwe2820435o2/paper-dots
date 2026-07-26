#!/usr/bin/env node
// Pulls guide-page copy from the private Google Sheet into src/content/guides/generated/.
//
// This script never runs git. It only ever writes generated content files (or, with
// --check, only reports whether it would); reviewing the diff and committing is a separate,
// deliberate step — see docs/guide-pages.md § M7.
//
// Usage:
//   npm run sync:guides             sync every tool in the registry
//   npm run sync:guides:check       report drift without writing (CI-safe)
//   node scripts/sync-guide-content.mjs --slug=polka-dot   sync one tool
//   node scripts/sync-guide-content.mjs --strict           warnings become failures
//   node scripts/sync-guide-content.mjs --verbose           print every warning inline

import { join } from "node:path";
import { assertEnv, getAuth, getSheetsClient, listSheetTabs, fetchTabRows } from "./lib/sheets-client.mjs";
import { loadRegistry, makeToolLabelResolver, CONTENT_ROOT } from "./lib/registry.mjs";
import { transformSheetRows } from "./lib/transform.mjs";
import { renderContentModule, writeIfChanged } from "./lib/emit.mjs";

function parseArgs(argv) {
    const flags = { check: false, strict: false, verbose: false, slug: null };
    for (const arg of argv) {
        if (arg === "--check") flags.check = true;
        else if (arg === "--strict") flags.strict = true;
        else if (arg === "--verbose") flags.verbose = true;
        else if (arg.startsWith("--slug=")) flags.slug = arg.slice("--slug=".length);
        else {
            console.error(`Unrecognized argument: ${arg}`);
            process.exit(2);
        }
    }
    return flags;
}

async function main() {
    const flags = parseArgs(process.argv.slice(2));

    assertEnv();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const sheets = getSheetsClient(getAuth());

    const registry = await loadRegistry();
    const resolveToolLabel = makeToolLabelResolver(registry);

    const liveTabs = await listSheetTabs(sheets, spreadsheetId);
    const liveTabSet = new Set(liveTabs);

    const targets = flags.slug ? registry.filter((r) => r.slug === flags.slug) : registry;
    if (flags.slug && targets.length === 0) {
        console.error(`No registry entry for slug "${flags.slug}"`);
        process.exit(2);
    }

    const unmappedLiveTabs = liveTabs.filter((t) => !registry.some((r) => r.sheetTab === t));
    if (unmappedLiveTabs.length > 0) {
        console.log(`ℹ sheet tabs not in the registry (expected for About/Header/Footer): ${unmappedLiveTabs.join(", ")}`);
    }

    let anyFailed = false;
    let anyWouldChange = false;
    const summaries = [];

    for (const entry of targets) {
        if (!liveTabSet.has(entry.sheetTab)) {
            console.error(`✗ ${entry.slug}: registry expects sheet tab "${entry.sheetTab}", which does not exist in the spreadsheet`);
            anyFailed = true;
            continue;
        }

        const rows = await fetchTabRows(sheets, spreadsheetId, entry.sheetTab);
        const { content, errors, warnings } = transformSheetRows(rows, {
            registryEntry: entry,
            toolLabelResolver: resolveToolLabel,
        });

        const effectiveErrors = flags.strict ? [...errors, ...warnings] : errors;

        if (flags.verbose || warnings.length > 0) {
            for (const w of warnings) console.log(`  ⚠ [${entry.slug}] ${w}`);
        }
        if (errors.length > 0) {
            for (const e of errors) console.log(`  ✗ [${entry.slug}] ${e}`);
        }

        if (!content || (flags.strict && warnings.length > 0)) {
            console.error(`✗ ${entry.slug}: aborted (${effectiveErrors.length} error(s)), no file written`);
            anyFailed = true;
            continue;
        }

        const filePath = join(CONTENT_ROOT, "generated", `${entry.slug}.ts`);
        const text = renderContentModule(entry.sheetTab, content);
        const result = await writeIfChanged(filePath, text, { dryRun: flags.check });

        if (flags.check && result === "written") anyWouldChange = true;

        const en = content.en;
        summaries.push(
            `${result === "written" ? (flags.check ? "would update" : "updated") : "unchanged"}  ${entry.slug}: ` +
                `${en.features.length} features, ${en.howTo?.steps.length ?? 0} steps, ` +
                `${en.why?.cards.length ?? 0} why-cards, ${en.faq?.items.length ?? 0} faq, ` +
                `ja: ${content.ja ? "yes" : "no"}`
        );
    }

    console.log("\n" + summaries.map((s) => `  ${s}`).join("\n"));

    if (anyFailed) {
        console.error("\nSync finished with failures — see errors above. No partial tool was left half-written.");
        process.exit(1);
    }
    if (flags.check && anyWouldChange) {
        console.error("\n--check: generated files are out of date. Run `npm run sync:guides` and commit the diff.");
        process.exit(1);
    }
    console.log("\nSync OK.");
}

main().catch((err) => {
    console.error(err.stack ?? String(err));
    process.exit(1);
});
