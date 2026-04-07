import type { DotConfig } from "@/store/slices/decorateSlice";

export interface GeneratedDot {
    x: number;
    y: number;
    size: number;
    rotation: number;
}

/** Hard cap to keep render cost bounded. */
const MAX_DOTS = 1500;

/** Mulberry32 — small, fast, deterministic PRNG. */
function mulberry32(seed: number): () => number {
    let a = seed >>> 0;
    return () => {
        a |= 0;
        a = (a + 0x6d2b79f5) | 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/**
 * Generate the dot layout for a given seed and configuration.
 *
 * Layout depends ONLY on `seed`, `config.density`, `config.size` and the
 * canvas dimensions. Color and shape do NOT change positions, so the user can
 * tweak them without reshuffling the picture.
 */
export function generateDots(
    seed: number,
    config: DotConfig,
    width: number,
    height: number,
): GeneratedDot[] {
    const rand = mulberry32(seed);
    const area = width * height;
    const avg = Math.max(4, config.size);
    // Keep dots loosely spaced regardless of size.
    const spacingFactor = 18;
    const rawCount = Math.round((config.density * area) / (avg * avg * spacingFactor / 4));
    const count = Math.min(MAX_DOTS, Math.max(0, rawCount));

    const dots: GeneratedDot[] = new Array(count);
    for (let i = 0; i < count; i++) {
        dots[i] = {
            x: rand() * width,
            y: rand() * height,
            // size jitter: 0.6x – 1.4x of base
            size: avg * (0.6 + rand() * 0.8),
            rotation: rand() * 360,
        };
    }
    return dots;
}
