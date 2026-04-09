import type { DotConfig } from "@/store/slices/decorateSlice";

export interface GeneratedDot {
    x: number;
    y: number;
    size: number;
    rotation: number;
    /** 0-3 index into a palette array; used when colorMode === "palette" */
    paletteIndex: number;
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
    const avg = Math.max(1, config.size);
    const count = Math.min(MAX_DOTS, Math.max(0, Math.round(config.count)));

    const dots: GeneratedDot[] = new Array(count);
    for (let i = 0; i < count; i++) {
        const spread = (config.variance / 100) * 0.8;
        dots[i] = {
            x: rand() * width,
            y: rand() * height,
            size: avg * (1 - spread + rand() * spread * 2),
            rotation: rand() * 360,
            paletteIndex: Math.floor(rand() * 4),
        };
    }
    return dots;
}
