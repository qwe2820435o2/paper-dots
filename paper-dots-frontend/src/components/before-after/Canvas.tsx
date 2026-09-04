"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type Konva from "konva";
import { Stage, Layer, Image as KonvaImage, Line, Circle, Rect, Text } from "react-konva";
import { useTranslations } from "next-intl";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
    setSliderPosition,
    type BeforeAfterLayout,
    type ImageTransformState,
    type TextLabelState,
    type LabelStyleState,
    type LabelPosition,
} from "@/store/slices/beforeAfterSlice";
import { useHTMLImage } from "@/components/decorate/useHTMLImage";

/** Max px for the longer edge of the comparison frame. Unlike the other editors here, this
 *  frame doesn't need a fixed high-res logical size decoupled from its on-screen size (nothing
 *  about the slider/crop math depends on pixel density), so the stage is simply sized to fit
 *  its container directly — no separate Konva-level scaleX/scaleY step. */
const CELL_MAX = 1080;

/** Flat canvas-px padding kept around labels and the brand logo. The frame is already sized to
 *  its real target resolution (up to `CELL_MAX`), so a flat value reads the same as the fixed
 *  px offsets the rest of this file already uses for the slider handle. */
const LABEL_PADDING = 10;
const LOGO_PADDING = 16;

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

/** Places an image in its `cellW`×`cellH` cell at `(panelX, panelY)`, applying the manual crop
 *  on top of the cover-fit crop — scale/rotate pivot around the cell's own center so the crop
 *  feels like moving/resizing the photo in place, not from a corner. */
function imageTransformProps(
    crop: ImageLayout["crop"],
    panelX: number,
    panelY: number,
    cellW: number,
    cellH: number,
    transform: ImageTransformState,
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

/** hex + 0-100 opacity -> an rgba() string, for the label's background block. */
function rgba(hex: string, opacityPct: number): string {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16) & 255;
    const g = (n >> 8) & 255;
    const b = n & 255;
    return `rgba(${r},${g},${b},${Math.max(0, Math.min(100, opacityPct)) / 100})`;
}

/** One before/after caption: a padded background block behind auto-measured text, anchored to
 *  one of six preset corners/edges of `box` — replaces free dragging so the position is always
 *  reachable without a pointer (and stays put across layout/size changes). Measuring the node
 *  after every render (rather than estimating from font metrics) keeps the background block
 *  exactly as wide as the text, including per-font differences. */
function EditableLabel({
    box,
    text,
    position,
    style,
}: {
    box: { x: number; y: number; w: number; h: number };
    text: string;
    position: LabelPosition;
    style: LabelStyleState;
}) {
    const textRef = useRef<Konva.Text | null>(null);
    const [size, setSize] = useState({ w: 0, h: 0 });

    useEffect(() => {
        const node = textRef.current;
        if (!node) return;
        setSize({ w: node.width(), h: node.height() });
    }, [text, style.fontFamily, style.fontSize]);

    if (!style.visible || !text) return null;

    const blockW = size.w + LABEL_PADDING * 2;
    const blockH = size.h + LABEL_PADDING * 2;
    const [v, h] = position.split("-") as [string, string];
    const blockY = v === "top" ? box.y + LABEL_PADDING : box.y + box.h - blockH - LABEL_PADDING;
    const blockX =
        h === "left"
            ? box.x + LABEL_PADDING
            : h === "right"
              ? box.x + box.w - blockW - LABEL_PADDING
              : box.x + (box.w - blockW) / 2;

    return (
        <>
            <Rect
                x={blockX}
                y={blockY}
                width={blockW}
                height={blockH}
                fill={rgba(style.backgroundColor, style.backgroundOpacity)}
                cornerRadius={4}
                listening={false}
            />
            <Text
                ref={textRef}
                x={blockX + LABEL_PADDING}
                y={blockY + LABEL_PADDING}
                text={text}
                fontFamily={style.fontFamily}
                fontSize={style.fontSize}
                fontStyle="700"
                fill={style.color}
                listening={false}
            />
        </>
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
    const gap = useAppSelector((s) => s.beforeAfter.gap);
    const canvasBackground = useAppSelector((s) => s.beforeAfter.canvasBackground);
    const aspect = useAppSelector((s) => s.beforeAfter.aspect);
    const beforeTransform = useAppSelector((s) => s.beforeAfter.beforeTransform);
    const afterTransform = useAppSelector((s) => s.beforeAfter.afterTransform);
    const beforeLabelState: TextLabelState = useAppSelector((s) => s.beforeAfter.beforeLabel);
    const afterLabelState: TextLabelState = useAppSelector((s) => s.beforeAfter.afterLabel);
    const labelStyle = useAppSelector((s) => s.beforeAfter.labelStyle);
    const logo = useAppSelector((s) => s.beforeAfter.logo);

    const beforeImg = useHTMLImage(beforeUrl);
    const afterImg = useHTMLImage(afterUrl);
    const logoImg = useHTMLImage(logo.url);

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

    const isTwoPanel = layoutType === "side-by-side";
    const isStack = layoutType === "stack";

    // The frame's aspect ratio comes from the user's chosen size (not either photo's own
    // dimensions) so the exported artwork always matches the picked preset/custom size,
    // regardless of layout.
    const { canvasW, canvasH } = useMemo(() => {
        const maxW = Math.min(CELL_MAX, containerW || CELL_MAX);
        const maxH = Math.min(CELL_MAX, containerH || CELL_MAX);
        const ratio = aspect.width / aspect.height || 1;
        const fit = fitAspect(ratio, maxW, maxH);
        return { canvasW: Math.round(fit.w), canvasH: Math.round(fit.h) };
    }, [aspect, containerW, containerH]);

    // Two-panel layouts subdivide the frame (not the other way around) so the overall canvas
    // keeps the chosen aspect ratio no matter which layout is active.
    const { cellW, cellH, panelGap } = useMemo(() => {
        if (isTwoPanel) {
            const w = Math.max(1, Math.round((canvasW - gap) / 2));
            return { cellW: w, cellH: canvasH, panelGap: gap };
        }
        if (isStack) {
            const h = Math.max(1, Math.round((canvasH - gap) / 2));
            return { cellW: canvasW, cellH: h, panelGap: gap };
        }
        return { cellW: canvasW, cellH: canvasH, panelGap: 0 };
    }, [isTwoPanel, isStack, canvasW, canvasH, gap]);

    const beforeLayout = useMemo(
        () => (beforeImg ? coverLayout(beforeImg, cellW, cellH) : null),
        [beforeImg, cellW, cellH],
    );
    const afterLayout = useMemo(
        () => (afterImg ? coverLayout(afterImg, cellW, cellH) : null),
        [afterImg, cellW, cellH],
    );

    // The slider drag works in *normalized* stage-rect coordinates (0-1 of the on-screen box)
    // rather than canvas px, since sliderPosition is stored as a percentage — the canvas-px size
    // cancels out of the conversion. Reading only the live `getBoundingClientRect()` on each
    // move keeps the math correct even if the container resizes mid-drag.
    const draggingRef = useRef(false);

    const getNormalizedPoint = useCallback((clientX: number, clientY: number) => {
        const stage = stageRef.current;
        if (!stage) return null;
        const rect = stage.container().getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return null;
        return { nx: (clientX - rect.left) / rect.width, ny: (clientY - rect.top) / rect.height };
    }, []);

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

    // Unmounting mid-drag (navigating away before pointerup) would otherwise leave the window
    // listener behind forever.
    useEffect(() => {
        return () => detachDrag(sliderDrag);
    }, [sliderDrag]);

    const beforeText = beforeLabelState.text || t("before");
    const afterText = afterLabelState.text || t("after");

    const logoBox = useMemo(() => {
        if (!logoImg || !logoImg.naturalWidth) return null;
        const w = canvasW * (logo.sizePct / 100);
        const h = (w / logoImg.naturalWidth) * logoImg.naturalHeight;
        const x = logo.position.includes("right") ? canvasW - w - LOGO_PADDING : LOGO_PADDING;
        const y = logo.position.includes("bottom") ? canvasH - h - LOGO_PADDING : LOGO_PADDING;
        return { x, y, w, h };
    }, [logoImg, logo.sizePct, logo.position, canvasW, canvasH]);

    // Sits on top of the photos but under the captions — built once and placed between the
    // image layer(s) and the label layer in whichever layout branch is active below, since only
    // one of those branches ever mounts at a time.
    const logoLayer = logoBox ? (
        <Layer listening={false}>
            <KonvaImage image={logoImg!} x={logoBox.x} y={logoBox.y} width={logoBox.w} height={logoBox.h} />
        </Layer>
    ) : null;

    return (
        <div ref={wrapRef} className="w-full h-full flex items-center justify-center" style={{ touchAction: "none" }}>
            <Stage ref={stageRef} width={canvasW} height={canvasH}>
                {layoutType === "slider" && (
                    <>
                        {/* Base layer: "before", always fully visible. */}
                        <Layer listening={false}>
                            <Rect x={0} y={0} width={canvasW} height={canvasH} fill={canvasBackground} />
                            {beforeImg && beforeLayout && (
                                <KonvaImage
                                    image={beforeImg}
                                    {...imageTransformProps(beforeLayout.crop, 0, 0, canvasW, canvasH, beforeTransform)}
                                />
                            )}
                        </Layer>

                        {/* "after", clipped to the left `sliderPosition`% of the frame. */}
                        {afterImg && afterLayout && (
                            <Layer listening={false} clipX={0} clipY={0} clipWidth={handleX} clipHeight={canvasH}>
                                <KonvaImage
                                    image={afterImg}
                                    {...imageTransformProps(afterLayout.crop, 0, 0, canvasW, canvasH, afterTransform)}
                                />
                            </Layer>
                        )}

                        {logoLayer}

                        {/* Only "before" gets a caption here — a floating "after" tag that
                            appears and disappears as the divider is dragged would be confusing. */}
                        <Layer>
                            <EditableLabel
                                box={{ x: 0, y: 0, w: canvasW, h: canvasH }}
                                text={beforeText}
                                position={beforeLabelState.position}
                                style={labelStyle}
                            />
                        </Layer>

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
                    <>
                        <Layer listening={false}>
                            <Rect x={0} y={0} width={cellW} height={cellH} fill={canvasBackground} />
                            <Rect x={cellW + panelGap} y={0} width={cellW} height={cellH} fill={canvasBackground} />
                            {beforeImg && beforeLayout && (
                                <KonvaImage
                                    image={beforeImg}
                                    {...imageTransformProps(beforeLayout.crop, 0, 0, cellW, cellH, beforeTransform)}
                                />
                            )}
                            {afterImg && afterLayout && (
                                <KonvaImage
                                    image={afterImg}
                                    {...imageTransformProps(afterLayout.crop, cellW + panelGap, 0, cellW, cellH, afterTransform)}
                                />
                            )}
                        </Layer>

                        {logoLayer}

                        <Layer listening={false}>
                            <EditableLabel
                                box={{ x: 0, y: 0, w: cellW, h: cellH }}
                                text={beforeText}
                                position={beforeLabelState.position}
                                style={labelStyle}
                            />
                            <EditableLabel
                                box={{ x: cellW + panelGap, y: 0, w: cellW, h: cellH }}
                                text={afterText}
                                position={afterLabelState.position}
                                style={labelStyle}
                            />
                        </Layer>
                    </>
                )}

                {isStack && (
                    <>
                        <Layer listening={false}>
                            <Rect x={0} y={0} width={cellW} height={cellH} fill={canvasBackground} />
                            <Rect x={0} y={cellH + panelGap} width={cellW} height={cellH} fill={canvasBackground} />
                            {beforeImg && beforeLayout && (
                                <KonvaImage
                                    image={beforeImg}
                                    {...imageTransformProps(beforeLayout.crop, 0, 0, cellW, cellH, beforeTransform)}
                                />
                            )}
                            {afterImg && afterLayout && (
                                <KonvaImage
                                    image={afterImg}
                                    {...imageTransformProps(afterLayout.crop, 0, cellH + panelGap, cellW, cellH, afterTransform)}
                                />
                            )}
                        </Layer>

                        {logoLayer}

                        <Layer listening={false}>
                            <EditableLabel
                                box={{ x: 0, y: 0, w: cellW, h: cellH }}
                                text={beforeText}
                                position={beforeLabelState.position}
                                style={labelStyle}
                            />
                            <EditableLabel
                                box={{ x: 0, y: cellH + panelGap, w: cellW, h: cellH }}
                                text={afterText}
                                position={afterLabelState.position}
                                style={labelStyle}
                            />
                        </Layer>
                    </>
                )}
            </Stage>
        </div>
    );
});

export default BeforeAfterCanvas;
