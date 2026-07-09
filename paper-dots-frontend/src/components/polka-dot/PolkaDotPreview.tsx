"use client";

import { useAppSelector } from "@/store/hooks";
import {
    computeDotGridTile,
    dotGridBackgroundCss,
    cssTransformMatrix,
    matrixToCssString,
    type PolkaDotConfig,
} from "@/lib/polkaDotGrid";

interface Props {
    /** Overrides the live Redux config; used to render true-to-config thumbnails (e.g. presets). */
    config?: PolkaDotConfig;
}

export default function PolkaDotPreview({ config: configOverride }: Props) {
    const liveConfig = useAppSelector((s) => s.polkaDot);
    const config = configOverride ?? liveConfig;

    const tile = computeDotGridTile(config.arrangement, config.spacing, config.dotSize, config.zoom);
    const { backgroundImage, backgroundSize, backgroundPosition } = dotGridBackgroundCss(tile, config.dotColor);
    const matrix = cssTransformMatrix(config.rotation, config.skewX, config.skewY);

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
