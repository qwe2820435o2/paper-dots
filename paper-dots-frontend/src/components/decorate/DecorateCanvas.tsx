"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type Konva from "konva";
import { Stage, Layer, Rect, Image as KonvaImage, Circle, Path } from "react-konva";
import { useAppSelector } from "@/store/hooks";
import { getPaper } from "@/lib/papers";
import { generateDots } from "@/lib/dotGenerator";
import { TEARDROP_PATH } from "@/lib/dotShapes";
import { useHTMLImage } from "./useHTMLImage";

/** Logical canvas size — what we render and export at. */
const CANVAS_SIZE = 1080;

interface Props {
    /** Whether to render the dot layer. Phase C disables it. */
    showDots?: boolean;
}

const DecorateCanvas = forwardRef<Konva.Stage, Props>(function DecorateCanvas(
    { showDots = true },
    ref,
) {
    const photoUrl = useAppSelector((s) => s.decorate.photoUrl);
    const paperId = useAppSelector((s) => s.decorate.paperId);
    const dotConfig = useAppSelector((s) => s.decorate.dotConfig);
    const seed = useAppSelector((s) => s.decorate.seed);

    const paper = getPaper(paperId);
    const paperImg = useHTMLImage(paper.src || null);
    const photoImg = useHTMLImage(photoUrl);

    // Responsive scaling: render at CANVAS_SIZE internally, but visually shrink
    // to fit the parent box.
    const wrapRef = useRef<HTMLDivElement | null>(null);
    const [displaySize, setDisplaySize] = useState(CANVAS_SIZE);
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            const w = el.clientWidth;
            setDisplaySize(Math.min(CANVAS_SIZE, w));
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);
    const scale = displaySize / CANVAS_SIZE;

    // Layout the photo with `contain` fit, centered, with a small inset.
    const photoLayout = useMemo(() => {
        if (!photoImg) return null;
        const inset = 80;
        const boxW = CANVAS_SIZE - inset * 2;
        const boxH = CANVAS_SIZE - inset * 2;
        const ratio = Math.min(boxW / photoImg.width, boxH / photoImg.height);
        const w = photoImg.width * ratio;
        const h = photoImg.height * ratio;
        return {
            x: (CANVAS_SIZE - w) / 2,
            y: (CANVAS_SIZE - h) / 2,
            width: w,
            height: h,
        };
    }, [photoImg]);

    const dots = useMemo(() => {
        if (!showDots) return [];
        return generateDots(seed, dotConfig, CANVAS_SIZE, CANVAS_SIZE);
    }, [showDots, seed, dotConfig]);

    return (
        <div ref={wrapRef} className="w-full max-w-[720px] aspect-square mx-auto">
            <Stage
                ref={ref}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                scaleX={scale}
                scaleY={scale}
                style={{ width: displaySize, height: displaySize }}
                className="sketch-border bg-white"
            >
                {/* Background paper */}
                <Layer listening={false}>
                    <Rect x={0} y={0} width={CANVAS_SIZE} height={CANVAS_SIZE} fill="#fafafa" />
                    {paperImg && (
                        <KonvaImage
                            image={paperImg}
                            x={0}
                            y={0}
                            width={CANVAS_SIZE}
                            height={CANVAS_SIZE}
                        />
                    )}
                </Layer>

                {/* Photo */}
                <Layer listening={false}>
                    {photoImg && photoLayout && (
                        <KonvaImage image={photoImg} {...photoLayout} />
                    )}
                </Layer>

                {/* Dots */}
                {showDots && (
                    <Layer listening={false}>
                        {dots.map((d, i) => {
                            if (dotConfig.shape === "circle") {
                                return (
                                    <Circle
                                        key={i}
                                        x={d.x}
                                        y={d.y}
                                        radius={d.size / 2}
                                        fill={dotConfig.color}
                                    />
                                );
                            }
                            if (dotConfig.shape === "square") {
                                return (
                                    <Rect
                                        key={i}
                                        x={d.x}
                                        y={d.y}
                                        width={d.size}
                                        height={d.size}
                                        offsetX={d.size / 2}
                                        offsetY={d.size / 2}
                                        rotation={d.rotation}
                                        fill={dotConfig.color}
                                    />
                                );
                            }
                            // teardrop — Path is normalized to a unit box, scale by size.
                            return (
                                <Path
                                    key={i}
                                    x={d.x}
                                    y={d.y}
                                    data={TEARDROP_PATH}
                                    scaleX={d.size}
                                    scaleY={d.size}
                                    rotation={d.rotation}
                                    fill={dotConfig.color}
                                />
                            );
                        })}
                    </Layer>
                )}
            </Stage>
        </div>
    );
});

export default DecorateCanvas;
