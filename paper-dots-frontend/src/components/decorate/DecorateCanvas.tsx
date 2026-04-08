"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type Konva from "konva";
import { Stage, Layer, Rect, Image as KonvaImage, Circle, Path, Text } from "react-konva";
import { useAppSelector } from "@/store/hooks";
import { getPaper } from "@/lib/papers";
import { generateDots, type GeneratedDot } from "@/lib/dotGenerator";
import { SHAPE_PATHS } from "@/lib/dotShapes";
import type { DotConfig, LayoutType } from "@/store/slices/decorateSlice";
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
            // Main: left panel (x=0..cellW). Paper: right panel (x=cellW..2*cellW).
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
            // Main: right panel (x=cellW..2*cellW). Paper: left panel (x=0..cellW).
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
            // Main: top panel (y=0..cellH). Paper: bottom panel (y=cellH..2*cellH).
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
            // Main: bottom panel (y=cellH..2*cellH). Paper: top panel (y=0..cellH).
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
    const paperId = useAppSelector((s) => s.decorate.paperId);
    const dotConfig = useAppSelector((s) => s.decorate.dotConfig);
    const layout = useAppSelector((s) => s.decorate.layout);
    const seed = useAppSelector((s) => s.decorate.seed);

    const paper = getPaper(paperId);
    const paperImg = useHTMLImage(paper.src || null);
    const photoImg = useHTMLImage(photoUrl);

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

    // Dots span the full canvas; clip per layer handles which portion is visible.
    const dots = useMemo(() => {
        if (!showDots) return [];
        return generateDots(seed, dotConfig, canvasW, canvasH);
    }, [showDots, seed, dotConfig, canvasW, canvasH]);

    const dotColor = dotConfig.colorMode === "auto" ? paper.color : dotConfig.color;

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

                {/* Paper panel: photo underneath */}
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

                {/* Paper panel: paper fill + image, then destination-out dots punch holes */}
                {hasPaper && (
                    <Layer
                        listening={false}
                        clipX={paperClip.x}
                        clipY={paperClip.y}
                        clipWidth={paperClip.w}
                        clipHeight={paperClip.h}
                    >
                        <Rect
                            x={paperBox.x}
                            y={paperBox.y}
                            width={paperBox.w}
                            height={paperBox.h}
                            fill={paper.color}
                        />
                        {paperImg && (
                            <KonvaImage
                                image={paperImg}
                                x={paperBox.x}
                                y={paperBox.y}
                                width={paperBox.w}
                                height={paperBox.h}
                            />
                        )}
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
