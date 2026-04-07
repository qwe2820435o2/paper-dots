import type { DotShape } from "@/store/slices/decorateSlice";

export const DOT_COLORS: { value: string; label: string }[] = [
    { value: "#1a1a1a", label: "Ink" },
    { value: "#fafafa", label: "Paper" },
    { value: "#cc7a00", label: "Marigold" },
    { value: "#ff1fa9", label: "Neon Pink" },
    { value: "#3b82f6", label: "Sky" },
    { value: "#10b981", label: "Mint" },
];

export const DOT_SHAPES: { value: DotShape; label: string }[] = [
    { value: "circle", label: "Circle" },
    { value: "square", label: "Square" },
    { value: "teardrop", label: "Teardrop" },
];

/**
 * SVG path for a teardrop centered at (0, 0), normalized to roughly fit a
 * unit box of size 1x1. Konva.Path will scale it.
 */
export const TEARDROP_PATH =
    "M0,-0.5 C0.35,-0.1 0.5,0.15 0.5,0.25 A0.5,0.25 0 0 1 -0.5,0.25 C-0.5,0.15 -0.35,-0.1 0,-0.5 Z";
