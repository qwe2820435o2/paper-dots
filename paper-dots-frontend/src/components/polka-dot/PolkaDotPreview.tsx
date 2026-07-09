"use client";

import { useAppSelector } from "@/store/hooks";
import { computeDotGridTile, dotGridBackgroundCss } from "@/lib/polkaDotGrid";

export default function PolkaDotPreview() {
    const config = useAppSelector((s) => s.polkaDot);

    const tile = computeDotGridTile(config.arrangement, config.spacing, config.dotSize, config.zoom);
    const { backgroundImage, backgroundSize, backgroundPosition } = dotGridBackgroundCss(tile, config.dotColor);

    return (
        <div
            className="relative w-full h-full rounded-xl overflow-hidden"
            style={{
                backgroundColor: config.backgroundColor,
                boxShadow: "rgba(197, 232, 154, 0.25) 0px 0px 0px 1px",
            }}
        >
            <div
                className="absolute inset-0"
                style={{
                    backgroundImage,
                    backgroundSize,
                    backgroundPosition,
                    opacity: config.opacity / 100,
                }}
            />
        </div>
    );
}
