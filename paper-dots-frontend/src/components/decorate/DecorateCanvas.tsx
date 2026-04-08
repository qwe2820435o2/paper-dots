"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type Konva from "konva";
import { Stage, Layer, Rect, Image as KonvaImage, Circle, Path, Text } from "react-konva";
import { useAppSelector } from "@/store/hooks";
import { getPaper } from "@/lib/papers";
import { generateDots, type GeneratedDot } from "@/lib/dotGenerator";
import { SHAPE_PATHS } from "@/lib/dotShapes";
import type { DotConfig } from "@/store/slices/decorateSlice";
import { useHTMLImage } from "./useHTMLImage";

/**
 * Max size (px) for the longer edge of a single photo cell.
 * The canvas width = 2 × cellW, height = cellH.
 */
const CELL_MAX = 1080;

interface Props {
    showDots?: boolean;
}

interface BoxLayout {
    x: number;
    y: number;
    width: number;
    height: number;
}

/** Fit `img` with contain scaling into a box, with optional inset. Returns null if box is too small. */
function containLayout(
    img: HTMLImageElement,
    boxX: number,
    boxY: number,
    boxW: number,
    boxH: number,
    inset = 0,
): BoxLayout | null {
    const innerW = boxW - inset * 2;
    const innerH = boxH - inset * 2;
    if (innerW <= 0 || innerH <= 0) return null;
    const ratio = Math.min(innerW / img.width, innerH / img.height);
    const w = img.width * ratio;
    const h = img.height * ratio;
    return {
        x: boxX + (boxW - w) / 2,
        y: boxY + (boxH - h) / 2,
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
        const char = character || "A";
        return (
            <Text
                x={dot.x}
                y={dot.y}
                text={char}
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

    // Compute cell dimensions from the uploaded photo.
    // cellW × cellH is the size of ONE panel (one "main image").
    // Full canvas = 2*cellW × cellH.
    const { cellW, cellH } = useMemo(() => {
        if (!photoImg) return { cellW: CELL_MAX, cellH: CELL_MAX };
        const scale = Math.min(CELL_MAX / photoImg.width, CELL_MAX / photoImg.height);
        return {
            cellW: Math.round(photoImg.width * scale),
            cellH: Math.round(photoImg.height * scale),
        };
    }, [photoImg]);

    const canvasW = cellW * 2;
    const canvasH = cellH;

    // Responsive scaling: fit the canvas (which may not be square) within the container.
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const [displayW, setDisplayW] = useState(canvasW);
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            setDisplayW(Math.min(canvasW, el.clientWidth));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [canvasW]);
    // Clamp displayW when canvasW changes (e.g. new photo uploaded).
    const clampedDisplayW = Math.min(displayW, canvasW);
    const scale = clampedDisplayW / canvasW;
    const displayH = Math.round(canvasH * scale);

    const p = layout.ratio; // 0-100

    // Each panel is fixed at cellW × cellH.
    // Clip controls visibility:
    //   Left photo: p≤50 → full; p>50 → left edge moves right
    //   Right paper: p≥50 → full; p<50 → right edge moves left (anchored at x=cellW)
    const leftClipX = p > 50 ? ((p - 50) / 50) * cellW : 0;
    const leftClipW = p > 50 ? ((100 - p) / 50) * cellW : cellW;
    const rightClipX = cellW;
    const rightClipW = p < 50 ? (p / 50) * cellW : cellW;

    const hasLeft = leftClipW > 0;
    const hasRight = rightClipW > 0;

    // Photo always fills its fixed panel (no inset, contain fit within cellW × cellH).
    const leftPhotoLayout = useMemo(
        () => (photoImg ? containLayout(photoImg, 0, 0, cellW, cellH) : null),
        [photoImg, cellW, cellH],
    );
    const rightPhotoLayout = useMemo(
        () => (photoImg ? containLayout(photoImg, cellW, 0, cellW, cellH) : null),
        [photoImg, cellW, cellH],
    );

    // Single dot field shared across both sub-panels.
    const dots = useMemo(() => {
        if (!showDots) return [];
        return generateDots(seed, dotConfig, canvasW, canvasH);
    }, [showDots, seed, dotConfig, canvasW, canvasH]);

    // Effective dot color: "auto" follows the current paper's representative color.
    const dotColor = dotConfig.colorMode === "auto" ? paper.color : dotConfig.color;


    return (
        <div ref={wrapRef} className="w-full" style={{ maxWidth: canvasW }}>
            <Stage
                ref={ref}
                width={canvasW}
                height={canvasH}
                scaleX={scale}
                scaleY={scale}
                style={{ width: clampedDisplayW, height: displayH }}
                className=""
            >
                {/* Left panel: fafafa bg + photo + dots painted on top */}
                {hasLeft && (
                    <Layer
                        listening={false}
                        clipX={leftClipX}
                        clipY={0}
                        clipWidth={leftClipW}
                        clipHeight={canvasH}
                    >
                        <Rect x={0} y={0} width={cellW} height={canvasH} fill="#fafafa" />
                        {photoImg && leftPhotoLayout && (
                            <KonvaImage image={photoImg} {...leftPhotoLayout} />
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

                {/* Right panel: photo below the paper layer */}
                {hasRight && (
                    <Layer
                        listening={false}
                        clipX={rightClipX}
                        clipY={0}
                        clipWidth={rightClipW}
                        clipHeight={canvasH}
                    >
                        {photoImg && rightPhotoLayout && (
                            <KonvaImage image={photoImg} {...rightPhotoLayout} />
                        )}
                    </Layer>
                )}

                {/* Right panel: paper with dot holes punched out */}
                {hasRight && (
                    <Layer
                        listening={false}
                        clipX={rightClipX}
                        clipY={0}
                        clipWidth={rightClipW}
                        clipHeight={canvasH}
                    >
                        <Rect
                            x={cellW}
                            y={0}
                            width={cellW}
                            height={canvasH}
                            fill={paper.color}
                        />
                        {paperImg && (
                            <KonvaImage
                                image={paperImg}
                                x={cellW}
                                y={0}
                                width={cellW}
                                height={canvasH}
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
