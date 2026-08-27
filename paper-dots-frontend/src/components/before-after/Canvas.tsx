"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type Konva from "konva";
import { Stage, Layer, Image as KonvaImage, Line, Circle, Rect, Text } from "react-konva";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setSliderPosition,
    setLabelPosition,
    setAfterOffset,
    type BeforeAfterLayout,
    type AfterTransformState,
} from "@/store/slices/beforeAfterSlice";
import { useHTMLImage } from "@/components/decorate/useHTMLImage";

/** Max px for the longer edge of the comparison frame. Unlike the other editors here, this
 *  frame doesn't need a fixed high-res logical size decoupled from its on-screen size (nothing
 *  about the slider/crop math depends on pixel density), so the stage is simply sized to fit
 *  its container directly — no separate Konva-level scaleX/scaleY step. */
const CELL_MAX = 1080;

/** Gap between panels in the "side-by-side" and "stack" layouts, in canvas px. */
const PANEL_GAP = 16;

/** How much of the frame's width the caption is allowed to occupy before it wraps. The leftover
 *  margin keeps a centered caption clear of the edges; a long one becomes several lines instead
 *  of running off the canvas. */
const LABEL_WIDTH_RATIO = 0.9;

interface ImageLayout {
    x: number;
    y: number;
    width: number;
    height: number;
    crop: { x: number; y: number; width: number; height: number };
}

/** Cover-fit `img` into a `boxW`×`boxH` frame: crops the source image (not the display box)
 *  so the before and after photos share exactly the same frame regardless of their own
 *  aspect ratio — unlike the rest of the app's tools, this one always shows two photos at
 *  once and they must line up. */
function coverLayout(img: HTMLImageElement, boxW: number, boxH: number): ImageLayout {
    const imgAspect = img.width / img.height;
    const boxAspect = boxW / boxH;
    const cropW = imgAspect > boxAspect ? img.height * boxAspect : img.width;
    const cropH = imgAspect > boxAspect ? img.height : img.width / boxAspect;
    return {
        x: 0,
        y: 0,
        width: boxW,
        height: boxH,
        crop: {
            x: (img.width - cropW) / 2,
            y: (img.height - cropH) / 2,
            width: cropW,
            height: cropH,
        },
    };
}

/** Fit an aspect ratio (w/h) into a `maxW`×`maxH` box, contain-style. */
function fitAspect(aspect: number, maxW: number, maxH: number): { w: number; h: number } {
    if (maxW / maxH > aspect) return { w: maxH * aspect, h: maxH };
    return { w: maxW, h: maxW / aspect };
}

/** Places the "after" image in its `cellW`×`cellH` cell at `(panelX, panelY)`, applying the
 *  manual alignment nudge on top of the cover-fit crop — scale/rotate pivot around the cell's
 *  own center so the nudge feels like moving/resizing the photo in place, not from a corner. */
function afterImageTransformProps(
    crop: ImageLayout["crop"],
    panelX: number,
    panelY: number,
    cellW: number,
    cellH: number,
    transform: AfterTransformState,
) {
    return {
        x: panelX + cellW / 2 + (transform.offsetXPct / 100) * cellW,
        y: panelY + cellH / 2 + (transform.offsetYPct / 100) * cellH,
        width: cellW,
        height: cellH,
        offsetX: cellW / 2,
        offsetY: cellH / 2,
        scaleX: transform.scale,
        scaleY: transform.scale,
        rotation: transform.rotationDeg,
        crop,
    };
}

/** The `pointermove`/`pointerup` pair backing one drag interaction, kept together in a single
 *  object so the exact function references used to attach are the ones used to detach —
 *  `removeEventListener` matches by reference, and a per-render closure would silently fail to
 *  detach, leaving the listener stuck on `window`. */
interface DragHandlers {
    move: (e: PointerEvent) => void;
    up: () => void;
}

function attachDrag(h: DragHandlers) {
    window.addEventListener("pointermove", h.move);
    window.addEventListener("pointerup", h.up);
}

function detachDrag(h: DragHandlers) {
    window.removeEventListener("pointermove", h.move);
    window.removeEventListener("pointerup", h.up);
}

/** Konva hands us either a mouse or a touch event depending on the input; both drags start the
 *  same way, so normalize to a single client point. */
function eventPoint(evt: MouseEvent | TouchEvent): { clientX: number; clientY: number } {
    if ("touches" in evt) {
        const touch = evt.touches[0];
        return { clientX: touch?.clientX ?? 0, clientY: touch?.clientY ?? 0 };
    }
    return { clientX: evt.clientX, clientY: evt.clientY };
}

/** A small always-on label so a static (non-slider) layout is still readable without a
 *  divider to tell the panels apart. Not the user-editable text-label feature — just a
 *  fixed caption baked into every export. */
function PanelBadge({ x, y, text }: { x: number; y: number; text: string }) {
    return (
        <Text
            x={x}
            y={y}
            text={text}
            fontSize={16}
            fontStyle="700"
            fill="#ffffff"
            shadowColor="#000000"
            shadowBlur={4}
            shadowOpacity={0.6}
            listening={false}
        />
    );
}

/** The "after" photo sits on top, clipped to its left `sliderPosition`% — dragging the handle
 *  right uncovers more of it, leaving the "before" photo (the unclipped base layer) showing
 *  through on the right. The other layouts are static two-panel arrangements with no clip. */
const BeforeAfterCanvas = forwardRef<Konva.Stage>(function BeforeAfterCanvas(_props, ref) {
    const t = useTranslations("editor.beforeAfter");
    const dispatch = useAppDispatch();
    const beforeUrl = useAppSelector((s) => s.beforeAfter.beforeUrl);
    const afterUrl = useAppSelector((s) => s.beforeAfter.afterUrl);
    const sliderPosition = useAppSelector((s) => s.beforeAfter.sliderPosition);
    const layoutType: BeforeAfterLayout = useAppSelector((s) => s.beforeAfter.layoutType);
    const label = useAppSelector((s) => s.beforeAfter.label);
    const alignMode = useAppSelector((s) => s.beforeAfter.alignMode);
    const afterTransform = useAppSelector((s) => s.beforeAfter.afterTransform);

    const beforeImg = useHTMLImage(beforeUrl);
    const afterImg = useHTMLImage(afterUrl);

    const stageRef = useRef<Konva.Stage | null>(null);
    useImperativeHandle(ref, () => stageRef.current as Konva.Stage);

    const wrapRef = useRef<HTMLDivElement | null>(null);
    const [containerW, setContainerW] = useState(CELL_MAX);
    const [containerH, setContainerH] = useState(CELL_MAX);
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            setContainerW(el.clientWidth);
            setContainerH(el.clientHeight || CELL_MAX);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    // "split" is the seamless (zero-gap) version of "side-by-side" — same two-cell geometry,
    // just arranged horizontally either way. "stack" is the vertical arrangement.
    const panelGap = layoutType === "split" ? 0 : PANEL_GAP;
    const isTwoPanel = layoutType === "side-by-side" || layoutType === "split";
    const isStack = layoutType === "stack";

    // Frame size follows the "before" photo's aspect ratio, fit to the wrapper and capped at
    // CELL_MAX for quality. The two-panel layouts need two cells (plus a gap), horizontal or
    // vertical, instead of the single frame "slider" uses.
    const { canvasW, canvasH, cellW, cellH } = useMemo(() => {
        const maxW = Math.min(CELL_MAX, containerW || CELL_MAX);
        const maxH = Math.min(CELL_MAX, containerH || CELL_MAX);
        const aspect = beforeImg ? beforeImg.width / beforeImg.height : 1;

        if (isTwoPanel) {
            const cell = fitAspect(aspect, (maxW - panelGap) / 2, maxH);
            const w = Math.round(cell.w);
            const h = Math.round(cell.h);
            return { canvasW: w * 2 + panelGap, canvasH: h, cellW: w, cellH: h };
        }

        if (isStack) {
            const cell = fitAspect(aspect, maxW, (maxH - PANEL_GAP) / 2);
            const w = Math.round(cell.w);
            const h = Math.round(cell.h);
            return { canvasW: w, canvasH: h * 2 + PANEL_GAP, cellW: w, cellH: h };
        }

        const cell = fitAspect(aspect, maxW, maxH);
        const w = Math.round(cell.w);
        const h = Math.round(cell.h);
        return { canvasW: w, canvasH: h, cellW: w, cellH: h };
    }, [isTwoPanel, isStack, panelGap, beforeImg, containerW, containerH]);

    const beforeLayout = useMemo(
        () => (beforeImg ? coverLayout(beforeImg, cellW, cellH) : null),
        [beforeImg, cellW, cellH],
    );
    const afterLayout = useMemo(
        () => (afterImg ? coverLayout(afterImg, cellW, cellH) : null),
        [afterImg, cellW, cellH],
    );

    // All three drags below work in *normalized* stage-rect coordinates (0-1 of the on-screen
    // box) rather than canvas px. Slider position and label position are already stored as
    // percentages, and the align offset is a percentage of the cell — which is the whole stage
    // while align mode is on — so the canvas-px size cancels out of every conversion. Reading
    // only the live `getBoundingClientRect()` on each move keeps the math correct even if the
    // container resizes mid-drag (orientation change, panel toggle); a size captured back at
    // mousedown would be stale for the rest of the drag.
    const draggingRef = useRef(false);
    const alignDragRef = useRef<{
        startXNorm: number;
        startYNorm: number;
        startOffsetXPct: number;
        startOffsetYPct: number;
    } | null>(null);
    const labelDraggingRef = useRef(false);

    /** Pointer position as a 0-1 fraction of the stage's on-screen box, or null when the stage
     *  isn't measurable yet (no ref, zero-size container). */
    const getNormalizedPoint = useCallback((clientX: number, clientY: number) => {
        const stage = stageRef.current;
        if (!stage) return null;
        const rect = stage.container().getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return null;
        return { nx: (clientX - rect.left) / rect.width, ny: (clientY - rect.top) / rect.height };
    }, []);

    // Each handler pair is identity-stable (it only depends on `dispatch`), so the unmount
    // cleanup further down detaches the very functions that were attached.
    const sliderDrag = useMemo<DragHandlers>(() => {
        const h: DragHandlers = {
            move: (e) => {
                if (!draggingRef.current) return;
                const p = getNormalizedPoint(e.clientX, e.clientY);
                if (p) dispatch(setSliderPosition(p.nx * 100));
            },
            up: () => {
                draggingRef.current = false;
                detachDrag(h);
            },
        };
        return h;
    }, [dispatch, getNormalizedPoint]);

    function handleSliderMouseDown(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
        const { clientX, clientY } = eventPoint(e.evt);
        draggingRef.current = true;
        const p = getNormalizedPoint(clientX, clientY);
        if (p) dispatch(setSliderPosition(p.nx * 100));
        attachDrag(sliderDrag);
    }

    const handleX = (sliderPosition / 100) * canvasW;

    // Align mode shows a dedicated single-cell overlay (before opaque, after translucent and
    // draggable) regardless of `layoutType`, so the stage itself shrinks to one cell while it's on.
    const stageW = alignMode ? cellW : canvasW;
    const stageH = alignMode ? cellH : canvasH;

    const alignDrag = useMemo<DragHandlers>(() => {
        const h: DragHandlers = {
            move: (e) => {
                const drag = alignDragRef.current;
                if (!drag) return;
                const p = getNormalizedPoint(e.clientX, e.clientY);
                if (!p) return;
                dispatch(
                    setAfterOffset({
                        xPct: drag.startOffsetXPct + (p.nx - drag.startXNorm) * 100,
                        yPct: drag.startOffsetYPct + (p.ny - drag.startYNorm) * 100,
                    }),
                );
            },
            up: () => {
                alignDragRef.current = null;
                detachDrag(h);
            },
        };
        return h;
    }, [dispatch, getNormalizedPoint]);

    function handleAlignMouseDown(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
        const { clientX, clientY } = eventPoint(e.evt);
        const p = getNormalizedPoint(clientX, clientY);
        if (!p) return;
        alignDragRef.current = {
            startXNorm: p.nx,
            startYNorm: p.ny,
            startOffsetXPct: afterTransform.offsetXPct,
            startOffsetYPct: afterTransform.offsetYPct,
        };
        attachDrag(alignDrag);
    }

    // Text label: draggable anywhere on the frame, independent of the slider handle above.
    // Centered on its own (x, y) via offsetX/offsetY so xPct/yPct = 50 truly means "centered".
    // The caption wraps inside a fixed box a fraction of the frame wide rather than running off
    // the edge, so the horizontal offset is just half that box — only the wrapped height has to
    // be measured off the node, and it changes with the box width as well as the text itself.
    const labelNodeRef = useRef<Konva.Text | null>(null);
    const labelWidth = canvasW * LABEL_WIDTH_RATIO;
    const [labelHeight, setLabelHeight] = useState(0);
    useEffect(() => {
        const node = labelNodeRef.current;
        if (!node) return;
        setLabelHeight(node.height());
    }, [label.text, label.fontSize, labelWidth]);

    const labelDrag = useMemo<DragHandlers>(() => {
        const h: DragHandlers = {
            move: (e) => {
                if (!labelDraggingRef.current) return;
                const p = getNormalizedPoint(e.clientX, e.clientY);
                if (p) dispatch(setLabelPosition({ xPct: p.nx * 100, yPct: p.ny * 100 }));
            },
            up: () => {
                labelDraggingRef.current = false;
                detachDrag(h);
            },
        };
        return h;
    }, [dispatch, getNormalizedPoint]);

    function handleLabelMouseDown(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
        const { clientX, clientY } = eventPoint(e.evt);
        labelDraggingRef.current = true;
        const p = getNormalizedPoint(clientX, clientY);
        if (p) dispatch(setLabelPosition({ xPct: p.nx * 100, yPct: p.ny * 100 }));
        attachDrag(labelDrag);
    }

    // Unmounting mid-drag (navigating away before pointerup) would otherwise leave the window
    // listeners behind forever.
    useEffect(() => {
        return () => {
            detachDrag(sliderDrag);
            detachDrag(alignDrag);
            detachDrag(labelDrag);
        };
    }, [sliderDrag, alignDrag, labelDrag]);

    return (
        <div ref={wrapRef} className="w-full h-full flex items-center justify-center" style={{ touchAction: "none" }}>
            <Stage ref={stageRef} width={stageW} height={stageH}>
                {alignMode ? (
                    <>
                        {/* Before, opaque — the reference to line "after" up against. */}
                        <Layer listening={false}>
                            <Rect x={0} y={0} width={cellW} height={cellH} fill="#fafafa" />
                            {beforeImg && beforeLayout && <KonvaImage image={beforeImg} {...beforeLayout} />}
                        </Layer>
                        {/* After, translucent and draggable — nudge it until it lines up. */}
                        <Layer>
                            {afterImg && afterLayout && (
                                <KonvaImage
                                    image={afterImg}
                                    {...afterImageTransformProps(afterLayout.crop, 0, 0, cellW, cellH, afterTransform)}
                                    opacity={0.55}
                                    onMouseDown={handleAlignMouseDown}
                                    onTouchStart={handleAlignMouseDown}
                                />
                            )}
                        </Layer>
                    </>
                ) : (
                    <>
                    {layoutType === "slider" && (
                        <>
                            {/* Base layer: "before", always fully visible. */}
                            <Layer listening={false}>
                                <Rect x={0} y={0} width={canvasW} height={canvasH} fill="#fafafa" />
                                {beforeImg && beforeLayout && <KonvaImage image={beforeImg} {...beforeLayout} />}
                            </Layer>

                            {/* "after", clipped to the left `sliderPosition`% of the frame. */}
                            {afterImg && afterLayout && (
                                <Layer listening={false} clipX={0} clipY={0} clipWidth={handleX} clipHeight={canvasH}>
                                    <KonvaImage
                                        image={afterImg}
                                        {...afterImageTransformProps(afterLayout.crop, 0, 0, canvasW, canvasH, afterTransform)}
                                    />
                                </Layer>
                            )}

                            {/* Drag handle: a wide invisible hit strip plus the visible divider + grip. */}
                            <Layer>
                                <Rect
                                    x={handleX - 24}
                                    y={0}
                                    width={48}
                                    height={canvasH}
                                    fill="transparent"
                                    onMouseDown={handleSliderMouseDown}
                                    onTouchStart={handleSliderMouseDown}
                                />
                                <Line
                                    points={[handleX, 0, handleX, canvasH]}
                                    stroke="#ffffff"
                                    strokeWidth={3}
                                    shadowColor="#000000"
                                    shadowOpacity={0.25}
                                    shadowBlur={4}
                                    listening={false}
                                />
                                <Circle
                                    x={handleX}
                                    y={canvasH / 2}
                                    radius={22}
                                    fill="#ffffff"
                                    shadowColor="#000000"
                                    shadowOpacity={0.25}
                                    shadowBlur={8}
                                    listening={false}
                                />
                                <Line
                                    points={[handleX - 7, canvasH / 2 - 6, handleX - 12, canvasH / 2, handleX - 7, canvasH / 2 + 6]}
                                    stroke="#1a1a2e"
                                    strokeWidth={2.5}
                                    lineCap="round"
                                    lineJoin="round"
                                    listening={false}
                                />
                                <Line
                                    points={[handleX + 7, canvasH / 2 - 6, handleX + 12, canvasH / 2, handleX + 7, canvasH / 2 + 6]}
                                    stroke="#1a1a2e"
                                    strokeWidth={2.5}
                                    lineCap="round"
                                    lineJoin="round"
                                    listening={false}
                                />
                            </Layer>
                        </>
                    )}

                    {isTwoPanel && (
                        <Layer listening={false}>
                            <Rect x={0} y={0} width={cellW} height={cellH} fill="#fafafa" />
                            <Rect x={cellW + panelGap} y={0} width={cellW} height={cellH} fill="#fafafa" />
                            {beforeImg && beforeLayout && <KonvaImage image={beforeImg} {...beforeLayout} x={0} y={0} />}
                            {afterImg && afterLayout && (
                                <KonvaImage
                                    image={afterImg}
                                    {...afterImageTransformProps(afterLayout.crop, cellW + panelGap, 0, cellW, cellH, afterTransform)}
                                />
                            )}
                            {layoutType === "split" && (
                                <Line
                                    points={[cellW, 0, cellW, cellH]}
                                    stroke="#ffffff"
                                    strokeWidth={2}
                                    shadowColor="#000000"
                                    shadowOpacity={0.2}
                                    shadowBlur={3}
                                />
                            )}
                            <PanelBadge x={12} y={12} text={t("before")} />
                            <PanelBadge x={cellW + panelGap + 12} y={12} text={t("after")} />
                        </Layer>
                    )}

                    {isStack && (
                        <Layer listening={false}>
                            <Rect x={0} y={0} width={cellW} height={cellH} fill="#fafafa" />
                            <Rect x={0} y={cellH + PANEL_GAP} width={cellW} height={cellH} fill="#fafafa" />
                            {beforeImg && beforeLayout && <KonvaImage image={beforeImg} {...beforeLayout} x={0} y={0} />}
                            {afterImg && afterLayout && (
                                <KonvaImage
                                    image={afterImg}
                                    {...afterImageTransformProps(afterLayout.crop, 0, cellH + PANEL_GAP, cellW, cellH, afterTransform)}
                                />
                            )}
                            <PanelBadge x={12} y={12} text={t("before")} />
                            <PanelBadge x={12} y={cellH + PANEL_GAP + 12} text={t("after")} />
                        </Layer>
                    )}

                    {/* User's custom caption, on top of every layout. Draggable to reposition. */}
                    {label.text && (
                        <Layer>
                            <Text
                                ref={labelNodeRef}
                                x={(label.xPct / 100) * canvasW}
                                y={(label.yPct / 100) * canvasH}
                                width={labelWidth}
                                align="center"
                                offsetX={labelWidth / 2}
                                offsetY={labelHeight / 2}
                                text={label.text}
                                fontSize={label.fontSize}
                                fontStyle="700"
                                fill={label.color}
                                shadowColor="#000000"
                                shadowBlur={6}
                                shadowOpacity={0.5}
                                onMouseDown={handleLabelMouseDown}
                                onTouchStart={handleLabelMouseDown}
                            />
                        </Layer>
                    )}
                    </>
                )}
            </Stage>
        </div>
    );
});

export default BeforeAfterCanvas;
