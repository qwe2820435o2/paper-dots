"use client";

import { useEffect, useMemo, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import { buildPolkaDotSvgString, drawPolkaDotCanvas, type PolkaDotConfig } from "@/lib/polkaDotGrid";
import { useHTMLImage } from "@/components/decorate/useHTMLImage";

interface Props {
    /** Overrides the live Redux config; used to render true-to-config thumbnails (e.g. presets). */
    config?: PolkaDotConfig;
}

// Fixed "design resolution" the preview is generated at (matches the default PNG export
// size), then scaled to fit the card — no resize tracking needed. Bumped by devicePixelRatio
// (capped) so canvas mode stays crisp on Retina displays without unbounded canvas size.
const PREVIEW_DESIGN_SIZE = 800;

export default function PolkaDotPreview({ config: configOverride }: Props) {
    const liveConfig = useAppSelector((s) => s.polkaDot);
    const config = configOverride ?? liveConfig;
    const iconImage = useHTMLImage(config.iconUrl);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    const resolution = PREVIEW_DESIGN_SIZE * dpr;

    // Icon mode: draw straight onto a canvas, reusing the same drawPolkaDotCanvas the PNG
    // export uses. The icon is decoded once (via useHTMLImage) and every redraw is just cheap
    // drawImage calls — unlike rebuilding an SVG string with the icon's raster data re-embedded
    // and reloading it into an <img> on every render, which has to re-decode that image each
    // time and made dragging sliders (Icon Size especially) feel laggy.
    useEffect(() => {
        if (!config.iconUrl) return;
        const ctx = canvasRef.current?.getContext("2d");
        if (!ctx) return;
        // The canvas backing store is bumped by dpr (resolution) for a crisp Retina bitmap, but
        // dotSize/spacing are absolute units in the PREVIEW_DESIGN_SIZE design space — passing
        // resolution as the draw width/height here would make dots shrink relative to the canvas
        // as dpr rises. setTransform (absolute, not the compounding ctx.scale) maps that fixed
        // design space onto the larger backing store instead.
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        drawPolkaDotCanvas(ctx, config, PREVIEW_DESIGN_SIZE, PREVIEW_DESIGN_SIZE, iconImage);
    }, [config, iconImage, dpr]);

    // Circle mode: plain vector SVG embedded as an <img> — no raster decode cost, stays crisp
    // at any display size via the SVG's own viewBox scaling.
    const circleSvgDataUrl = useMemo(() => {
        if (config.iconUrl) return null;
        const svg = buildPolkaDotSvgString(config, PREVIEW_DESIGN_SIZE, PREVIEW_DESIGN_SIZE);
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }, [config]);

    return (
        <div
            className="relative w-full h-full rounded-xl overflow-hidden"
            style={{ boxShadow: "rgba(197, 232, 154, 0.25) 0px 0px 0px 1px" }}
        >
            {config.iconUrl ? (
                <canvas
                    ref={canvasRef}
                    width={resolution}
                    height={resolution}
                    className="w-full h-full object-cover"
                />
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={circleSvgDataUrl ?? undefined} alt="Polka dot pattern preview" className="w-full h-full object-cover" />
            )}
        </div>
    );
}
