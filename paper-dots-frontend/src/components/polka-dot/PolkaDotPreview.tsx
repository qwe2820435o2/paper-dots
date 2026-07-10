"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import {
    computeDotGridTile,
    dotGridBackgroundCss,
    cssTransformMatrix,
    matrixToCssString,
    buildPolkaDotSvgString,
    type PolkaDotConfig,
} from "@/lib/polkaDotGrid";

interface Props {
    /** Overrides the live Redux config; used to render true-to-config thumbnails (e.g. presets). */
    config?: PolkaDotConfig;
}

// Fixed "design resolution" the icon-mode preview is generated at (matches the default PNG
// export size), then scaled to fit the card via the SVG's own viewBox — no resize tracking needed.
const ICON_PREVIEW_SIZE = 800;

export default function PolkaDotPreview({ config: configOverride }: Props) {
    const liveConfig = useAppSelector((s) => s.polkaDot);
    const config = configOverride ?? liveConfig;

    const tile = computeDotGridTile(config.arrangement, config.spacing, config.dotSize, config.zoom);
    const { backgroundImage, backgroundSize, backgroundPosition } = dotGridBackgroundCss(tile, config.dotColor);
    const matrix = cssTransformMatrix(config.rotation, config.skewX, config.skewY);

    const iconSvgDataUrl = useMemo(() => {
        if (!config.iconUrl) return null;
        const svg = buildPolkaDotSvgString(config, ICON_PREVIEW_SIZE, ICON_PREVIEW_SIZE);
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }, [config]);

    if (iconSvgDataUrl) {
        return (
            <div
                className="relative w-full h-full rounded-xl overflow-hidden"
                style={{ boxShadow: "rgba(197, 232, 154, 0.25) 0px 0px 0px 1px" }}
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={iconSvgDataUrl} alt="Polka dot pattern preview" className="w-full h-full object-cover" />
            </div>
        );
    }

    return (
        <div
            className="relative w-full h-full rounded-xl overflow-hidden"
            style={{
                backgroundColor: config.backgroundColor,
                boxShadow: "rgba(197, 232, 154, 0.25) 0px 0px 0px 1px",
            }}
        >
            {/* Oversized so rotation/skew never exposes a blank corner within the visible container. */}
            <div
                className="absolute"
                style={{
                    inset: "-150%",
                    backgroundImage,
                    backgroundSize,
                    backgroundPosition,
                    opacity: config.opacity / 100,
                    transform: matrixToCssString(matrix),
                }}
            />
        </div>
    );
}
