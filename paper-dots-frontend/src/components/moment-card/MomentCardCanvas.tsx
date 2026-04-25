"use client";

import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import type Konva from "konva";
import { Stage, Layer, Rect, Image as KonvaImage, Text, Group } from "react-konva";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setBgColor, setCropOffsetY } from "@/store/slices/momentCardSlice";
import {
    darkenHex,
    extractDominantColorVivid,
    getContrastTextColor,
} from "@/lib/extractDominantColor";
import { useHTMLImage } from "@/components/decorate/useHTMLImage";

export const STAGE_W = 1080;
export const STAGE_H = 1350;
export const PAGE_INSET_X = 88;
export const PAGE_INSET_Y = 112;
const CARD_GAP = 0;
export const CARD_RADIUS = 44;
const TOP_RATIO = 0.5;

const INNER_H = STAGE_H - PAGE_INSET_Y * 2 - CARD_GAP;
const TOP_H = Math.round(INNER_H * TOP_RATIO);
const BOTTOM_H = INNER_H - TOP_H;
const TOP_X = PAGE_INSET_X;
const TOP_Y = PAGE_INSET_Y;
const TOP_W = STAGE_W - PAGE_INSET_X * 2;
const BOTTOM_X = PAGE_INSET_X;
const BOTTOM_Y = TOP_Y + TOP_H + CARD_GAP;
const BOTTOM_W = TOP_W;

interface PhotoLayout {
    scale: number;
    imgW: number;
    imgH: number;
    imgX: number;
    imgY: number;
    verticalRange: number;
    canDrag: boolean;
}

function computePhotoLayout(
    photoW: number,
    photoH: number,
    cropOffsetY: number,
): PhotoLayout {
    const scale = BOTTOM_W / photoW;
    const imgW = BOTTOM_W;
    const imgH = photoH * scale;
    const verticalRange = Math.max(0, imgH - BOTTOM_H);
    const canDrag = verticalRange > 0.5;
    const imgX = BOTTOM_X;
    const imgY =
        verticalRange > 0
            ? BOTTOM_Y - cropOffsetY * verticalRange
            : BOTTOM_Y + (BOTTOM_H - imgH) / 2;
    return { scale, imgW, imgH, imgX, imgY, verticalRange, canDrag };
}

function computeSrcRegion(
    photoW: number,
    photoH: number,
    cropOffsetY: number,
) {
    const scale = BOTTOM_W / photoW;
    const visibleSrcH = Math.min(photoH, BOTTOM_H / scale);
    const sx = 0;
    const sy = (photoH - visibleSrcH) * cropOffsetY;
    return { sx, sy, sw: photoW, sh: visibleSrcH };
}

interface PathContext {
    beginPath(): void;
    moveTo(x: number, y: number): void;
    lineTo(x: number, y: number): void;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    closePath(): void;
}

function roundedRectPath(
    ctx: PathContext,
    x: number,
    y: number,
    w: number,
    h: number,
    radii: [number, number, number, number] | number,
) {
    const [tl, tr, br, bl] = typeof radii === "number"
        ? [radii, radii, radii, radii]
        : radii;
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
    ctx.lineTo(x + w, y + h - br);
    ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    ctx.lineTo(x + bl, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
    ctx.lineTo(x, y + tl);
    ctx.quadraticCurveTo(x, y, x + tl, y);
    ctx.closePath();
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

    const pageColor = useMemo(() => darkenHex(bgColor, 0.07), [bgColor]);

    const dragState = useRef<{
        startY: number;
        startOffsetY: number;
    } | null>(null);

    function getStagePoint(clientX: number, clientY: number) {
        const stage = stageRef.current;
        if (!stage) return { x: 0, y: 0 };
        const rect = stage.container().getBoundingClientRect();
        return {
            x: (clientX - rect.left) / displayScale,
            y: (clientY - rect.top) / displayScale,
        };
    }

    function onPointerMove(e: PointerEvent) {
        const drag = dragState.current;
        const layout = photoLayout;
        if (!drag || !layout || !layout.canDrag) return;
        const p = getStagePoint(e.clientX, e.clientY);
        const dy = p.y - drag.startY;
        const nextY = layout.verticalRange > 0
            ? drag.startOffsetY - dy / layout.verticalRange
            : drag.startOffsetY;
        dispatch(setCropOffsetY(Math.max(0, Math.min(1, nextY))));
    }

    function onPointerUp() {
        if (!dragState.current) return;
        dragState.current = null;
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        if (photoImg && naturalW && naturalH) {
            const region = computeSrcRegion(
                naturalW,
                naturalH,
                cropOffsetYRef.current,
            );
            const next = extractDominantColorVivid(photoImg, region);
            dispatch(setBgColor(next));
        }
    }

    const cropOffsetYRef = useRef(cropOffsetY);
    useEffect(() => {
        cropOffsetYRef.current = cropOffsetY;
    }, [cropOffsetY]);

    function handleMouseDown(e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) {
        if (!photoLayout?.canDrag) return;
        const evt = e.evt;
        const clientX =
            "touches" in evt ? evt.touches[0]?.clientX ?? 0 : (evt as MouseEvent).clientX;
        const clientY =
            "touches" in evt ? evt.touches[0]?.clientY ?? 0 : (evt as MouseEvent).clientY;
        const p = getStagePoint(clientX, clientY);
        dragState.current = {
            startY: p.y,
            startOffsetY: cropOffsetYRef.current,
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

    const titleFontSize = 34;
    const subtitleFontSize = 19;
    const textGap = 16;
    const totalTextH = titleFontSize + textGap + subtitleFontSize;
    const titleY = TOP_Y + (TOP_H - totalTextH) / 2;

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
                {/* Page bg + top card */}
                <Layer listening={false}>
                    <Rect x={0} y={0} width={STAGE_W} height={STAGE_H} fill={pageColor} />
                    <Rect
                        x={TOP_X}
                        y={TOP_Y}
                        width={TOP_W}
                        height={TOP_H}
                        cornerRadius={[CARD_RADIUS, CARD_RADIUS, 0, 0]}
                        fill={bgColor}
                    />
                </Layer>

                {/* Top text */}
                <Layer listening={false}>
                    <Text
                        x={TOP_X}
                        y={titleY}
                        width={TOP_W}
                        text={title || " "}
                        align="center"
                        fontSize={titleFontSize}
                        fontStyle="600"
                        fontFamily="Nunito, sans-serif"
                        fill={textColor}
                    />
                    <Text
                        x={TOP_X}
                        y={titleY + titleFontSize + textGap}
                        width={TOP_W}
                        text={subtitle || ""}
                        align="center"
                        fontSize={subtitleFontSize}
                        fontFamily="Nunito, sans-serif"
                        fill={textColor}
                        opacity={0.6}
                    />
                </Layer>

                {/* Bottom card with rounded clip */}
                <Layer>
                    <Group
                        clipFunc={(ctx) => {
                            roundedRectPath(
                                ctx,
                                BOTTOM_X,
                                BOTTOM_Y,
                                BOTTOM_W,
                                BOTTOM_H,
                                [0, 0, CARD_RADIUS, CARD_RADIUS],
                            );
                        }}
                    >
                        <Rect
                            x={BOTTOM_X}
                            y={BOTTOM_Y}
                            width={BOTTOM_W}
                            height={BOTTOM_H}
                            fill={bgColor}
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
