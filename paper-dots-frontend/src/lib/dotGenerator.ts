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
    const avg = Math.max(1, config.size);
    // Dot count depends only on density, not size.
    // Fixed cell area is calibrated to size=14 so default behaviour is unchanged.
    const DENSITY_CELL_AREA = 14 * 14 * 18 / 4; // ≈ 882
    const rawCount = Math.round((config.density * area) / DENSITY_CELL_AREA);
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
