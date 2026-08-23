// The only network-touching module. Kept separate from transform.mjs so the row-mapping
// logic can be exercised by a local test without live credentials — see scripts/test/.

import { google } from "googleapis";

const REQUIRED_ENV = [
    "GOOGLE_SHEETS_SPREADSHEET_ID",
    "GOOGLE_SERVICE_ACCOUNT_EMAIL",
    "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_B64",
];

// The sheet's column headers stay as authored ("JP", "ID"); the field names they map to are
// the app's routing locale codes, which happen to match.
const REQUIRED_HEADERS = ["Section", "Item ID", "Field Name", "EN", "HTML Tag", "JP", "ID"];

export function assertEnv() {
    const missing = REQUIRED_ENV.filter((name) => !process.env[name]);
    if (missing.length > 0) {
        throw new Error(
            `Missing required environment variable(s): ${missing.join(", ")}.\n` +
                `See docs/guide-pages.md § M7 for the one-time service-account setup, or run\n` +
                `\`npm run sync:guides\` from a shell that has sourced .env.local (the npm script\n` +
                `already does this via --env-file-if-exists).`
        );
    }
}

export function getAuth() {
    const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
    const key = Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY_B64, "base64").toString("utf8");
    return new google.auth.JWT({
        email,
        key,
        scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
}

export function getSheetsClient(auth) {
    return google.sheets({ version: "v4", auth });
}

export async function listSheetTabs(sheets, spreadsheetId) {
    const res = await sheets.spreadsheets.get({
        spreadsheetId,
        fields: "sheets.properties.title",
    });
    return (res.data.sheets ?? []).map((s) => s.properties.title);
}

function resolveHeaderIndex(headerRow) {
    const normalized = headerRow.map((h) => String(h ?? "").trim());
    const index = {};
    for (const name of REQUIRED_HEADERS) {
        const i = normalized.findIndex((h) => h.toLowerCase() === name.toLowerCase());
        if (i === -1) {
            throw new Error(`Sheet tab is missing the required header "${name}" (found: ${normalized.join(", ")})`);
        }
        index[name] = i;
    }
    return index;
}

/** @returns {Array<{rowNumber:number, section:string, itemId:string, fieldName:string, en:string, htmlTag:string, jp:string, id:string}>} */
export async function fetchTabRows(sheets, spreadsheetId, tabTitle) {
    const res = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `'${tabTitle}'!A:Z`,
        valueRenderOption: "UNFORMATTED_VALUE",
    });
    const values = res.data.values ?? [];
    if (values.length === 0) return [];

    const [headerRow, ...dataRows] = values;
    const idx = resolveHeaderIndex(headerRow);

    return dataRows.map((row, i) => ({
        rowNumber: i + 2,
        section: row[idx["Section"]] ?? "",
        itemId: row[idx["Item ID"]] ?? "",
        fieldName: row[idx["Field Name"]] ?? "",
        en: row[idx["EN"]] ?? "",
        htmlTag: row[idx["HTML Tag"]] ?? "",
        jp: row[idx["JP"]] ?? "",
        id: row[idx["ID"]] ?? "",
    }));
}
