"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type Konva from "konva";
import { Stage, Layer, Rect, Image as KonvaImage, Circle, Path, Text } from "react-konva";
import { useAppSelector } from "@/store/hooks";
import { getPaper } from "@/lib/papers";
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
        case "template": return getPaper(bg.templateId).color;
    }
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
    composite?: GlobalCompositeOperation;
}

function DotShape({ dot, shape, color, character, composite }: DotShapeProps) {
    if (shape === "circle") {
        return (
            <Circle
                x={dot.x}
                y={dot.y}
                radius={dot.size / 2}
                fill={color}
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

    const templatePaper = getPaper(background.templateId);
    const templateImg = useHTMLImage(
        background.mode === "template" ? (templatePaper.src || null) : null,
    );
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

    // Dots span the full canvas; clip per layer handles which portion is visible.
    const dots = useMemo(() => {
        if (!showDots) return [];
        return generateDots(seed, dotConfig, canvasW, canvasH);
    }, [showDots, seed, dotConfig, canvasW, canvasH]);

    const dotColor = dotConfig.colorMode === "auto"
        ? getBgRepresentativeColor(background)
        : dotConfig.color;

    const hasMain = mainClip.w > 0 && mainClip.h > 0;
    const hasPaper = paperClip.w > 0 && paperClip.h > 0;

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
                {/* Main panel: fafafa bg + photo + opaque dots */}
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
                                    dot={d}
                                    shape={dotConfig.shape}
                                    color={dotColor}
                                    character={dotConfig.character}
                                />
                            ))}
                    </Layer>
                )}

                {/* Paper panel: photo underneath (used by template/solid/stripe modes for the punch-through effect) */}
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

                {/* Paper panel: background fill + destination-out dots punch holes */}
                {hasPaper && (
                    <Layer
                        listening={false}
                        clipX={paperClip.x}
                        clipY={paperClip.y}
                        clipWidth={paperClip.w}
                        clipHeight={paperClip.h}
                    >
                        {/* Background fill by mode */}
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
                        {background.mode === "template" && (
                            <>
                                <Rect
                                    x={paperBox.x}
                                    y={paperBox.y}
                                    width={paperBox.w}
                                    height={paperBox.h}
                                    fill={templatePaper.color}
                                />
                                {templateImg && (
                                    <KonvaImage
                                        image={templateImg}
                                        x={paperBox.x}
                                        y={paperBox.y}
                                        width={paperBox.w}
                                        height={paperBox.h}
                                    />
                                )}
                            </>
                        )}

                        {/* Dots punch holes through background */}
                        {showDots &&
                            dots.map((d, i) => (
                                <DotShape
                                    key={i}
                                    dot={d}
                                    shape={dotConfig.shape}
                                    color="#000"
                                    character={dotConfig.character}
                                    composite="destination-out"
                                />
                            ))}
                    </Layer>
                )}
            </Stage>
        </div>
    );
});

export default DecorateCanvas;
