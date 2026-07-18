"use client";

import { useMemo } from "react";
import { useAppSelector } from "@/store/hooks";
import { buildIconGridSvgString, buildIconSetThumbnailSvgString, type GeometricConfig } from "@/lib/geometricGrid";

interface Props {
    /** Overrides the live Redux config; used to render true-to-config thumbnails. */
    config?: GeometricConfig;
    /** alt text for the rendered pattern image */
    alt?: string;
    /**
     * Design resolution the SVG is generated at (px, square). Smaller values enlarge the
     * pattern relative to the viewport, keeping tiny thumbnails legible.
     */
    size?: number;
    /** Renders the single-color, no-repeat icon-set thumbnail instead of the randomized,
     *  white/front-colored live grid. Used for icon-set picker thumbnails. */
    thumbnail?: boolean;
}

// Default "design resolution" the preview SVG is generated at, then scaled to fit its
// container by the SVG's own viewBox — no resize tracking needed. Patterns are pure vector,
// so an <img> data URL stays crisp at any size with no raster decode cost.
const PREVIEW_DESIGN_SIZE = 800;

export default function GeometricPreview({
    config: configOverride,
    alt = "Geometric pattern preview",
    size = PREVIEW_DESIGN_SIZE,
    thumbnail = false,
}: Props) {
    const liveConfig = useAppSelector((s) => s.geometric);
    const config = configOverride ?? liveConfig;

    const svgDataUrl = useMemo(() => {
        // Generate the SVG itself at a columns:rows-proportional size (not a fixed square) so
        // its cells — and the container's matching CSS aspect-ratio — are square, whatever the
        // grid's row/column counts are. The larger side is pinned to `size`.
        const cellPx = size / Math.max(config.rows, config.columns);
        const width = Math.round(cellPx * config.columns);
        const height = Math.round(cellPx * config.rows);

        const svg = thumbnail
            ? buildIconSetThumbnailSvgString(
                  config.iconSetId,
                  config.backgroundColor,
                  config.frontColor,
                  config.rows,
                  config.columns,
                  width,
                  height,
              )
            : buildIconGridSvgString(config, width, height);
        return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
    }, [config, size, thumbnail]);

    return (
        <div
            className="relative w-full h-full rounded-xl overflow-hidden"
            style={{ boxShadow: "rgba(197, 232, 154, 0.25) 0px 0px 0px 1px" }}
        >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={svgDataUrl} alt={alt} className="w-full h-full object-cover" />
        </div>
    );
}
