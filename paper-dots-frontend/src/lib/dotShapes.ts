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
 * SVG path for a teardrop centered at (0, 0): pointed tip at the top,
 * circular bottom. Height = 1 (y from -0.5 to 0.5), width ≈ 0.64.
 * Straight sides are tangent to the bottom circle (center (0, 0.18),
 * r = 0.32), giving a slimmer, more natural water-drop silhouette.
 * Konva.Path will scale it.
 */
export const TEARDROP_PATH =
    "M0,-0.5 L0.282,0.029 A0.32,0.32 0 1,1 -0.282,0.029 Z";
