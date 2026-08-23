#!/usr/bin/env node
// Pulls site-wide page copy (Home, Contact) from the private Google Sheet into
// messages/{en,jp,id}.json. Sibling to sync-guide-content.mjs, which handles the Create-tool
// guide pages instead — see scripts/lib/site-schema.mjs for why the two need different
// mapping logic despite sharing a spreadsheet.
//
// This script never runs git. It only ever writes messages/*.json (or, with --check, only
// reports whether it would); reviewing the diff and committing is a separate, deliberate step.
//
// Usage:
//   npm run sync:site             sync every tab in SITE_TABS
//   npm run sync:site:check       report drift without writing (CI-safe)
//   node scripts/sync-site-content.mjs --verbose   print every warning inline

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { assertEnv, getAuth, getSheetsClient, listSheetTabs, fetchTabRows } from "./lib/sheets-client.mjs";
import { SITE_TABS, setPath } from "./lib/site-schema.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const MESSAGES_ROOT = join(__dirname, "..", "messages");
const LOCALES = [
    { code: "en", column: "EN" },
    { code: "jp", column: "JP" },
    { code: "id", column: "ID" },
];

function parseArgs(argv) {
    const flags = { check: false, verbose: false };
    for (const arg of argv) {
        if (arg === "--check") flags.check = true;
        else if (arg === "--verbose") flags.verbose = true;
        else {
            console.error(`Unrecognized argument: ${arg}`);
            process.exit(2);
        }
    }
    return flags;
}

function normalizeLineEndings(value) {
    return value.replace(/\r\n/g, "\n");
}

/** @returns {"written"|"unchanged"} */
async function writeIfChanged(filePath, text, { dryRun = false } = {}) {
    let existing = null;
    try {
        existing = normalizeLineEndings(await readFile(filePath, "utf8"));
    } catch (err) {
        if (err.code !== "ENOENT") throw err;
    }

    if (existing === text) return "unchanged";
    if (!dryRun) {
        await mkdir(dirname(filePath), { recursive: true });
        await writeFile(filePath, text, "utf8");
    }
    return "written";
}

/** Applies one tab's rows for one locale onto a parsed messages object, in place.
 *  @returns {{ applied: number, unmapped: string[] }} */
function applyTabRows(rows, localeCode, fieldMap, messages) {
    let applied = 0;
    const unmapped = [];

    for (const row of rows) {
        const itemId = String(row.itemId ?? "").trim();
        if (itemId === "") continue;

        const path = fieldMap[itemId];
        if (!path) {
            unmapped.push(`row ${row.rowNumber}: Item ID "${itemId}" has no mapping in site-schema.mjs — skipped`);
            continue;
        }

        const value = String(row[localeCode] ?? "").trim();
        if (value === "") continue;

        setPath(messages, path, value);
        applied++;
    }

    return { applied, unmapped };
}

async function main() {
    const flags = parseArgs(process.argv.slice(2));

    assertEnv();
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    const sheets = getSheetsClient(getAuth());

    const liveTabs = await listSheetTabs(sheets, spreadsheetId);
    const liveTabSet = new Set(liveTabs);

    const tabNames = Object.keys(SITE_TABS);
    let anyFailed = false;

    // messagesByLocale[code] stays null until first touched, so a tab that fails to fetch
    // doesn't wipe out an otherwise-untouched locale file.
    const messagesByLocale = {};
    for (const { code } of LOCALES) {
        messagesByLocale[code] = JSON.parse(await readFile(join(MESSAGES_ROOT, `${code}.json`), "utf8"));
    }

    const allWarnings = [];

    for (const tabName of tabNames) {
        if (!liveTabSet.has(tabName)) {
            console.error(`✗ ${tabName}: expected sheet tab does not exist in the spreadsheet`);
            anyFailed = true;
            continue;
        }

        let rows;
        try {
            rows = await fetchTabRows(sheets, spreadsheetId, tabName);
        } catch (err) {
            console.error(`✗ ${tabName}: failed to read sheet tab: ${err.message}`);
            anyFailed = true;
            continue;
        }

        const fieldMap = SITE_TABS[tabName];
        for (const { code } of LOCALES) {
            const { applied, unmapped } = applyTabRows(rows, code, fieldMap, messagesByLocale[code]);
            if (code === "en") {
                console.log(`  ${tabName}: ${applied} field(s) applied`);
            }
            for (const w of unmapped) allWarnings.push(`[${tabName}/${code}] ${w}`);
        }
    }

    // Item IDs repeat across locale columns, so de-dupe the unmapped-field warnings before
    // printing — the same stray row otherwise reports three times, once per locale.
    const uniqueWarnings = [...new Set(allWarnings)];
    if (flags.verbose || uniqueWarnings.length > 0) {
        for (const w of uniqueWarnings) console.log(`  ⚠ ${w}`);
    }

    if (anyFailed) {
        console.error("\nSync finished with failures — see errors above. No file was written.");
        process.exit(1);
    }

    let anyWouldChange = false;
    for (const { code } of LOCALES) {
        const filePath = join(MESSAGES_ROOT, `${code}.json`);
        const text = normalizeLineEndings(JSON.stringify(messagesByLocale[code], null, 2)) + "\n";
        const result = await writeIfChanged(filePath, text, { dryRun: flags.check });
        if (flags.check && result === "written") anyWouldChange = true;
        console.log(`${result === "written" ? (flags.check ? "would update" : "updated") : "unchanged"}  messages/${code}.json`);
    }

    if (flags.check && anyWouldChange) {
        console.error("\n--check: messages/*.json are out of date. Run `npm run sync:site` and commit the diff.");
        process.exit(1);
    }
    console.log("\nSync OK.");
}

main().catch((err) => {
    console.error(err.stack ?? String(err));
    process.exit(1);
});
