"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type Konva from "konva";
import { Stage, Layer, Rect, Image as KonvaImage, Circle, Path, Text } from "react-konva";
import { useAppSelector } from "@/store/hooks";
import { generateDots, type GeneratedDot } from "@/lib/dotGenerator";
import { SHAPE_PATHS } from "@/lib/dotShapes";
import type { BackgroundConfig, DotConfig, LayoutType } from "@/store/slices/decorateSlice";
import { useHTMLImage } from "./useHTMLImage";

/** Max px for the longer edge of one photo cell at export resolution. */
const CELL_MAX = 1080;

interface Props {
    showDots?: boolean;
}

interface Rect4 {
    x: number;
    y: number;
    w: number;
    h: number;
}

interface LayoutGeo {
    canvasW: number;
    canvasH: number;
    /** Main photo panel position (fixed, never changes with ratio). */
    mainBox: Rect4;
    /** Paper panel position (fixed). */
    paperBox: Rect4;
    /** Clip applied to the main layer. */
    mainClip: Rect4;
    /** Clip applied to the paper layers. */
    paperClip: Rect4;
    /** Extra photo tile positions for strip/border layouts. */
    photoTiles?: Rect4[];
}

/**
 * Compute panel positions and clip regions for a given layout type and ratio.
 *
 * Clip semantics:
 *   p = 0   → only main visible (paper clip = 0 area)
 *   p = 50  → both panels fully visible
 *   p = 100 → only paper visible (main clip = 0 area)
 *
 * Disappearance directions (symmetric "slide" effect):
 *   main-left:   paper shrinks from right edge (p 50→0); main shrinks from left edge (p 50→100)
 *   main-right:  paper shrinks from left edge  (p 50→0); main shrinks from right edge (p 50→100)
 *   main-top:    paper shrinks from bottom edge (p 50→0); main shrinks from top edge  (p 50→100)
 *   main-bottom: paper shrinks from top edge    (p 50→0); main shrinks from bottom edge (p 50→100)
 */
function computeGeo(
    type: LayoutType,
    p: number,
    cellW: number,
    cellH: number,
): LayoutGeo {
    switch (type) {
        case "main-left": {
            const mainClip: Rect4 =
                p > 50
                    ? { x: ((p - 50) / 50) * cellW, y: 0, w: ((100 - p) / 50) * cellW, h: cellH }
                    : { x: 0, y: 0, w: cellW, h: cellH };
            const paperClip: Rect4 =
                p < 50
                    ? { x: cellW, y: 0, w: (p / 50) * cellW, h: cellH }
                    : { x: cellW, y: 0, w: cellW, h: cellH };
            return {
                canvasW: 2 * cellW,
                canvasH: cellH,
                mainBox: { x: 0, y: 0, w: cellW, h: cellH },
                paperBox: { x: cellW, y: 0, w: cellW, h: cellH },
                mainClip,
                paperClip,
            };
        }
        case "main-right": {
            const mainClip: Rect4 =
                p > 50
                    ? { x: cellW, y: 0, w: ((100 - p) / 50) * cellW, h: cellH }
                    : { x: cellW, y: 0, w: cellW, h: cellH };
            const paperClip: Rect4 =
                p < 50
                    ? { x: (1 - p / 50) * cellW, y: 0, w: (p / 50) * cellW, h: cellH }
                    : { x: 0, y: 0, w: cellW, h: cellH };
            return {
                canvasW: 2 * cellW,
                canvasH: cellH,
                mainBox: { x: cellW, y: 0, w: cellW, h: cellH },
                paperBox: { x: 0, y: 0, w: cellW, h: cellH },
                mainClip,
                paperClip,
            };
        }
        case "main-top": {
            const mainClip: Rect4 =
                p > 50
                    ? { x: 0, y: ((p - 50) / 50) * cellH, w: cellW, h: ((100 - p) / 50) * cellH }
                    : { x: 0, y: 0, w: cellW, h: cellH };
            const paperClip: Rect4 =
                p < 50
                    ? { x: 0, y: cellH, w: cellW, h: (p / 50) * cellH }
                    : { x: 0, y: cellH, w: cellW, h: cellH };
            return {
                canvasW: cellW,
                canvasH: 2 * cellH,
                mainBox: { x: 0, y: 0, w: cellW, h: cellH },
                paperBox: { x: 0, y: cellH, w: cellW, h: cellH },
                mainClip,
                paperClip,
            };
        }
        case "main-bottom": {
            const mainClip: Rect4 =
                p > 50
                    ? { x: 0, y: cellH, w: cellW, h: ((100 - p) / 50) * cellH }
                    : { x: 0, y: cellH, w: cellW, h: cellH };
            const paperClip: Rect4 =
                p < 50
                    ? { x: 0, y: (1 - p / 50) * cellH, w: cellW, h: (p / 50) * cellH }
                    : { x: 0, y: 0, w: cellW, h: cellH };
            return {
                canvasW: cellW,
                canvasH: 2 * cellH,
                mainBox: { x: 0, y: cellH, w: cellW, h: cellH },
                paperBox: { x: 0, y: 0, w: cellW, h: cellH },
                mainClip,
                paperClip,
            };
        }
        case "border": {
            const borderPx = Math.round((p / 100) * cellW * 0.3);
            const bottomPx = Math.round(borderPx * 1.7);
            const canvasW = cellW + borderPx * 2;
            const canvasH = cellH + borderPx + bottomPx;
            const full: Rect4 = { x: 0, y: 0, w: canvasW, h: canvasH };
            const mainBox: Rect4 = { x: borderPx, y: borderPx, w: cellW, h: cellH };
            return {
                canvasW,
                canvasH,
                mainBox,
                paperBox: full,
                mainClip: mainBox,
                paperClip: full,
                photoTiles: [mainBox],
            };
        }
    }
}

/** Contain-fit `img` within a box. Returns null if the box is too small. */
function containLayout(
    img: HTMLImageElement,
    box: Rect4,
    inset = 0,
): { x: number; y: number; width: number; height: number } | null {
    const innerW = box.w - inset * 2;
    const innerH = box.h - inset * 2;
    if (innerW <= 0 || innerH <= 0) return null;
    const ratio = Math.min(innerW / img.width, innerH / img.height);
    const w = img.width * ratio;
    const h = img.height * ratio;
    return {
        x: box.x + (box.w - w) / 2,
        y: box.y + (box.h - h) / 2,
        width: w,
        height: h,
    };
}

/** Returns the representative color of the background for dot auto-color mode. */
function getBgRepresentativeColor(bg: BackgroundConfig): string {
    switch (bg.mode) {
        case "solid": return bg.solidColor;
        case "stripe": return bg.stripeColor1;
        case "photo": return "#fafafa";
        case "checkerboard": return bg.checkerboardColor1;
        case "noise": return bg.solidColor;
        case "gradient": return bg.gradientColor1;
        case "grid": return bg.solidColor;
        case "dot-grid": return bg.solidColor;
    }
}

/** Noise: random grayscale pixel tile. Opacity controlled via Konva shape opacity prop. */
function buildNoisePatternImage(): HTMLImageElement {
    const size = 150;
    const c = document.createElement("canvas");
    c.width = size;
    c.height = size;
    const ctx = c.getContext("2d")!;
    const imageData = ctx.createImageData(size, size);
    for (let i = 0; i < imageData.data.length; i += 4) {
        const gray = Math.floor(Math.random() * 256);
        imageData.data[i] = gray;
        imageData.data[i + 1] = gray;
        imageData.data[i + 2] = gray;
        imageData.data[i + 3] = 255;
    }
    ctx.putImageData(imageData, 0, 0);
    const img = new Image();
    img.src = c.toDataURL();
    return img;
}

/** Grid: single-cell tile with right and bottom border lines. */
function buildGridPatternImage(color: string, size: number): HTMLImageElement {
    const s = Math.max(4, size);
    const c = document.createElement("canvas");
    c.width = s;
    c.height = s;
    const ctx = c.getContext("2d")!;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    ctx.moveTo(s - 0.5, 0);
    ctx.lineTo(s - 0.5, s);
    ctx.moveTo(0, s - 0.5);
    ctx.lineTo(s, s - 0.5);
    ctx.stroke();
    const img = new Image();
    img.src = c.toDataURL();
    return img;
}

/** Dot grid: single-cell tile with a centered dot. */
function buildDotGridPatternImage(color: string, spacing: number, radius: number): HTMLImageElement {
    const s = Math.max(4, spacing);
    const c = document.createElement("canvas");
    c.width = s;
    c.height = s;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(s / 2, s / 2, Math.max(0.5, radius), 0, Math.PI * 2);
    ctx.fill();
    const img = new Image();
    img.src = c.toDataURL();
    return img;
}

/** Checkerboard: 2×2 tile with alternating colors. */
function buildCheckerboardPatternImage(color1: string, color2: string, size: number): HTMLImageElement {
    const s = Math.max(4, size);
    const c = document.createElement("canvas");
    c.width = s * 2;
    c.height = s * 2;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, s, s);
    ctx.fillRect(s, s, s, s);
    ctx.fillStyle = color2;
    ctx.fillRect(s, 0, s, s);
    ctx.fillRect(0, s, s, s);
    const img = new Image();
    img.src = c.toDataURL();
    return img;
}

/** Compute linear gradient start/end points for a given angle and box size. */
function gradientPoints(angleDeg: number, w: number, h: number) {
    const rad = (angleDeg * Math.PI) / 180;
    const cx = w / 2;
    const cy = h / 2;
    const halfDiag = Math.sqrt(w * w + h * h) / 2;
    return {
        start: { x: cx - Math.cos(rad) * halfDiag, y: cy - Math.sin(rad) * halfDiag },
        end: { x: cx + Math.cos(rad) * halfDiag, y: cy + Math.sin(rad) * halfDiag },
    };
}

/**
 * Build a 45° diagonal stripe tile as an HTMLImageElement.
 * The tile is (stripeWidth * 2) px square and repeats seamlessly.
 */
function buildStripePatternImage(
    color1: string,
    color2: string,
    stripeWidth: number,
): HTMLImageElement {
    const w = Math.max(2, stripeWidth * 2);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = 1;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = color1;
    ctx.fillRect(0, 0, w / 2, 1);
    ctx.fillStyle = color2;
    ctx.fillRect(w / 2, 0, w / 2, 1);
    const img = new Image();
    img.src = c.toDataURL();
    return img;
}

interface DotShapeProps {
    dot: GeneratedDot;
    shape: DotConfig["shape"];
    color: string;
    character: string;
    opacity?: number;
    composite?: GlobalCompositeOperation;
}

function DotShape({ dot, shape, color, character, opacity = 1, composite }: DotShapeProps) {
    if (shape === "circle") {
        return (
            <Circle
                x={dot.x}
                y={dot.y}
                radius={dot.size / 2}
                fill={color}
                opacity={opacity}
                globalCompositeOperation={composite}
            />
        );
    }
    if (shape === "square") {
        return (
            <Rect
                x={dot.x}
                y={dot.y}
                width={dot.size}
                height={dot.size}
                offsetX={dot.size / 2}
                offsetY={dot.size / 2}
                rotation={dot.rotation}
                fill={color}
                opacity={opacity}
                globalCompositeOperation={composite}
            />
        );
    }
    if (shape === "character") {
        return (
            <Text
                x={dot.x}
                y={dot.y}
                text={character || "A"}
                fontSize={dot.size}
                fill={color}
                rotation={dot.rotation}
                offsetX={dot.size * 0.3}
                offsetY={dot.size * 0.5}
                opacity={opacity}
                globalCompositeOperation={composite}
            />
        );
    }
    const path = SHAPE_PATHS[shape];
    if (!path) return null;
    return (
        <Path
            x={dot.x}
            y={dot.y}
            data={path}
            scaleX={dot.size}
            scaleY={dot.size}
            rotation={dot.rotation}
            fill={color}
            opacity={opacity}
            globalCompositeOperation={composite}
        />
    );
}

const DecorateCanvas = forwardRef<Konva.Stage, Props>(function DecorateCanvas(
    { showDots = true },
    ref,
) {
    const photoUrl = useAppSelector((s) => s.decorate.photoUrl);
    const background = useAppSelector((s) => s.decorate.background);
    const dotConfig = useAppSelector((s) => s.decorate.dotConfig);
    const layout = useAppSelector((s) => s.decorate.layout);
    const seed = useAppSelector((s) => s.decorate.seed);

    const photoImg = useHTMLImage(photoUrl);
    const bgPhotoImg = useHTMLImage(
        background.mode === "photo" ? background.bgPhotoUrl : null,
    );

    // One photo cell = photo at export resolution (max CELL_MAX on either side).
    const { cellW, cellH } = useMemo(() => {
        if (!photoImg) return { cellW: CELL_MAX, cellH: CELL_MAX };
        const s = Math.min(CELL_MAX / photoImg.width, CELL_MAX / photoImg.height);
        return {
            cellW: Math.round(photoImg.width * s),
            cellH: Math.round(photoImg.height * s),
        };
    }, [photoImg]);

    // Layout geometry (panel positions + clip regions).
    const geo = useMemo(
        () => computeGeo(layout.type, layout.ratio, cellW, cellH),
        [layout.type, layout.ratio, cellW, cellH],
    );
    const { canvasW, canvasH, mainBox, paperBox, mainClip, paperClip } = geo;

    // Responsive display: fit canvas within the wrapper (constrained by both W and H).
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const [containerW, setContainerW] = useState(4096);
    const [containerH, setContainerH] = useState(4096);
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            setContainerW(el.clientWidth);
            setContainerH(el.clientHeight || 4096);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const scale = Math.min(containerW / canvasW, containerH / canvasH, 1);
    const displayW = Math.round(canvasW * scale);
    const displayH = Math.round(canvasH * scale);

    // Photo layouts within each panel.
    const mainPhotoLayout = useMemo(
        () => (photoImg ? containLayout(photoImg, mainBox) : null),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [photoImg, mainBox.x, mainBox.y, mainBox.w, mainBox.h],
    );
    const paperPhotoLayout = useMemo(
        () => (photoImg ? containLayout(photoImg, paperBox) : null),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [photoImg, paperBox.x, paperBox.y, paperBox.w, paperBox.h],
    );
    const bgPhotoLayout = useMemo(
        () => (bgPhotoImg ? containLayout(bgPhotoImg, paperBox) : null),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [bgPhotoImg, paperBox.x, paperBox.y, paperBox.w, paperBox.h],
    );

    // Stripe pattern (built synchronously from offscreen canvas).
    const stripePatternImg = useMemo(() => {
        if (background.mode !== "stripe") return null;
        return buildStripePatternImage(
            background.stripeColor1,
            background.stripeColor2,
            background.stripeWidth,
        );
    }, [background.mode, background.stripeColor1, background.stripeColor2, background.stripeWidth]);

    // Noise pattern (rebuilt only when switching into noise mode).
    const noisePatternImg = useMemo(() => {
        if (background.mode !== "noise") return null;
        return buildNoisePatternImage();
    }, [background.mode]);

    // Grid pattern.
    const gridPatternImg = useMemo(() => {
        if (background.mode !== "grid") return null;
        return buildGridPatternImage(background.gridColor, background.gridSize);
    }, [background.mode, background.gridColor, background.gridSize]);

    // Checkerboard pattern.
    const checkerboardPatternImg = useMemo(() => {
        if (background.mode !== "checkerboard") return null;
        return buildCheckerboardPatternImage(
            background.checkerboardColor1,
            background.checkerboardColor2,
            background.checkerboardSize,
        );
    }, [background.mode, background.checkerboardColor1, background.checkerboardColor2, background.checkerboardSize]);

    // Dot grid pattern.
    const dotGridPatternImg = useMemo(() => {
        if (background.mode !== "dot-grid") return null;
        return buildDotGridPatternImage(
            background.dotGridColor,
            background.dotGridSpacing,
            background.dotGridRadius,
        );
    }, [background.mode, background.dotGridColor, background.dotGridSpacing, background.dotGridRadius]);

    // For split layouts, generate dots relative to one cell so both panels share
    // identical relative positions (1:1 correspondence). Border layout spans the
    // full canvas instead.
    const dots = useMemo(() => {
        if (!showDots) return [];
        if (layout.type === "border") return generateDots(seed, dotConfig, canvasW, canvasH);
        return generateDots(seed, dotConfig, cellW, cellH);
    }, [showDots, seed, dotConfig, canvasW, canvasH, cellW, cellH, layout.type]);

    const dotColor = dotConfig.colorMode === "auto"
        ? getBgRepresentativeColor(background)
        : dotConfig.color;

    const hasMain = mainClip.w > 0 && mainClip.h > 0;
    const hasPaper = paperClip.w > 0 && paperClip.h > 0;
    const isNewLayout = layout.type === "border";

    // Helper: render paper background fill (shared between old and new layouts).
    const gPts = gradientPoints(background.gradientAngle, paperBox.w, paperBox.h);
    const paperBgNodes = (
        <>
            {background.mode === "solid" && (
                <Rect
                    x={paperBox.x}
                    y={paperBox.y}
                    width={paperBox.w}
                    height={paperBox.h}
                    fill={background.solidColor}
                />
            )}
            {background.mode === "stripe" && stripePatternImg && (
                <Rect
                    x={paperBox.x}
                    y={paperBox.y}
                    width={paperBox.w}
                    height={paperBox.h}
                    fillPatternImage={stripePatternImg}
                    fillPatternRepeat="repeat"
                />
            )}
            {background.mode === "photo" && (
                <>
                    <Rect
                        x={paperBox.x}
                        y={paperBox.y}
                        width={paperBox.w}
                        height={paperBox.h}
                        fill="#fafafa"
                    />
                    {bgPhotoImg && bgPhotoLayout && (
                        <KonvaImage image={bgPhotoImg} {...bgPhotoLayout} />
                    )}
                </>
            )}
            {background.mode === "checkerboard" && checkerboardPatternImg && (
                <Rect
                    x={paperBox.x}
                    y={paperBox.y}
                    width={paperBox.w}
                    height={paperBox.h}
                    fillPatternImage={checkerboardPatternImg}
                    fillPatternRepeat="repeat"
                />
            )}
            {background.mode === "noise" && (
                <>
                    <Rect
                        x={paperBox.x}
                        y={paperBox.y}
                        width={paperBox.w}
                        height={paperBox.h}
                        fill={background.solidColor}
                    />
                    {noisePatternImg && (
                        <Rect
                            x={paperBox.x}
                            y={paperBox.y}
                            width={paperBox.w}
                            height={paperBox.h}
                            fillPatternImage={noisePatternImg}
                            fillPatternRepeat="repeat"
                            opacity={background.noiseOpacity / 100}
                        />
                    )}
                </>
            )}
            {background.mode === "gradient" && (
                <Rect
                    x={paperBox.x}
                    y={paperBox.y}
                    width={paperBox.w}
                    height={paperBox.h}
                    fillLinearGradientStartPoint={{ x: gPts.start.x, y: gPts.start.y }}
                    fillLinearGradientEndPoint={{ x: gPts.end.x, y: gPts.end.y }}
                    fillLinearGradientColorStops={[0, background.gradientColor1, 1, background.gradientColor2]}
                />
            )}
            {background.mode === "grid" && gridPatternImg && (
                <>
                    <Rect
                        x={paperBox.x}
                        y={paperBox.y}
                        width={paperBox.w}
                        height={paperBox.h}
                        fill={background.solidColor}
                    />
                    <Rect
                        x={paperBox.x}
                        y={paperBox.y}
                        width={paperBox.w}
                        height={paperBox.h}
                        fillPatternImage={gridPatternImg}
                        fillPatternRepeat="repeat"
                    />
                </>
            )}
            {background.mode === "dot-grid" && dotGridPatternImg && (
                <>
                    <Rect
                        x={paperBox.x}
                        y={paperBox.y}
                        width={paperBox.w}
                        height={paperBox.h}
                        fill={background.solidColor}
                    />
                    <Rect
                        x={paperBox.x}
                        y={paperBox.y}
                        width={paperBox.w}
                        height={paperBox.h}
                        fillPatternImage={dotGridPatternImg}
                        fillPatternRepeat="repeat"
                    />
                </>
            )}
        </>
    );

    return (
        <div ref={wrapRef} className="w-full h-full flex items-center justify-center">
            <Stage
                ref={ref}
                width={canvasW}
                height={canvasH}
                scaleX={scale}
                scaleY={scale}
                style={{ width: displayW, height: displayH }}
            >
                {isNewLayout ? (
                    <>
                        {/* New layouts: paper bg + opaque dots, then photos on top */}
                        <Layer listening={false}>
                            {paperBgNodes}
                            {showDots &&
                                dots.map((d, i) => (
                                    <DotShape
                                        key={i}
                                        dot={d}
                                        shape={dotConfig.shape}
                                        color={dotColor}
                                        character={dotConfig.character}
                                        opacity={dotConfig.opacity / 100}
                                    />
                                ))}
                        </Layer>
                        {/* Photo tiles */}
                        {photoImg && geo.photoTiles && (
                            <Layer listening={false}>
                                {geo.photoTiles.map((tile, i) => {
                                    const layout2 = containLayout(photoImg, tile);
                                    return layout2 ? (
                                        <KonvaImage key={i} image={photoImg} {...layout2} />
                                    ) : null;
                                })}
                            </Layer>
                        )}
                    </>
                ) : (
                    <>
                        {/* Original layouts: punch-through rendering */}
                        {hasMain && (
                            <Layer
                                listening={false}
                                clipX={mainClip.x}
                                clipY={mainClip.y}
                                clipWidth={mainClip.w}
                                clipHeight={mainClip.h}
                            >
                                <Rect
                                    x={mainBox.x}
                                    y={mainBox.y}
                                    width={mainBox.w}
                                    height={mainBox.h}
                                    fill="#fafafa"
                                />
                                {photoImg && mainPhotoLayout && (
                                    <KonvaImage image={photoImg} {...mainPhotoLayout} />
                                )}
                                {showDots &&
                                    dots.map((d, i) => (
                                        <DotShape
                                            key={i}
                                            dot={{ ...d, x: d.x + mainBox.x, y: d.y + mainBox.y }}
                                            shape={dotConfig.shape}
                                            color={dotColor}
                                            character={dotConfig.character}
                                            opacity={dotConfig.opacity / 100}
                                        />
                                    ))}
                            </Layer>
                        )}
                        {hasPaper && (
                            <Layer
                                listening={false}
                                clipX={paperClip.x}
                                clipY={paperClip.y}
                                clipWidth={paperClip.w}
                                clipHeight={paperClip.h}
                            >
                                {photoImg && paperPhotoLayout && (
                                    <KonvaImage image={photoImg} {...paperPhotoLayout} />
                                )}
                            </Layer>
                        )}
                        {hasPaper && (
                            <Layer
                                listening={false}
                                clipX={paperClip.x}
                                clipY={paperClip.y}
                                clipWidth={paperClip.w}
                                clipHeight={paperClip.h}
                            >
                                {paperBgNodes}
                                {showDots &&
                                    dots.map((d, i) => (
                                        <DotShape
                                            key={i}
                                            dot={{ ...d, x: d.x + paperBox.x, y: d.y + paperBox.y }}
                                            shape={dotConfig.shape}
                                            color="#000"
                                            character={dotConfig.character}
                                            composite="destination-out"
                                        />
                                    ))}
                            </Layer>
                        )}
                    </>
                )}
            </Stage>
        </div>
    );
});

export default DecorateCanvas;
