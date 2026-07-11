import type { DotShape } from "@/store/slices/decorateSlice";

export interface PalettePreset {
    id: string;
    label: string;
    colors: [string, string, string, string];
}

export const PALETTE_PRESETS: PalettePreset[] = [
    {
        id: "morandi",
        label: "Morandi",
        colors: ["#c4b7a6", "#a8b5a2", "#b5c4ce", "#d4c5b0"],
    },
    {
        id: "macaron",
        label: "Macaron",
        colors: ["#f9c5d1", "#c5e3f7", "#d5f5e3", "#fde8c8"],
    },
    {
        id: "sunset",
        label: "Sunset",
        colors: ["#f4a261", "#e76f51", "#c77dff", "#f8edeb"],
    },
    {
        id: "ocean",
        label: "Ocean",
        colors: ["#03045e", "#0077b6", "#90e0ef", "#caf0f8"],
    },
    {
        id: "forest",
        label: "Forest",
        colors: ["#2d6a4f", "#52b788", "#b7e4c7", "#d8f3dc"],
    },
];

export const DOT_COLORS: { value: string; label: string }[] = [
    { value: "#1a1a1a", label: "Ink" },
    { value: "#fafafa", label: "Paper" },
    { value: "#cc7a00", label: "Marigold" },
    { value: "#ff1fa9", label: "Neon Pink" },
    { value: "#3b82f6", label: "Sky" },
];

export const DOT_SHAPES: { value: DotShape; label: string }[] = [
    { value: "circle", label: "Circle" },
    { value: "flower", label: "Flower" },
    { value: "character", label: "Character" },
    { value: "diamond", label: "Diamond" },
    { value: "heart", label: "Heart" },
    { value: "star", label: "Star" },
    { value: "crown", label: "Crown" },
    { value: "leaf", label: "Leaf" },
    { value: "crescent", label: "Crescent" },
    { value: "snowflake", label: "Snowflake" },
];

/**
 * SVG paths for shapes drawn via Konva.Path. All paths are normalized to a
 * unit box centered at (0, 0), so Konva can scale them by `size` directly.
 *
 * `circle` and `square` are rendered with native Konva primitives for crisper
 * anti-aliasing, so their entries are `null`.
 */
export const SHAPE_PATHS: Record<DotShape, string | null> = {
    circle: null,
    // Four-leaf clover: 4 oval lobes meeting at origin, each drawn with 2 quadratic beziers.
    flower:
        "M0,0 Q0.35,-0.25 0,-0.5 Q-0.35,-0.25 0,0 Q0.25,0.35 0.5,0 Q0.25,-0.35 0,0 Q-0.35,0.25 0,0.5 Q0.35,0.25 0,0 Q-0.25,-0.35 -0.5,0 Q-0.25,0.35 0,0 Z",
    character: null,
    // Elongated rhombus (taller than wide) — an equal-diagonal rhombus is a square in
    // disguise and reads as one at any rotation, so the diagonals must differ.
    diamond: "M0,-0.5 L0.33,0 L0,0.5 L-0.33,0 Z",
    // Two-lobe heart built from two circular lobes tangent to a bottom point,
    // point at the bottom — reads as a clean, rounded heart at any rotation.
    heart:
        "M0,0.5 L-0.411,0.0932 A0.3,0.3 0 0 1 0,-0.3436 A0.3,0.3 0 0 1 0.411,0.0932 L0,0.5 Z",
    // 5-pointed star, outer radius 0.5, inner radius 0.2.
    star:
        "M0,-0.5 L0.118,-0.162 L0.476,-0.155 L0.190,0.062 L0.294,0.405 L0,0.2 L-0.294,0.405 L-0.190,0.062 L-0.476,-0.155 L-0.118,-0.162 Z",
    // Crown: tall center peak, two side peaks, V-dips between, solid base — matches Lucide Crown icon.
    crown:
        "M-0.5,0.4 L-0.5,-0.3 L-0.2,0.1 L0,-0.5 L0.2,0.1 L0.5,-0.3 L0.5,0.4 Z",
    // Almond / olive leaf, two quadratic arcs meeting at top and bottom tips.
    leaf: "M0,-0.5 Q0.4,0 0,0.5 Q-0.4,0 0,-0.5 Z",
    // Crescent moon: outer circle r=0.5 minus inner circle r=0.4 offset right.
    crescent:
        "M0.35,-0.357 A0.5,0.5 0 1,0 0.35,0.357 A0.38,0.38 0 1,1 0.35,-0.357 Z",
    // Rendered as stroked lines in DecorateCanvas (not a filled path).
    snowflake: null,
};
