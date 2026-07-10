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
    /** data URL of an uploaded custom icon; null renders a plain circle dot */
    iconUrl: string | null;
    /** naturalWidth / naturalHeight of the icon, for aspect-correct (contain) sizing */
    iconAspect: number;
}

/** Contain-fits an icon of the given aspect ratio inside a `box x box` square. */
function iconDrawSize(box: number, iconAspect: number): { w: number; h: number } {
    return iconAspect >= 1 ? { w: box, h: box / iconAspect } : { w: box * iconAspect, h: box };
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

// Every layer's content is centered in its own tile box (no explicit "at" offset), and
// background-position shifts that box so the rendered content lands on the intended
// center. This keeps every dot/icon's raster fully inside one tile's own box, avoiding the
// seam artifact that appears when content straddles the edge between adjacent repeated
// tiles. Shared by the plain-gradient (circle) and image-tile (custom icon) CSS builders.
function dotGridLayerGeometry(tile: DotGridTile): { backgroundSize: string; backgroundPosition: string } {
    const { tileSize, centers } = tile;
    const backgroundSize = centers.map(() => `${tileSize}px ${tileSize}px`).join(",");
    const backgroundPosition = centers
        .map((c) => `${c.x - tileSize / 2}px ${c.y - tileSize / 2}px`)
        .join(",");
    return { backgroundSize, backgroundPosition };
}

export function dotGridBackgroundCss(
    tile: DotGridTile,
    dotColor: string,
): { backgroundImage: string; backgroundSize: string; backgroundPosition: string } {
    const backgroundImage = tile.centers
        .map(() => `radial-gradient(circle, ${dotColor} ${tile.dotRadius}px, transparent ${tile.dotRadius}px)`)
        .join(",");
    return { backgroundImage, ...dotGridLayerGeometry(tile) };
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
    iconImage?: HTMLImageElement | null,
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

    if (config.iconUrl && iconImage) {
        const { w, h } = iconDrawSize(tile.dotRadius * 2, config.iconAspect);
        for (const dot of dots) {
            ctx.drawImage(iconImage, dot.x - w / 2, dot.y - h / 2, w, h);
        }
    } else {
        ctx.fillStyle = config.dotColor;
        for (const dot of dots) {
            ctx.beginPath();
            ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.restore();
}

function round(n: number): number {
    return Math.round(n * 100) / 100;
}

/**
 * Builds a standalone SVG string. With no custom icon, dots are real <circle> elements
 * (not a <pattern>), so pasting the markup into Figma/Sketch preserves individual,
 * editable dot layers instead of being flattened or dropped as many <pattern>-based SVG
 * importers do. With a custom icon, the icon is embedded once in <defs> and each dot is a
 * lightweight <use> reference to it (also real, independently selectable layers).
 */
export function buildPolkaDotSvgString(config: PolkaDotConfig, width: number, height: number): string {
    const tile = computeDotGridTile(config.arrangement, config.spacing, config.dotSize, config.zoom);
    const matrix = cssTransformMatrix(config.rotation, config.skewX, config.skewY);
    const dots = enumerateDotsInViewport(tile, width, height, matrix);

    const cx = width / 2;
    const cy = height / 2;
    const [a, b, c, d] = matrix;
    const transform = `translate(${round(cx)} ${round(cy)}) matrix(${round(a)} ${round(b)} ${round(c)} ${round(d)} 0 0) translate(${round(-cx)} ${round(-cy)})`;
    const opacity = round(config.opacity / 100);

    if (config.iconUrl) {
        const { w, h } = iconDrawSize(tile.dotRadius * 2, config.iconAspect);
        const uses = dots
            .map(
                (dot) =>
                    `<use href="#polka-dot-icon" xlink:href="#polka-dot-icon" x="${round(dot.x - w / 2)}" y="${round(dot.y - h / 2)}"/>`,
            )
            .join("");
        return (
            `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
            `<rect width="${width}" height="${height}" fill="${config.backgroundColor}"/>` +
            `<defs><image id="polka-dot-icon" href="${config.iconUrl}" xlink:href="${config.iconUrl}" width="${round(w)}" height="${round(h)}"/></defs>` +
            `<g transform="${transform}" opacity="${opacity}">${uses}</g>` +
            `</svg>`
        );
    }

    const circles = dots
        .map((dot) => `<circle cx="${round(dot.x)}" cy="${round(dot.y)}" r="${round(dot.r)}"/>`)
        .join("");

    return (
        `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">` +
        `<rect width="${width}" height="${height}" fill="${config.backgroundColor}"/>` +
        `<g transform="${transform}" fill="${config.dotColor}" fill-opacity="${opacity}">${circles}</g>` +
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
 * Renders a single icon centered in a transparent tileSize x tileSize canvas and returns a
 * PNG data URL — a CSS background-image tile for custom icons. Centering the icon in its
 * own box (rather than at a tile edge) mirrors the trick `dotGridLayerGeometry` uses for
 * circles via background-position, so CSS's own tiling never clips the icon at a seam.
 */
function buildIconTileDataUrl(
    iconImage: HTMLImageElement,
    iconAspect: number,
    dotSize: number,
    tileSize: number,
    opacity: number,
): string {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(tileSize));
    canvas.height = Math.max(1, Math.round(tileSize));
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";
    const { w, h } = iconDrawSize(dotSize, iconAspect);
    ctx.globalAlpha = opacity / 100;
    ctx.drawImage(iconImage, tileSize / 2 - w / 2, tileSize / 2 - h / 2, w, h);
    return canvas.toDataURL("image/png");
}

/**
 * Builds a copy-pasteable CSS snippet reusing the same `dotGridBackgroundCss` /
 * `cssTransformMatrix` output the preview renders with, so the pasted result matches.
 *
 * Without rotation/skew, it emits plain `background-*` properties directly on the element
 * (the idiomatic, dependency-free form developers expect), baking opacity into the dot
 * color (or into the composited icon tile's alpha). Only when a transform is present does
 * it fall back to the `::before` scaffold, which is the only reliable way to rotate/skew a
 * repeating CSS background — there, opacity is applied to that pseudo-element instead so
 * the (always fully opaque) background-color underneath isn't faded along with it.
 *
 * `iconImage` is the loaded `HTMLImageElement` for `config.iconUrl` (the caller owns
 * loading it, e.g. via a `useHTMLImage` hook); without it, a custom icon falls back to
 * the plain-dot CSS since there's nothing to composite into a tile yet.
 */
export function buildPolkaDotCssSnippet(config: PolkaDotConfig, iconImage?: HTMLImageElement | null): string {
    const hasTransform = config.rotation !== 0 || config.skewX !== 0 || config.skewY !== 0;
    const tile = computeDotGridTile(config.arrangement, config.spacing, config.dotSize, config.zoom);
    const dotSizeScaled = tile.dotRadius * 2;

    if (config.iconUrl && iconImage) {
        if (!hasTransform) {
            const tileUrl = buildIconTileDataUrl(iconImage, config.iconAspect, dotSizeScaled, tile.tileSize, config.opacity);
            const backgroundImage = tile.centers.map(() => `url(${tileUrl})`).join(",");
            const { backgroundSize, backgroundPosition } = dotGridLayerGeometry(tile);
            return `.polka-dot-background {
  background-color: ${config.backgroundColor};
  background-image: ${backgroundImage};
  background-size: ${backgroundSize};
  background-position: ${backgroundPosition};
}`;
        }

        const tileUrl = buildIconTileDataUrl(iconImage, config.iconAspect, dotSizeScaled, tile.tileSize, 100);
        const backgroundImage = tile.centers.map(() => `url(${tileUrl})`).join(",");
        const { backgroundSize, backgroundPosition } = dotGridLayerGeometry(tile);
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
