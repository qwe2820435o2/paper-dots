"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type Konva from "konva";
import { Stage, Layer, Rect, Image as KonvaImage, Text, Group } from "react-konva";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setBgColor, setCropOffsetY } from "@/store/slices/momentCardSlice";
import {
    extractDominantColorVivid,
    getContrastTextColor,
} from "@/lib/extractDominantColor";
import { useHTMLImage } from "@/components/decorate/useHTMLImage";

export const STAGE_W = 1080;
export const STAGE_H = 1920;
export const TOP_H = 960;
export const BOTTOM_Y = TOP_H;
export const BOTTOM_H = STAGE_H - TOP_H;
const BOTTOM_INSET = 24;
const BOTTOM_RADIUS = 28;

interface PhotoLayout {
    scale: number;
    imgW: number;
    imgH: number;
    imgX: number;
    imgY: number;
    canDragVertical: boolean;
    verticalRange: number;
}

function computePhotoLayout(
    photoW: number,
    photoH: number,
    cropOffsetY: number,
): PhotoLayout {
    const frameW = STAGE_W - BOTTOM_INSET * 2;
    const frameH = BOTTOM_H - BOTTOM_INSET * 2;
    const scale = Math.max(frameW / photoW, frameH / photoH);
    const imgW = photoW * scale;
    const imgH = photoH * scale;
    const verticalRange = Math.max(0, imgH - frameH);
    const canDragVertical = verticalRange > 0.5;
    const frameX = BOTTOM_INSET;
    const frameY = BOTTOM_Y + BOTTOM_INSET;
    const imgX = frameX + (frameW - imgW) / 2;
    const imgY = canDragVertical
        ? frameY - cropOffsetY * verticalRange
        : frameY + (frameH - imgH) / 2;
    return { scale, imgW, imgH, imgX, imgY, canDragVertical, verticalRange };
}

function computeSrcRegion(
    photoW: number,
    photoH: number,
    cropOffsetY: number,
) {
    const frameW = STAGE_W - BOTTOM_INSET * 2;
    const frameH = BOTTOM_H - BOTTOM_INSET * 2;
    const scale = Math.max(frameW / photoW, frameH / photoH);
    const visibleSrcW = Math.min(photoW, frameW / scale);
    const visibleSrcH = Math.min(photoH, frameH / scale);
    const sx = (photoW - visibleSrcW) / 2;
    const sy = (photoH - visibleSrcH) * cropOffsetY;
    return { sx, sy, sw: visibleSrcW, sh: visibleSrcH };
}

const MomentCardCanvas = forwardRef<Konva.Stage>(function MomentCardCanvas(_, ref) {
    const dispatch = useAppDispatch();
    const photoUrl = useAppSelector((s) => s.momentCard.photoUrl);
    const naturalW = useAppSelector((s) => s.momentCard.photoNaturalWidth);
    const naturalH = useAppSelector((s) => s.momentCard.photoNaturalHeight);
    const cropOffsetY = useAppSelector((s) => s.momentCard.cropOffsetY);
    const bgColor = useAppSelector((s) => s.momentCard.bgColor);
    const title = useAppSelector((s) => s.momentCard.title);
    const subtitle = useAppSelector((s) => s.momentCard.subtitle);
    const textColorMode = useAppSelector((s) => s.momentCard.textColorMode);

    const photoImg = useHTMLImage(photoUrl);

    const stageRef = useRef<Konva.Stage | null>(null);
    useImperativeHandle(ref, () => stageRef.current as Konva.Stage);

    const wrapRef = useRef<HTMLDivElement | null>(null);
    const [containerW, setContainerW] = useState(STAGE_W);
    const [containerH, setContainerH] = useState(STAGE_H);
    useEffect(() => {
        const el = wrapRef.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            setContainerW(el.clientWidth);
            setContainerH(el.clientHeight);
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, []);

    const displayScale = Math.min(containerW / STAGE_W, containerH / STAGE_H, 1);
    const displayW = Math.round(STAGE_W * displayScale);
    const displayH = Math.round(STAGE_H * displayScale);

    const photoLayout = useMemo(() => {
        if (!naturalW || !naturalH) return null;
        return computePhotoLayout(naturalW, naturalH, cropOffsetY);
    }, [naturalW, naturalH, cropOffsetY]);

    const textColor = useMemo(() => {
        if (textColorMode === "light") return "#ffffff";
        if (textColorMode === "dark") return "#1a1a2e";
        return getContrastTextColor(bgColor);
    }, [textColorMode, bgColor]);

    const dragState = useRef<{ startY: number; startOffset: number } | null>(null);

    function getStageClientY(clientY: number) {
        const stage = stageRef.current;
        if (!stage) return 0;
        const rect = stage.container().getBoundingClientRect();
        return (clientY - rect.top) / displayScale;
    }

    function onPointerMove(e: PointerEvent) {
        const drag = dragState.current;
        const layout = photoLayout;
        if (!drag || !layout || !layout.canDragVertical) return;
        const dy = getStageClientY(e.clientY) - drag.startY;
        const next = drag.startOffset - dy / layout.verticalRange;
        dispatch(setCropOffsetY(Math.max(0, Math.min(1, next))));
    }

    function onPointerUp() {
        if (!dragState.current) return;
        dragState.current = null;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        if (photoImg && naturalW && naturalH) {
            const region = computeSrcRegion(naturalW, naturalH, cropOffsetYRef.current);
            const next = extractDominantColorVivid(photoImg, region);
            dispatch(setBgColor(next));
        }
    }

    const cropOffsetYRef = useRef(cropOffsetY);
    useEffect(() => {
        cropOffsetYRef.current = cropOffsetY;
    }, [cropOffsetY]);

    function handleMouseDown(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
        if (!photoLayout?.canDragVertical) return;
        const evt = e.evt;
        const clientY =
            "touches" in evt ? evt.touches[0]?.clientY ?? 0 : (evt as MouseEvent).clientY;
        dragState.current = {
            startY: getStageClientY(clientY),
            startOffset: cropOffsetYRef.current,
        };
        window.addEventListener("pointermove", onPointerMove);
        window.addEventListener("pointerup", onPointerUp);
    }

    useEffect(() => {
        return () => {
            window.removeEventListener("pointermove", onPointerMove);
            window.removeEventListener("pointerup", onPointerUp);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const titleFontSize = 64;
    const subtitleFontSize = 30;
    const titleY = TOP_H * 0.62;

    return (
        <div
            ref={wrapRef}
            className="w-full h-full flex items-center justify-center"
            style={{ touchAction: "none" }}
        >
            <Stage
                ref={stageRef}
                width={STAGE_W}
                height={STAGE_H}
                scaleX={displayScale}
                scaleY={displayScale}
                style={{ width: displayW, height: displayH }}
            >
                {/* Background top color block (also fills full canvas as base) */}
                <Layer listening={false}>
                    <Rect x={0} y={0} width={STAGE_W} height={STAGE_H} fill={bgColor} />
                </Layer>

                {/* Top text */}
                <Layer listening={false}>
                    <Text
                        x={0}
                        y={titleY}
                        width={STAGE_W}
                        text={title || " "}
                        align="center"
                        fontSize={titleFontSize}
                        fontStyle="600"
                        fontFamily="var(--font-quicksand), var(--font-nunito), sans-serif"
                        fill={textColor}
                    />
                    <Text
                        x={0}
                        y={titleY + titleFontSize + 18}
                        width={STAGE_W}
                        text={subtitle || ""}
                        align="center"
                        fontSize={subtitleFontSize}
                        fontFamily="var(--font-nunito), sans-serif"
                        fill={textColor}
                        opacity={0.6}
                    />
                </Layer>

                {/* Bottom photo with rounded clip */}
                <Layer>
                    <Group
                        clipFunc={(ctx) => {
                            const x = BOTTOM_INSET;
                            const y = BOTTOM_Y + BOTTOM_INSET;
                            const w = STAGE_W - BOTTOM_INSET * 2;
                            const h = BOTTOM_H - BOTTOM_INSET * 2;
                            const r = BOTTOM_RADIUS;
                            ctx.beginPath();
                            ctx.moveTo(x + r, y);
                            ctx.lineTo(x + w - r, y);
                            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
                            ctx.lineTo(x + w, y + h - r);
                            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
                            ctx.lineTo(x + r, y + h);
                            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
                            ctx.lineTo(x, y + r);
                            ctx.quadraticCurveTo(x, y, x + r, y);
                            ctx.closePath();
                        }}
                    >
                        <Rect
                            x={BOTTOM_INSET}
                            y={BOTTOM_Y + BOTTOM_INSET}
                            width={STAGE_W - BOTTOM_INSET * 2}
                            height={BOTTOM_H - BOTTOM_INSET * 2}
                            fill="#ffffff"
                            onMouseDown={handleMouseDown}
                            onTouchStart={handleMouseDown}
                        />
                        {photoImg && photoLayout && (
                            <KonvaImage
                                image={photoImg}
                                x={photoLayout.imgX}
                                y={photoLayout.imgY}
                                width={photoLayout.imgW}
                                height={photoLayout.imgH}
                                onMouseDown={handleMouseDown}
                                onTouchStart={handleMouseDown}
                                listening
                            />
                        )}
                    </Group>
                </Layer>
            </Stage>
        </div>
    );
});

export default MomentCardCanvas;
