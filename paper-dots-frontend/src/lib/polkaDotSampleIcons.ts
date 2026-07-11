import { SHAPE_PATHS } from "@/lib/dotShapes";

const SAMPLE_SHAPE_IDS = ["diamond", "heart", "star", "crown", "leaf", "crescent"] as const;

const SAMPLE_SHAPE_LABELS: Record<(typeof SAMPLE_SHAPE_IDS)[number], string> = {
    diamond: "Diamond",
    heart: "Heart",
    star: "Star",
    crown: "Crown",
    leaf: "Leaf",
    crescent: "Crescent",
};

// SHAPE_PATHS coordinates are normalized to a unit box centered at (0, 0) (roughly -0.5..0.5),
// so a viewBox of that size (with a hair of padding) frames each shape with no extra work.
function buildShapeIconDataUrl(path: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.52 -0.52 1.04 1.04"><path d="${path}" fill="#1a1a2e"/></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function escapeXmlText(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}

/** Same unit-box viewBox as buildShapeIconDataUrl, so the character sits at the same scale as the sample shapes. */
export function buildCharacterIconDataUrl(text: string): string {
    const escaped = escapeXmlText(text || "A");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.52 -0.52 1.04 1.04"><text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-weight="700" font-size="0.8" fill="#1a1a2e">${escaped}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface SampleIcon {
    id: string;
    label: string;
    /** Square (aspect 1) SVG data URL — usable directly as a polka dot `iconUrl`. */
    dataUrl: string;
}

/** Ready-to-use sample icons built from the same shape library the decorate tool uses. */
export const SAMPLE_ICONS: SampleIcon[] = SAMPLE_SHAPE_IDS.map((id) => ({
    id,
    label: SAMPLE_SHAPE_LABELS[id],
    dataUrl: buildShapeIconDataUrl(SHAPE_PATHS[id]!),
}));
