export type Arrangement = "square" | "diagonal";

export interface PolkaDotConfig {
    arrangement: Arrangement;
    /** dot diameter in px, unscaled */
    dotSize: number;
    /** center-to-center spacing in px, unscaled */
    spacing: number;
    dotColor: string;
    backgroundColor: string;
    /** 0-100, applies only to the dot layer */
    opacity: number;
    /** degrees */
    rotation: number;
    /** degrees */
    skewX: number;
    /** degrees */
    skewY: number;
    /** multiplier applied to spacing/dotSize */
    zoom: number;
}

export interface DotGridTile {
    tileSize: number;
    dotRadius: number;
    centers: { x: number; y: number }[];
}

export function computeDotGridTile(
    arrangement: Arrangement,
    spacing: number,
    dotSize: number,
    zoom: number,
): DotGridTile {
    const tileSize = spacing * zoom;
    const dotRadius = (dotSize * zoom) / 2;
    const centers =
        arrangement === "diagonal"
            ? [
                  { x: 0, y: 0 },
                  { x: tileSize / 2, y: tileSize / 2 },
              ]
            : [{ x: 0, y: 0 }];
    return { tileSize, dotRadius, centers };
}

/** Standard 2D affine matrix [a, b, c, d, e, f], shared by CSS/SVG/Canvas transforms. */
export type AffineMatrix = [number, number, number, number, number, number];

const IDENTITY_MATRIX: AffineMatrix = [1, 0, 0, 1, 0, 0];

export function cssTransformMatrix(_rotation: number, _skewX: number, _skewY: number): AffineMatrix {
    // Placeholder identity matrix; real rotation/skew composition lands in Step 2.
    return IDENTITY_MATRIX;
}

export function matrixToCssString(m: AffineMatrix): string {
    return `matrix(${m.join(",")})`;
}

export function dotGridBackgroundCss(
    tile: DotGridTile,
    dotColor: string,
): { backgroundImage: string; backgroundSize: string; backgroundPosition: string } {
    const { dotRadius, tileSize, centers } = tile;
    // Each layer's gradient is centered in its own tile box (no explicit "at" offset), and
    // background-position shifts that box so the rendered dot lands on the intended center.
    // This keeps every dot's raster fully inside one tile's own box, avoiding the seam
    // artifact that appears when a dot straddles the edge between adjacent repeated tiles.
    const backgroundImage = centers
        .map(() => `radial-gradient(circle, ${dotColor} ${dotRadius}px, transparent ${dotRadius}px)`)
        .join(",");
    const backgroundSize = centers.map(() => `${tileSize}px ${tileSize}px`).join(",");
    const backgroundPosition = centers
        .map((c) => `${c.x - tileSize / 2}px ${c.y - tileSize / 2}px`)
        .join(",");
    return { backgroundImage, backgroundSize, backgroundPosition };
}
