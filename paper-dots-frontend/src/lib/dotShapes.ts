import type { DotShape } from "@/store/slices/decorateSlice";

export const DOT_COLORS: { value: string; label: string }[] = [
    { value: "#1a1a1a", label: "Ink" },
    { value: "#fafafa", label: "Paper" },
    { value: "#cc7a00", label: "Marigold" },
    { value: "#ff1fa9", label: "Neon Pink" },
    { value: "#3b82f6", label: "Sky" },
];

export const DOT_SHAPES: { value: DotShape; label: string }[] = [
    { value: "circle", label: "Circle" },
    { value: "square", label: "Square" },
    { value: "character", label: "Character" },
    { value: "teardrop", label: "Teardrop" },
    { value: "heart", label: "Heart" },
    { value: "star", label: "Star" },
    { value: "hexagon", label: "Hexagon" },
    { value: "leaf", label: "Leaf" },
    { value: "crescent", label: "Crescent" },
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
    square: null,
    character: null,
    // Pointed tip on top, circular bottom (sides tangent to bottom circle).
    teardrop: "M0,-0.5 L0.282,0.029 A0.32,0.32 0 1,1 -0.282,0.029 Z",
    // Classic two-lobe heart, point at the bottom.
    heart:
        "M0,0.5 C-0.5,0.15 -0.5,-0.35 -0.25,-0.5 C-0.1,-0.5 0,-0.35 0,-0.2 C0,-0.35 0.1,-0.5 0.25,-0.5 C0.5,-0.35 0.5,0.15 0,0.5 Z",
    // 5-pointed star, outer radius 0.5, inner radius 0.2.
    star:
        "M0,-0.5 L0.118,-0.162 L0.476,-0.155 L0.190,0.062 L0.294,0.405 L0,0.2 L-0.294,0.405 L-0.190,0.062 L-0.476,-0.155 L-0.118,-0.162 Z",
    // Pointy-top regular hexagon, circumradius 0.5.
    hexagon:
        "M0,-0.5 L0.433,-0.25 L0.433,0.25 L0,0.5 L-0.433,0.25 L-0.433,-0.25 Z",
    // Almond / olive leaf, two quadratic arcs meeting at top and bottom tips.
    leaf: "M0,-0.5 Q0.4,0 0,0.5 Q-0.4,0 0,-0.5 Z",
    // Crescent moon: outer circle r=0.5 minus inner circle r=0.4 offset right.
    crescent:
        "M0.34,-0.367 A0.5,0.5 0 1,0 0.34,0.367 A0.4,0.4 0 1,0 0.34,-0.367 Z",
};
