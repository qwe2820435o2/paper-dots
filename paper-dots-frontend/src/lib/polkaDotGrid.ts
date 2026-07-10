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

function rotationMatrix(degrees: number): AffineMatrix {
    const rad = (degrees * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    return [cos, sin, -sin, cos, 0, 0];
}

function skewXMatrix(degrees: number): AffineMatrix {
    return [1, 0, Math.tan((degrees * Math.PI) / 180), 1, 0, 0];
}

function skewYMatrix(degrees: number): AffineMatrix {
    return [1, Math.tan((degrees * Math.PI) / 180), 0, 1, 0, 0];
}

/** Composes m1 * m2 (m2's transform is applied first), ignoring translation (e, f always 0 here). */
function multiplyAffine(m1: AffineMatrix, m2: AffineMatrix): AffineMatrix {
    const [a1, b1, c1, d1] = m1;
    const [a2, b2, c2, d2] = m2;
    return [a1 * a2 + c1 * b2, b1 * a2 + d1 * b2, a1 * c2 + c1 * d2, b1 * c2 + d1 * d2, 0, 0];
}

/** Equivalent to CSS `transform: rotate(rotation) skewX(skewX) skewY(skewY)`, as a single matrix. */
export function cssTransformMatrix(rotation: number, skewX: number, skewY: number): AffineMatrix {
    return multiplyAffine(multiplyAffine(rotationMatrix(rotation), skewXMatrix(skewX)), skewYMatrix(skewY));
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

export interface Dot {
    x: number;
    y: number;
    r: number;
}

/**
 * Enumerates every dot (in local, untransformed grid space) needed to fully cover a
 * width x height viewport once `matrix` (applied around the viewport's center) is
 * rasterized. Used by the SVG and Canvas exporters, which draw real shapes rather than
 * relying on CSS's own tiling/compositing.
 */
export function enumerateDotsInViewport(tile: DotGridTile, width: number, height: number, matrix: AffineMatrix): Dot[] {
    const [a, b, c, d] = matrix;
    const det = a * d - b * c;
    const invA = d / det;
    const invB = -b / det;
    const invC = -c / det;
    const invD = a / det;

    const cx = width / 2;
    const cy = height / 2;
    const corners = [
        { x: 0, y: 0 },
        { x: width, y: 0 },
        { x: 0, y: height },
        { x: width, y: height },
    ];

    let minX = Infinity;
    let maxX = -Infinity;
    let minY = Infinity;
    let maxY = -Infinity;
    for (const corner of corners) {
        const dx = corner.x - cx;
        const dy = corner.y - cy;
        const gx = invA * dx + invC * dy + cx;
        const gy = invB * dx + invD * dy + cy;
        minX = Math.min(minX, gx);
        maxX = Math.max(maxX, gx);
        minY = Math.min(minY, gy);
        maxY = Math.max(maxY, gy);
    }

    const { tileSize, dotRadius, centers } = tile;
    // Margin so dots straddling the viewport's (inverse-transformed) edge aren't clipped.
    const margin = dotRadius + tileSize;
    minX -= margin;
    maxX += margin;
    minY -= margin;
    maxY += margin;

    const iStart = Math.floor(minX / tileSize);
    const iEnd = Math.ceil(maxX / tileSize);
    const jStart = Math.floor(minY / tileSize);
    const jEnd = Math.ceil(maxY / tileSize);

    const dots: Dot[] = [];
    for (let i = iStart; i <= iEnd; i++) {
        for (let j = jStart; j <= jEnd; j++) {
            for (const center of centers) {
                dots.push({ x: i * tileSize + center.x, y: j * tileSize + center.y, r: dotRadius });
            }
        }
    }
    return dots;
}

export function drawPolkaDotCanvas(
    ctx: CanvasRenderingContext2D,
    config: PolkaDotConfig,
    width: number,
    height: number,
): void {
    ctx.save();
    ctx.fillStyle = config.backgroundColor;
    ctx.fillRect(0, 0, width, height);

    const tile = computeDotGridTile(config.arrangement, config.spacing, config.dotSize, config.zoom);
    const matrix = cssTransformMatrix(config.rotation, config.skewX, config.skewY);
    const dots = enumerateDotsInViewport(tile, width, height, matrix);

    const cx = width / 2;
    const cy = height / 2;
    ctx.translate(cx, cy);
    ctx.transform(...matrix);
    ctx.translate(-cx, -cy);

    ctx.globalAlpha = config.opacity / 100;
    ctx.fillStyle = config.dotColor;
    for (const dot of dots) {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function round(n: number): number {
    return Math.round(n * 100) / 100;
}

/**
 * Builds a standalone SVG string with real <circle> elements (not a <pattern>), so pasting
 * the markup into Figma/Sketch preserves individual, editable dot layers instead of being
 * flattened or dropped, which is what happens with many <pattern>-based SVG importers.
 */
export function buildPolkaDotSvgString(config: PolkaDotConfig, width: number, height: number): string {
    const tile = computeDotGridTile(config.arrangement, config.spacing, config.dotSize, config.zoom);
    const matrix = cssTransformMatrix(config.rotation, config.skewX, config.skewY);
    const dots = enumerateDotsInViewport(tile, width, height, matrix);

    const cx = width / 2;
    const cy = height / 2;
    const [a, b, c, d] = matrix;
    const transform = `translate(${round(cx)} ${round(cy)}) matrix(${round(a)} ${round(b)} ${round(c)} ${round(d)} 0 0) translate(${round(-cx)} ${round(-cy)})`;

    const circles = dots
        .map((dot) => `<circle cx="${round(dot.x)}" cy="${round(dot.y)}" r="${round(dot.r)}"/>`)
        .join("");

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
        `<rect width="${width}" height="${height}" fill="${config.backgroundColor}"/>` +
        `<g transform="${transform}" fill="${config.dotColor}" fill-opacity="${round(config.opacity / 100)}">${circles}</g>` +
        `</svg>`
    );
}

/** Converts a 6-digit hex color plus a 0-100 opacity into an `rgba(...)` string. */
function hexToRgba(hex: string, opacity: number): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${round(opacity / 100)})`;
}

/**
 * Builds a copy-pasteable CSS snippet reusing the same `dotGridBackgroundCss` /
 * `cssTransformMatrix` output the preview renders with, so the pasted result matches.
 *
 * Without rotation/skew, it emits plain `background-*` properties directly on the element
 * (the idiomatic, dependency-free form developers expect), baking opacity into the dot
 * color. Only when a transform is present does it fall back to the `::before` scaffold,
 * which is the only reliable way to rotate/skew a repeating CSS background.
 */
export function buildPolkaDotCssSnippet(config: PolkaDotConfig): string {
    const hasTransform = config.rotation !== 0 || config.skewX !== 0 || config.skewY !== 0;
    const tile = computeDotGridTile(config.arrangement, config.spacing, config.dotSize, config.zoom);

    if (!hasTransform) {
        const dotColor = config.opacity === 100 ? config.dotColor : hexToRgba(config.dotColor, config.opacity);
        const { backgroundImage, backgroundSize, backgroundPosition } = dotGridBackgroundCss(tile, dotColor);
        return `.polka-dot-background {
  background-color: ${config.backgroundColor};
  background-image: ${backgroundImage};
  background-size: ${backgroundSize};
  background-position: ${backgroundPosition};
}`;
    }

    const { backgroundImage, backgroundSize, backgroundPosition } = dotGridBackgroundCss(tile, config.dotColor);
    const transform = matrixToCssString(cssTransformMatrix(config.rotation, config.skewX, config.skewY));

    return `.polka-dot-background {
  position: relative;
  overflow: hidden;
  background-color: ${config.backgroundColor};
}

.polka-dot-background::before {
  content: "";
  position: absolute;
  inset: -150%;
  background-image: ${backgroundImage};
  background-size: ${backgroundSize};
  background-position: ${backgroundPosition};
  opacity: ${round(config.opacity / 100)};
  transform: ${transform};
}`;
}
