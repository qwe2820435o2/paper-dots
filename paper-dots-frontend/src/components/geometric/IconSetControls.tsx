"use client";

import { useMemo } from "react";
import { Check } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setIconSetId } from "@/store/slices/geometricSlice";
import { GEOMETRIC_ICON_SETS } from "@/lib/geometricIconSets";
import type { GeometricConfig } from "@/lib/geometricGrid";
import GeometricPreview from "./GeometricPreview";

// Thumbnails render a fixed-seed spec sheet (not the live rows/cols/seed) so the card reads
// as "which shapes are in this family" — each shape/rotation shown at most once — rather than
// mirroring the current grid's exact randomized layout.
const THUMB_SIZE = 150;

export default function IconSetControls() {
    const dispatch = useAppDispatch();
    const iconSetId = useAppSelector((s) => s.geometric.iconSetId);
    const backgroundColor = useAppSelector((s) => s.geometric.backgroundColor);
    const frontColor = useAppSelector((s) => s.geometric.frontColor);

    // Rebuilt only when the colors actually change, so selecting a set (which only changes
    // iconSetId) doesn't create ~90 new config objects and defeat GeometricPreview's memoization.
    const thumbConfigs = useMemo<GeometricConfig[]>(
        () =>
            GEOMETRIC_ICON_SETS.map((set) => ({
                iconSetId: set.id,
                rows: 4,
                columns: 4,
                gridStyle: "even",
                backgroundColor,
                frontColor,
                seed: 1,
                density: 100,
                spacing: 0,
                rotation: 0,
                opacity: 100,
                randomizeRotation: false,
                randomizeSpacing: false,
            })),
        [backgroundColor, frontColor],
    );

    return (
        <div className="px-4 py-4">
            <div className="grid grid-cols-2 gap-2">
                {GEOMETRIC_ICON_SETS.map((set, i) => {
                    const selected = iconSetId === set.id;
                    const thumbConfig = thumbConfigs[i];
                    return (
                        <button
                            key={set.id}
                            type="button"
                            onClick={() => dispatch(setIconSetId(set.id))}
                            aria-pressed={selected}
                            className="flex flex-col items-center gap-1"
                        >
                            <div
                                className={`relative w-full aspect-square rounded-lg transition-all ${
                                    selected ? "ring-2 ring-primary" : "ring-1 ring-border"
                                }`}
                            >
                                <div className="w-full h-full rounded-lg overflow-hidden">
                                    <GeometricPreview config={thumbConfig} size={THUMB_SIZE} alt={set.label} thumbnail />
                                </div>
                                {selected && (
                                    <div
                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                                        style={{ background: "#9ED06C", boxShadow: "0 0 0 1.5px white" }}
                                    >
                                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                    </div>
                                )}
                            </div>
                            <span
                                className={`text-[11px] truncate max-w-full ${selected ? "" : "text-muted-foreground"}`}
                                style={{
                                    color: selected ? "#9ED06C" : undefined,
                                    fontWeight: selected ? 600 : 400,
                                }}
                            >
                                {set.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
