import { getShapesForSet, type IconShape } from "./geometricIconSets";

export interface GeometricConfig {
    iconSetId: string;
    /** 1-12 */
    rows: number;
    /** 1-12 */
    columns: number;
    backgroundColor: string;
    /** the solid color a shape gets when it doesn't land on the cutout color */
    frontColor: string;
    /** drives the deterministic PRNG; changing it (Shuffle) reshuffles both layout and colors */
    seed: number;
    /** 0-100: percentage of cells that get a shape; the rest stay empty (background only) */
    density: number;
    /** 0-100: shrinks each shape's fill of its cell, from 80% (0) down to 20% (100) */
    spacing: number;
    /** 0-360: extra rotation added on top of each shape's base rotation — a uniform offset
     *  applied to every shape when `randomizeRotation` is off, or the max of an independent
     *  per-shape random offset when it's on */
    rotation: number;
    /** 0-100: opacity applied to each shape group */
    opacity: number;
    /** when true, each shape gets its own independent random rotation in [0, rotation] instead
     *  of the same uniform `rotation` offset */
    randomizeRotation: boolean;
    /** when true, each shape gets its own independent random spacing in [0, spacing] instead of
     *  the same uniform `spacing` ratio */
    randomizeSpacing: boolean;
}

/** The fixed "punched through to reveal white" color a shape can land on, alongside frontColor. */
export const CUTOUT_COLOR = "#FFFFFF";

/** Fraction of a cell's box a shape's own 100x100 box is scaled to fill in the icon-set
 *  thumbnail spec sheet (fixed — that preview is intentionally decoupled from the live
 *  density/spacing/rotation/opacity sliders). The live grid derives its own ratio from
 *  `config.spacing` instead — see `buildIconGridSvgString`. */
const SHAPE_PADDING_RATIO = 0.8;

interface ShapeVariant {
    shape: IconShape;
    rotation: number;
}

const ROTATIONS_BY_SYMMETRY: Record<number, number[]> = {
    1: [0],
    2: [0, 90],
    4: [0, 90, 180, 270],
};

/** Small deterministic PRNG (mulberry32) so a given seed always reproduces the same grid. */
function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return function random() {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function round(n: number): number {
    return Math.round(n * 100) / 100;
}

function shuffle<T>(arr: T[], rng: () => number): T[] {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

/** Every visually distinct shape/rotation combo in an icon set (deduped by `symmetry`) — the unit
 *  that "each pattern only shows once" is enforced over. */
function getShapeVariants(iconSetId: string): ShapeVariant[] {
    const shapes = getShapesForSet(iconSetId);
    const variants: ShapeVariant[] = [];
    for (const shape of shapes) {
        for (const rotation of ROTATIONS_BY_SYMMETRY[shape.symmetry ?? 4]) {
            variants.push({ shape, rotation });
        }
    }
    return variants;
}

/** Fills `count` slots with shape variants, reshuffling the full variant list every time it runs
 *  out — so a variant only repeats once every other variant has appeared. */
function fillVariants(variants: ShapeVariant[], count: number, rng: () => number): ShapeVariant[] {
    const filled: ShapeVariant[] = [];
    while (filled.length < count) {
        filled.push(...shuffle([...variants], rng));
    }
    filled.length = count;
    return filled;
}

/** Builds a standalone SVG string for the live pattern: a plain rows x columns grid where each
 *  shape/rotation only repeats once every other variant has appeared, and each cell independently
 *  lands on either `frontColor` or the fixed cutout white. */
export function buildIconGridSvgString(config: GeometricConfig, width: number, height: number): string {
    const rng = mulberry32(config.seed);
    const variants = getShapeVariants(config.iconSetId);
    const cellCount = config.rows * config.columns;

    // Density picks which cells get a shape at all; the rest stay empty (background only).
    const filledCount = Math.round(cellCount * (config.density / 100));
    const cellIndices = shuffle(
        Array.from({ length: cellCount }, (_, i) => i),
        rng,
    )
        .slice(0, filledCount)
        .sort((a, b) => a - b);
    const placed = fillVariants(variants, filledCount, rng);

    const cellW = width / config.columns;
    const cellH = height / config.rows;
    const minCell = Math.min(cellW, cellH);
    // A single uniform scale (not independent x/y) so a shape's own proportions never stretch —
    // a circle stays a circle even when rows != columns makes cells non-square. Spacing shrinks
    // the padding ratio from 0.8 (0%) down to 0.2 (100%), opening up more gap around each shape.
    const paddingRatioForSpacing = (spacing: number) => 0.8 - (spacing / 100) * 0.6;
    const uniformS0 = round((minCell * paddingRatioForSpacing(config.spacing)) / 100);
    const opacity = round(config.opacity / 100);

    let cellsMarkup = "";
    cellIndices.forEach((cellIndex, i) => {
        const variant = placed[i];
        const col = cellIndex % config.columns;
        const row = Math.floor(cellIndex / config.columns);
        const cx = round(cellW * (col + 0.5));
        const cy = round(cellH * (row + 0.5));
        const color = rng() < 0.5 ? config.frontColor : CUTOUT_COLOR;
        const jitter = config.randomizeRotation ? round(rng() * config.rotation) : config.rotation;
        const rotation = variant.rotation + jitter;
        const s0 = config.randomizeSpacing
            ? round((minCell * paddingRatioForSpacing(rng() * config.spacing)) / 100)
            : uniformS0;

        cellsMarkup += `<g transform="translate(${cx} ${cy}) rotate(${rotation}) scale(${s0})" opacity="${opacity}">${variant.shape.primary(color)}</g>`;
    });

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
        `<rect width="${width}" height="${height}" fill="${config.backgroundColor}"/>` +
        cellsMarkup +
        `</svg>`
    );
}

const THUMBNAIL_SEED = 1;

/** Builds a deterministic single-color thumbnail SVG for an icon set: every shape's visually
 *  distinct rotation appears at most once, shuffled into a subset of the rows x columns cells so
 *  the layout doesn't read as mechanically ordered. Used by the icon-set picker, not the live grid. */
export function buildIconSetThumbnailSvgString(
    iconSetId: string,
    backgroundColor: string,
    frontColor: string,
    rows: number,
    columns: number,
    width: number,
    height: number,
): string {
    const rng = mulberry32(THUMBNAIL_SEED);
    const variants = shuffle([...getShapeVariants(iconSetId)], rng);

    const cellCount = rows * columns;
    const cellOrder = shuffle(
        Array.from({ length: cellCount }, (_, i) => i),
        rng,
    ).slice(0, variants.length);

    const cellW = width / columns;
    const cellH = height / rows;
    const s0 = round((Math.min(cellW, cellH) * SHAPE_PADDING_RATIO) / 100);

    let cellsMarkup = "";
    variants.forEach((variant, i) => {
        const cellIndex = cellOrder[i];
        if (cellIndex === undefined) return;
        const col = cellIndex % columns;
        const row = Math.floor(cellIndex / columns);

        const cx = round(cellW * (col + 0.5));
        const cy = round(cellH * (row + 0.5));

        cellsMarkup += `<g transform="translate(${cx} ${cy}) rotate(${variant.rotation}) scale(${s0})">${variant.shape.primary(frontColor)}</g>`;
    });

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
        `<rect width="${width}" height="${height}" fill="${backgroundColor}"/>` +
        cellsMarkup +
        `</svg>`
    );
}

/** Rasterizes the icon grid SVG to a PNG/JPEG blob via an offscreen canvas. */
export function rasterizeIconGridSvg(
    config: GeometricConfig,
    width: number,
    height: number,
    mimeType: "image/png" | "image/jpeg",
    quality = 0.92,
): Promise<Blob> {
    const svg = buildIconGridSvgString(config, width, height);
    const url = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
                reject(new Error("Canvas 2D context unavailable"));
                return;
            }
            ctx.drawImage(img, 0, 0, width, height);
            canvas.toBlob(
                (blob) => (blob ? resolve(blob) : reject(new Error("toBlob returned null"))),
                mimeType,
                quality,
            );
        };
        img.onerror = () => reject(new Error("Failed to rasterize icon grid SVG"));
        img.src = url;
    });
}
