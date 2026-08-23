// Pure row -> GuideContentByLocale transform. No network, no filesystem — this is what
// makes the mapping testable without live Sheets credentials (see scripts/test/*.mjs).

import {
    COLLECTIONS,
    FIELD_MAP,
    FORMATS_COLLECTION_FIELD,
    FORMATS_COLLECTION_SECTION,
    REQUIRED_PATHS,
    normalize,
} from "./sheet-schema.mjs";
import { sanitizeRichText } from "./rich-text.mjs";

const RICH_SINGLETON_PATHS = new Set(["hero.headline"]);
const RICH_COLLECTION_FIELDS = {
    feature: new Set(["heading", "body"]),
};
// faq.items[].answer is rich too, but faq is a collection keyed by "faq" with fields
// question/answer — expressed here rather than duplicated per-collection above.
RICH_COLLECTION_FIELDS.faq = new Set(["answer"]);

const HTML_LOOKING = /<[a-zA-Z/][^>]*>/;

// Reverse index: fieldName-only -> [{ key: "section::field", path }], for the
// section-typo fallback described in docs/guide-pages.md.
const FIELD_NAME_INDEX = new Map();
for (const [key, path] of Object.entries(FIELD_MAP)) {
    const [, fieldName] = key.split("::");
    if (!FIELD_NAME_INDEX.has(fieldName)) FIELD_NAME_INDEX.set(fieldName, []);
    FIELD_NAME_INDEX.get(fieldName).push({ key, path });
}

function setPath(obj, dotPath, value) {
    const parts = dotPath.split(".");
    let node = obj;
    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (typeof node[part] !== "object" || node[part] === null) node[part] = {};
        node = node[part];
    }
    node[parts[parts.length - 1]] = value;
}

function getPath(obj, dotPath) {
    return dotPath.split(".").reduce((node, part) => (node == null ? undefined : node[part]), obj);
}

/** @param {string} rawItemId
 *  @returns {number|null} parsed Item ID, or null if the cell was blank/non-numeric. */
function parseItemId(rawItemId) {
    const trimmed = String(rawItemId ?? "").trim();
    if (trimmed === "") return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
}

/** Runs one locale column (EN or JA) through the schema. Returns a draft GuideContent-shaped
 *  object (not yet null-checked for optional sections) plus diagnostics. */
function buildLocaleDraft(rows, locale, { registryEntry, toolLabelResolver }, diagnostics) {
    const draft = {};
    const collectionItems = {}; // normalize(section) -> Map<itemId, partial item>
    const formatRows = [];

    for (const row of rows) {
        const value = String(row[locale] ?? "").trim();
        if (value === "") continue;

        const section = normalize(row.section);
        const fieldName = normalize(row.fieldName);
        const itemId = parseItemId(row.itemId);

        if (section === "url" && fieldName === "url") {
            if (locale === "en" && value !== registryEntry.guidePath) {
                diagnostics.errors.push(
                    `row ${row.rowNumber}: sheet Url "${value}" does not match registry.guidePath ` +
                        `"${registryEntry.guidePath}" for slug "${registryEntry.slug}" — the registry is authoritative, fix the sheet`
                );
            }
            continue;
        }

        if (section === FORMATS_COLLECTION_SECTION && fieldName === FORMATS_COLLECTION_FIELD) {
            formatRows.push({ itemId, value });
            continue;
        }

        if (itemId === null) {
            // Singleton field.
            const key = `${section}::${fieldName}`;
            let path = FIELD_MAP[key];
            if (!path) {
                const candidates = FIELD_NAME_INDEX.get(fieldName) ?? [];
                if (candidates.length === 1) {
                    path = candidates[0].path;
                    diagnostics.warnings.push(
                        `row ${row.rowNumber}: Section "${row.section}" doesn't match any field named ` +
                            `"${row.fieldName}", but the field name is unique sheet-wide — mapped to ${path} anyway`
                    );
                } else {
                    diagnostics.warnings.push(
                        `row ${row.rowNumber}: unrecognized Section/Field Name "${row.section}" / "${row.fieldName}" — skipped`
                    );
                    continue;
                }
            }

            let outValue = value;
            if (RICH_SINGLETON_PATHS.has(path)) {
                const { html, violations } = sanitizeRichText(value);
                outValue = html;
                for (const v of violations) {
                    diagnostics.warnings.push(`row ${row.rowNumber} (${path}): ${v} — escaped`);
                }
            } else if (HTML_LOOKING.test(value)) {
                diagnostics.warnings.push(
                    `row ${row.rowNumber} (${path}): value contains what looks like a tag, but this field ` +
                        `renders as plain text — check for a paste error`
                );
            }
            setPath(draft, path, outValue);
            continue;
        }

        // Collection field.
        const collection = COLLECTIONS[section];
        if (!collection) {
            diagnostics.warnings.push(
                `row ${row.rowNumber}: Item ID given but Section "${row.section}" is not a configured collection — skipped`
            );
            continue;
        }

        let prop = collection.fields[fieldName];
        if (!prop) {
            const allCollectionFields = Object.entries(COLLECTIONS).flatMap(([sec, def]) =>
                Object.entries(def.fields).map(([fn, p]) => ({ section: sec, fieldName: fn, prop: p }))
            );
            const candidates = allCollectionFields.filter((c) => c.fieldName === fieldName);
            if (candidates.length === 1) {
                prop = candidates[0].prop;
                diagnostics.warnings.push(
                    `row ${row.rowNumber}: Section "${row.section}" has no field "${row.fieldName}", but it's ` +
                        `unique across all collections — mapped to ${prop} anyway`
                );
            } else {
                diagnostics.warnings.push(
                    `row ${row.rowNumber}: unrecognized Field Name "${row.fieldName}" in Section "${row.section}" — skipped`
                );
                continue;
            }
        }

        if (!collectionItems[section]) collectionItems[section] = new Map();
        if (!collectionItems[section].has(itemId)) collectionItems[section].set(itemId, {});
        const item = collectionItems[section].get(itemId);

        let outValue = value;
        const richFields = RICH_COLLECTION_FIELDS[section];
        if (richFields && richFields.has(prop)) {
            const { html, violations } = sanitizeRichText(value);
            outValue = html;
            for (const v of violations) {
                diagnostics.warnings.push(`row ${row.rowNumber} (${section}[${itemId}].${prop}): ${v} — escaped`);
            }
        } else if (HTML_LOOKING.test(value)) {
            diagnostics.warnings.push(
                `row ${row.rowNumber} (${section}[${itemId}].${prop}): value contains what looks like a tag, ` +
                    `but this field renders as plain text — check for a paste error`
            );
        }
        setPath(item, prop, outValue);
    }

    // Formats: sort rows with an Item ID numerically first (preserving encounter order for
    // any without one), then flatten each cell's comma-separated contents.
    formatRows.sort((a, b) => {
        if (a.itemId === null && b.itemId === null) return 0;
        if (a.itemId === null) return 1;
        if (b.itemId === null) return -1;
        return a.itemId - b.itemId;
    });
    const formats = formatRows.flatMap((r) =>
        r.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
    );
    if (formats.length > 0) setPath(draft, "hero.formats", formats);

    // Compact each collection into a dense array ordered by Item ID, flagging gaps.
    for (const [section, itemsMap] of Object.entries(collectionItems)) {
        const collection = COLLECTIONS[section];
        const sortedIds = [...itemsMap.keys()].sort((a, b) => a - b);
        const expectedNext = sortedIds.length > 0 ? Array.from({ length: sortedIds.length }, (_, i) => i + 1) : [];
        const isDense = sortedIds.every((id, i) => id === expectedNext[i]);
        if (!isDense) {
            diagnostics.warnings.push(
                `Section "${section}": Item IDs [${sortedIds.join(", ")}] have gaps — compacted into a dense array in that order`
            );
        }

        let items = sortedIds.map((id) => ({ id: String(id), ...itemsMap.get(id) }));

        if (section === "tool recommendation") {
            items = resolveToolLinks(items, registryEntry, toolLabelResolver, diagnostics);
        }

        setPath(draft, collection.path, items);
    }

    return draft;
}

/** Resolves each Tool Recommendation card's href from its label against the registry when
 *  the sheet left "Tool Link" blank, drops cards that can't be resolved (never emits a
 *  dead href="#"), and drops a card that points at the tool's own guide. */
function resolveToolLinks(items, registryEntry, toolLabelResolver, diagnostics) {
    const resolved = [];
    for (const item of items) {
        let href = item.href;
        if (!href) {
            href = toolLabelResolver(item.label);
            if (!href) {
                diagnostics.warnings.push(
                    `Tool Recommendation item "${item.label}" (id ${item.id}): no Tool Link given and the label ` +
                        `didn't resolve against the registry — dropped`
                );
                continue;
            }
        }
        if (href === registryEntry.guidePath) {
            diagnostics.warnings.push(
                `Tool Recommendation item "${item.label}" (id ${item.id}): resolves to this tool's own guide — dropped`
            );
            continue;
        }
        resolved.push({ id: item.id, label: item.label, href });
    }
    return resolved;
}

function finalizeImages(content) {
    if (content.hero) {
        if (!content.hero.image?.src) {
            content.hero.image = null;
        } else if (content.hero.image.alt === undefined) {
            content.hero.image.alt = "";
        }
    }
    if (Array.isArray(content.features)) {
        for (const feature of content.features) {
            if (!feature.image?.src) {
                feature.image = null;
            } else if (feature.image.alt === undefined) {
                feature.image.alt = "";
            }
        }
    }
}

/** Nulls out an optional section if the sheet supplied nothing for it — a heading/lead with
 *  no text and an empty item array both count as absent. */
function nullifyEmptySections(content) {
    if (content.toolLinks && !content.toolLinks.lead && (content.toolLinks.items ?? []).length === 0) {
        content.toolLinks = null;
    } else if (content.toolLinks) {
        content.toolLinks.items = content.toolLinks.items ?? [];
        content.toolLinks.lead = content.toolLinks.lead ?? "";
    }

    for (const [key, itemsKey] of [
        ["howTo", "steps"],
        ["why", "cards"],
        ["faq", "items"],
    ]) {
        const section = content[key];
        if (section && !section.heading && (section[itemsKey] ?? []).length === 0) {
            content[key] = null;
        } else if (section) {
            section[itemsKey] = section[itemsKey] ?? [];
            section.heading = section.heading ?? "";
        }
    }

    if (content.finalCta && !content.finalCta.heading && !content.finalCta.body) {
        content.finalCta = null;
    }
}

function missingRequiredPaths(content) {
    return REQUIRED_PATHS.filter((path) => {
        const value = getPath(content, path);
        return typeof value !== "string" || value.trim() === "";
    });
}

/** Builds a GuideContent object with keys in the same fixed order every time, regardless of
 *  what the draft happened to set — this is what keeps JSON.stringify output (and therefore
 *  `git diff`) stable across runs. Missing optional pieces stay undefined/omitted here; the
 *  emitter's JSON.stringify drops undefined keys the same way on every run. */
function toOrderedContent(draft) {
    return {
        name: draft.name ?? "",
        meta: {
            title: draft.meta?.title ?? "",
            description: draft.meta?.description ?? "",
            ogTitle: draft.meta?.ogTitle ?? "",
            ogDescription: draft.meta?.ogDescription ?? "",
        },
        hero: {
            headline: draft.hero?.headline ?? "",
            subheadline: draft.hero?.subheadline ?? "",
            image: draft.hero?.image ?? null,
            cta: {
                text: draft.hero?.cta?.text ?? "",
                href: draft.hero?.cta?.href ?? null,
            },
            formats: draft.hero?.formats ?? [],
        },
        toolLinks: draft.toolLinks
            ? {
                  lead: draft.toolLinks.lead ?? "",
                  items: (draft.toolLinks.items ?? []).map((i) => ({ id: i.id, label: i.label ?? "", href: i.href ?? "" })),
              }
            : null,
        features: (draft.features ?? []).map((f) => ({
            id: f.id,
            heading: f.heading ?? "",
            body: f.body ?? "",
            image: f.image ?? null,
            cta: f.cta?.text ? { text: f.cta.text, href: f.cta.href ?? null } : null,
        })),
        howTo: draft.howTo
            ? {
                  heading: draft.howTo.heading ?? "",
                  steps: (draft.howTo.steps ?? []).map((s) => ({ id: s.id, heading: s.heading ?? "", body: s.body ?? "" })),
              }
            : null,
        why: draft.why
            ? {
                  heading: draft.why.heading ?? "",
                  cards: (draft.why.cards ?? []).map((c) => ({ id: c.id, heading: c.heading ?? "", body: c.body ?? "" })),
              }
            : null,
        faq: draft.faq
            ? {
                  heading: draft.faq.heading ?? "",
                  items: (draft.faq.items ?? []).map((i) => ({ id: i.id, question: i.question ?? "", answer: i.answer ?? "" })),
              }
            : null,
        finalCta: draft.finalCta
            ? {
                  heading: draft.finalCta.heading ?? "",
                  body: draft.finalCta.body ?? "",
                  cta: {
                      text: draft.finalCta.cta?.text ?? "",
                      href: draft.finalCta.cta?.href ?? null,
                  },
              }
            : null,
    };
}

/** Translated locales, keyed by the app's routing code. The value is the sheet column header
 *  the copy is authored under, used only for diagnostics wording. */
const TRANSLATED_LOCALES = [
    { locale: "jp", column: "JP" },
    { locale: "id", column: "ID" },
];

/** @param {Array<{rowNumber:number, section:string, itemId:string, fieldName:string, en:string, htmlTag:string, jp:string, id:string}>} rows
 *  @param {{ registryEntry: object, toolLabelResolver: (label: string) => string|null }} context
 *  @returns {{ content: object|null, errors: string[], warnings: string[] }} */
export function transformSheetRows(rows, context) {
    const diagnostics = { errors: [], warnings: [] };

    const enDraft = buildLocaleDraft(rows, "en", context, diagnostics);
    finalizeImages(enDraft);
    nullifyEmptySections(enDraft);
    const enContent = toOrderedContent(enDraft);

    const missing = missingRequiredPaths(enContent);
    if (missing.length > 0) {
        diagnostics.errors.push(`missing required field(s) for EN: ${missing.join(", ")}`);
        return { content: null, errors: diagnostics.errors, warnings: diagnostics.warnings };
    }

    // A locale is emitted only when its column filled in every required field. A half-translated
    // column is dropped entirely rather than shipped, because `getGuideContent` falls back to EN
    // per *locale*, not per field — a partial draft would render blank headings, not English ones.
    const content = { en: enContent };
    for (const { locale, column } of TRANSLATED_LOCALES) {
        const hasCell = rows.some((r) => String(r[locale] ?? "").trim() !== "");
        if (!hasCell) continue;

        const draft = buildLocaleDraft(rows, locale, context, diagnostics);
        finalizeImages(draft);
        nullifyEmptySections(draft);
        const candidate = toOrderedContent(draft);
        const missingForLocale = missingRequiredPaths(candidate);
        if (missingForLocale.length > 0) {
            diagnostics.warnings.push(
                `${column} column incomplete (missing ${missingForLocale.join(", ")}) — omitting ${locale} from this tool`
            );
            continue;
        }
        content[locale] = candidate;
    }

    return { content, errors: diagnostics.errors, warnings: diagnostics.warnings };
}
