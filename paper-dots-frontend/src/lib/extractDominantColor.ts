export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
    const rf = r / 255, gf = g / 255, bf = b / 255;
    const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
    const l = (max + min) / 2;
    if (max === min) return [0, 0, l];
    const d = max - min;
    const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    let h = 0;
    if (max === rf) h = ((gf - bf) / d + (gf < bf ? 6 : 0)) / 6;
    else if (max === gf) h = ((bf - rf) / d + 2) / 6;
    else h = ((rf - gf) / d + 4) / 6;
    return [h, s, l];
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
    if (s === 0) {
        const v = Math.round(l * 255);
        return [v, v, v];
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1 / 6) return p + (q - p) * 6 * t;
        if (t < 1 / 2) return q;
        if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
        return p;
    };
    return [
        Math.round(hue2rgb(h + 1 / 3) * 255),
        Math.round(hue2rgb(h) * 255),
        Math.round(hue2rgb(h - 1 / 3) * 255),
    ];
}

function rgbToHex(r: number, g: number, b: number): string {
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

interface SoftenOptions {
    minLightness?: number;
    saturationScale?: number;
}

function softenAverage(r: number, g: number, b: number, opts: SoftenOptions = {}): string {
    const { minLightness = 0.75, saturationScale = 0.45 } = opts;
    const [h, s, l] = rgbToHsl(r, g, b);
    const newL = Math.max(l, minLightness);
    const newS = s * saturationScale;
    const [fr, fg, fb] = hslToRgb(h, newS, newL);
    return rgbToHex(fr, fg, fb);
}

export interface ExtractOptions extends SoftenOptions {
    /** sample grid size (default 40 → ≤1600 samples) */
    sampleSize?: number;
    /** if true, returns the raw average color (no Morandi softening) */
    raw?: boolean;
}

interface NormRect {
    sx: number;
    sy: number;
    sw: number;
    sh: number;
}

function averageColor(
    img: HTMLImageElement,
    region: NormRect | null,
    sampleSize: number,
): [number, number, number] | null {
    const canvas = document.createElement("canvas");
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    const sx = region ? region.sx : 0;
    const sy = region ? region.sy : 0;
    const sw = region ? region.sw : img.width;
    const sh = region ? region.sh : img.height;
    if (sw <= 0 || sh <= 0) return null;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sampleSize, sampleSize);
    const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
    }
    if (count === 0) return null;
    return [Math.round(r / count), Math.round(g / count), Math.round(b / count)];
}

/**
 * Loads `url` and returns a softened average color of the whole image.
 * Falls back to `#fafafa` on error.
 */
export function extractPhotoColor(url: string, options: ExtractOptions = {}): Promise<string> {
    const { sampleSize = 40, raw = false } = options;
    return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
            const avg = averageColor(img, null, sampleSize);
            if (!avg) { resolve("#fafafa"); return; }
            resolve(raw ? rgbToHex(avg[0], avg[1], avg[2]) : softenAverage(avg[0], avg[1], avg[2], options));
        };
        img.onerror = () => resolve("#fafafa");
        img.src = url;
    });
}

/**
 * Extract the softened dominant color from a sub-rectangle of an already-loaded image.
 * Coordinates are in image pixel space.
 */
export function extractDominantColorFromRegion(
    img: HTMLImageElement,
    region: NormRect,
    options: ExtractOptions = {},
): string {
    const { sampleSize = 40, raw = false } = options;
    const avg = averageColor(img, region, sampleSize);
    if (!avg) return "#fafafa";
    return raw ? rgbToHex(avg[0], avg[1], avg[2]) : softenAverage(avg[0], avg[1], avg[2], options);
}

interface VividOptions {
    sampleSize?: number;
    /** quantization bins per channel (default 6 → 216 buckets) */
    bins?: number;
    /** discard pixels brighter than this luminance (0-1) */
    maxLuminance?: number;
    /** discard pixels darker than this luminance (0-1) */
    minLuminance?: number;
    /** discard pixels with HSL saturation below this (0-1) — strips white/gray/black */
    minSaturation?: number;
}

type VividRegion = NormRect;

function quantize(v: number, bins: number) {
    return Math.min(bins - 1, Math.floor((v / 256) * bins));
}

/**
 * Find the dominant non-neutral color in `img` (or a sub-region), quantizing the
 * pixel histogram and returning the centroid of the most frequent bucket. Falls
 * back to a desaturated average if no colorful pixels exist.
 */
export function extractDominantColorVivid(
    img: HTMLImageElement,
    region: VividRegion | null = null,
    options: VividOptions = {},
): string {
    const {
        sampleSize = 80,
        bins = 6,
        maxLuminance = 0.92,
        minLuminance = 0.08,
        minSaturation = 0.18,
    } = options;
    const canvas = document.createElement("canvas");
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "#fafafa";
    const sx = region ? region.sx : 0;
    const sy = region ? region.sy : 0;
    const sw = region ? region.sw : img.width;
    const sh = region ? region.sh : img.height;
    if (sw <= 0 || sh <= 0) return "#fafafa";
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sampleSize, sampleSize);
    const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;

    const buckets = new Map<number, { r: number; g: number; b: number; count: number }>();
    let fallbackR = 0, fallbackG = 0, fallbackB = 0, fallbackCount = 0;
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        fallbackR += r; fallbackG += g; fallbackB += b; fallbackCount++;
        const [, s, l] = rgbToHsl(r, g, b);
        if (l > maxLuminance || l < minLuminance) continue;
        if (s < minSaturation) continue;
        const key = quantize(r, bins) * bins * bins + quantize(g, bins) * bins + quantize(b, bins);
        const cell = buckets.get(key);
        if (cell) {
            cell.r += r; cell.g += g; cell.b += b; cell.count++;
        } else {
            buckets.set(key, { r, g, b, count: 1 });
        }
    }

    if (buckets.size === 0) {
        if (fallbackCount === 0) return "#fafafa";
        return rgbToHex(
            Math.round(fallbackR / fallbackCount),
            Math.round(fallbackG / fallbackCount),
            Math.round(fallbackB / fallbackCount),
        );
    }

    let best: { r: number; g: number; b: number; count: number } | null = null;
    for (const cell of buckets.values()) {
        if (!best || cell.count > best.count) best = cell;
    }
    if (!best) return "#fafafa";
    return rgbToHex(
        Math.round(best.r / best.count),
        Math.round(best.g / best.count),
        Math.round(best.b / best.count),
    );
}

/** Returns "#1a1a2e" or "#ffffff" depending on which has better contrast vs `bgHex`. */
export function getContrastTextColor(bgHex: string): string {
    const n = parseInt(bgHex.replace("#", ""), 16);
    const r = (n >> 16) & 0xff;
    const g = (n >> 8) & 0xff;
    const b = n & 0xff;
    const yiq = 0.299 * r + 0.587 * g + 0.114 * b;
    return yiq > 160 ? "#1a1a2e" : "#ffffff";
}
