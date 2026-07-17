import { SHAPE_PATHS } from "@/lib/dotShapes";

export const SAMPLE_SHAPE_IDS = ["diamond", "heart", "star", "crown", "leaf", "crescent"] as const;

export type SampleShapeId = (typeof SAMPLE_SHAPE_IDS)[number];

const SAMPLE_SHAPE_LABELS: Record<SampleShapeId, string> = {
    diamond: "Diamond",
    heart: "Heart",
    star: "Star",
    crown: "Crown",
    leaf: "Leaf",
    crescent: "Crescent",
};

const SAMPLE_SHAPE_PATHS: Record<SampleShapeId, string> = Object.fromEntries(
    SAMPLE_SHAPE_IDS.map((id) => [id, SHAPE_PATHS[id]!]),
) as Record<SampleShapeId, string>;

// Intrinsic decode size for the generated icon SVGs. Without explicit width/height, browsers
// fall back to a small default (150x150 in Chromium) when rasterizing an <img> for canvas
// drawImage, which looks visibly blurry once a polka dot preset applies rotation/skew (the
// affine resample has too little source detail to stay crisp at a steep angle).
const ICON_RASTER_SIZE = 512;

// SHAPE_PATHS coordinates are normalized to a unit box centered at (0, 0) (roughly -0.5..0.5),
// so a viewBox of that size (with a hair of padding) frames each shape with no extra work.
export function buildShapeIconDataUrl(path: string, color: string): string {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_RASTER_SIZE}" height="${ICON_RASTER_SIZE}" viewBox="-0.52 -0.52 1.04 1.04"><path d="${path}" fill="${color}"/></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function buildSampleShapeIconDataUrl(id: SampleShapeId, color: string): string {
    return buildShapeIconDataUrl(SAMPLE_SHAPE_PATHS[id], color);
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
export function buildCharacterIconDataUrl(text: string, color: string): string {
    const escaped = escapeXmlText(text || "A");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ICON_RASTER_SIZE}" height="${ICON_RASTER_SIZE}" viewBox="-0.52 -0.52 1.04 1.04"><text x="0" y="0" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-weight="700" font-size="0.8" fill="${color}">${escaped}</text></svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export interface SampleIcon {
    id: SampleShapeId;
    label: string;
}

/** Sample shape catalog from the same shape library the decorate tool uses; colored on demand via buildSampleShapeIconDataUrl. */
export const SAMPLE_ICONS: SampleIcon[] = SAMPLE_SHAPE_IDS.map((id) => ({
    id,
    label: SAMPLE_SHAPE_LABELS[id],
}));
