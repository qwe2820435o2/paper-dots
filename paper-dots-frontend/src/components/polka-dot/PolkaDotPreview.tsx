"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { buildPolkaDotSvgString, type PolkaDotConfig } from "@/lib/polkaDotGrid";

interface Props {
    /** Overrides the live Redux config; used to render true-to-config thumbnails (e.g. presets). */
    config?: PolkaDotConfig;
}

// Fixed "design resolution" the preview is generated at (matches the default PNG export
// size), then scaled to fit the card via the SVG's own viewBox — no resize tracking needed.
// Rendering through a real SVG (rather than a CSS radial-gradient layer under a `transform`)
// avoids the soft/blurry dot edges that CSS's own gradient rasterization + compositing can
// introduce, and keeps the preview pixel-faithful to the SVG/PNG exports.
const PREVIEW_DESIGN_SIZE = 800;

export default function PolkaDotPreview({ config: configOverride }: Props) {
    const liveConfig = useAppSelector((s) => s.polkaDot);
    const config = configOverride ?? liveConfig;

    const svgDataUrl = useMemo(() => {
        const svg = buildPolkaDotSvgString(config, PREVIEW_DESIGN_SIZE, PREVIEW_DESIGN_SIZE);
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }, [config]);

    return (
        <div
            className="relative w-full h-full rounded-xl overflow-hidden"
            style={{ boxShadow: "rgba(197, 232, 154, 0.25) 0px 0px 0px 1px" }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={svgDataUrl} alt="Polka dot pattern preview" className="w-full h-full object-cover" />
        </div>
    );
}
