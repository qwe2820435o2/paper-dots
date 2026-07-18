/**
 * Base shape primitives for the geometric grid tool, each authored once in a -50..50
 * centered box (so rotation in geometricGrid.ts is a plain `rotate()` around the origin).
 * A few compound shapes (comma, flag-dot, square-dot, checker-2x2, target, double-ring,
 * twin-dot, dot-grid) bake more than one element directly into `primary`.
 */

export interface IconShape {
    id: string;
    label: string;
    primary: (fg: string) => string;
    /** How many of the 4 rotation steps (0/90/180/270) look visually distinct. Defaults to 4
     *  (fully asymmetric) when omitted. Used by the icon-set spec-sheet thumbnail to avoid
     *  showing the same shape twice under a rotation that doesn't actually change it. */
    symmetry?: 1 | 2 | 4;
}

export const ICON_SHAPES: Record<string, IconShape> = {
    "quarter-circle": {
        id: "quarter-circle",
        label: "Quarter circle",
        primary: (fg) => `<path d="M -50,-50 L 50,-50 A 100 100 0 0 1 -50,50 Z" fill="${fg}"/>`,
    },
    "round-blob": {
        id: "round-blob",
        label: "Round blob",
        primary: (fg) =>
            `<path d="M -50,-30.74 L -50,30.74 A 12 12 0 0 0 -33.64,41.92 A 45 45 0 0 0 -33.64,-41.92 A 12 12 0 0 0 -50,-30.74 Z" fill="${fg}"/>`,
    },
    semicircle: {
        id: "semicircle",
        label: "Semicircle",
        primary: (fg) => `<path d="M -50,50 A 50 50 0 0 1 50,50 Z" fill="${fg}"/>`,
    },
    circle: {
        id: "circle",
        label: "Circle",
        primary: (fg) => `<circle r="32" fill="${fg}"/>`,
        symmetry: 1,
    },
    ring: {
        id: "ring",
        label: "Ring",
        primary: (fg) => `<circle r="35" fill="none" stroke="${fg}" stroke-width="10"/>`,
        symmetry: 1,
    },
    leaf: {
        id: "leaf",
        label: "Leaf",
        primary: (fg) => `<path d="M -35,-35 Q 35,-35 35,35 Q -35,35 -35,-35 Z" fill="${fg}"/>`,
        symmetry: 2,
    },
    quatrefoil: {
        id: "quatrefoil",
        label: "Quatrefoil",
        primary: (fg) =>
            `<circle cx="20" cy="0" r="18" fill="${fg}"/>` +
            `<circle cx="-20" cy="0" r="18" fill="${fg}"/>` +
            `<circle cx="0" cy="20" r="18" fill="${fg}"/>` +
            `<circle cx="0" cy="-20" r="18" fill="${fg}"/>`,
        symmetry: 1,
    },
    triangle: {
        id: "triangle",
        label: "Triangle",
        primary: (fg) => `<path d="M -50,-50 L 50,-50 L 50,50 Z" fill="${fg}"/>`,
    },
    square: {
        id: "square",
        label: "Square",
        primary: (fg) => `<rect x="-32" y="-32" width="64" height="64" fill="${fg}"/>`,
        symmetry: 1,
    },
    dot: {
        id: "dot",
        label: "Dot",
        primary: (fg) => `<circle r="10" fill="${fg}"/>`,
        symmetry: 1,
    },
    asterisk: {
        id: "asterisk",
        label: "Asterisk",
        primary: (fg) =>
            `<g stroke="${fg}" stroke-width="9" stroke-linecap="round">` +
            `<line x1="0" y1="-35" x2="0" y2="35"/>` +
            `<line x1="-30.3" y1="-17.5" x2="30.3" y2="17.5"/>` +
            `<line x1="-30.3" y1="17.5" x2="30.3" y2="-17.5"/>` +
            `</g>`,
    },
    pinwheel: {
        id: "pinwheel",
        label: "Pinwheel",
        primary: (fg) =>
            [0, 90, 180, 270]
                .map((a) => `<path d="M 0,0 L 38,0 L 20,20 Z" transform="rotate(${a})" fill="${fg}"/>`)
                .join(""),
        symmetry: 1,
    },
    "arc-strip": {
        id: "arc-strip",
        label: "Arc strip",
        primary: (fg) =>
            `<path d="M -20,-35 Q 20,-35 20,0 Q 20,35 -20,35" fill="none" stroke="${fg}" stroke-width="12" stroke-linecap="round"/>`,
    },
    "semicircle-pair": {
        id: "semicircle-pair",
        label: "Semicircle pair",
        primary: (fg) =>
            `<path d="M -41,-4 A 41 41 0 0 1 41,-4 Z" fill="${fg}"/>` + `<path d="M -41,4 A 41 41 0 0 0 41,4 Z" fill="${fg}"/>`,
        symmetry: 2,
    },
    comma: {
        id: "comma",
        label: "Comma",
        primary: (fg) =>
            `<circle cx="10" cy="-16" r="20" fill="${fg}"/>` +
            `<path d="M -6,0 Q -30,8 -36,34 Q -22,14 0,10 Z" fill="${fg}"/>`,
    },
    bowtie: {
        id: "bowtie",
        label: "Bowtie",
        primary: (fg) => `<path d="M -38,-32 L 0,0 L -38,32 Z" fill="${fg}"/>` + `<path d="M 38,-32 L 0,0 L 38,32 Z" fill="${fg}"/>`,
        symmetry: 2,
    },
    vesica: {
        id: "vesica",
        label: "Vesica",
        primary: (fg) =>
            `<path d="M -40,0 Q 0,-40 40,0 Q 0,40 -40,0 Z" fill="${fg}"/>` +
            `<path d="M 0,-40 Q 40,0 0,40 Q 0,0 0,-40 Z" fill="${fg}" fill-opacity="0.45"/>`,
    },
    "twin-dot": {
        id: "twin-dot",
        label: "Twin dot",
        primary: (fg) => `<circle cx="-14" cy="-8" r="11" fill="${fg}"/>` + `<circle cx="14" cy="8" r="11" fill="${fg}"/>`,
        symmetry: 2,
    },
    target: {
        id: "target",
        label: "Target",
        primary: (fg) => `<circle r="40" fill="none" stroke="${fg}" stroke-width="8"/>` + `<circle r="14" fill="${fg}"/>`,
        symmetry: 1,
    },
    "double-ring": {
        id: "double-ring",
        label: "Double ring",
        primary: (fg) => `<circle r="40" fill="none" stroke="${fg}" stroke-width="7"/>` + `<circle r="24" fill="none" stroke="${fg}" stroke-width="7"/>`,
        symmetry: 1,
    },
    "dot-grid": {
        id: "dot-grid",
        label: "Dot grid",
        primary: (fg) =>
            [-28, 0, 28]
                .flatMap((y) => [-28, 0, 28].map((x) => `<circle cx="${x}" cy="${y}" r="6" fill="${fg}"/>`))
                .join(""),
        symmetry: 1,
    },
    chevron: {
        id: "chevron",
        label: "Chevron",
        primary: (fg) => `<path d="M -25,-35 L 25,0 L -25,35 L -25,15 L 5,0 L -25,-15 Z" fill="${fg}"/>`,
    },
    "double-chevron": {
        id: "double-chevron",
        label: "Double chevron",
        primary: (fg) =>
            `<path d="M -39,-35 L 11,0 L -39,35 L -39,15 L -9,0 L -39,-15 Z" fill="${fg}"/>` +
            `<path d="M -11,-35 L 39,0 L -11,35 L -11,15 L 19,0 L -11,-15 Z" fill="${fg}"/>`,
    },
    zigzag: {
        id: "zigzag",
        label: "Zigzag",
        primary: (fg) => `<path d="M -8,-38 L -30,4 L -6,4 L -14,38 L 34,-6 L 6,-6 L 16,-38 Z" fill="${fg}"/>`,
    },
    "star-4point": {
        id: "star-4point",
        label: "Star",
        primary: (fg) => `<path d="M 0,-42 Q 6,-6 42,0 Q 6,6 0,42 Q -6,6 -42,0 Q -6,-6 0,-42 Z" fill="${fg}"/>`,
        symmetry: 1,
    },
    "flag-dot": {
        id: "flag-dot",
        label: "Flag dot",
        primary: (fg) => `<path d="M -40,-40 L 10,-40 L -40,10 Z" fill="${fg}"/>` + `<circle cx="28" cy="28" r="12" fill="${fg}"/>`,
    },
    "square-dot": {
        id: "square-dot",
        label: "Square dot",
        primary: (fg) => `<rect x="-30" y="-30" width="60" height="60" fill="${fg}" fill-opacity="0.35"/>` + `<circle r="13" fill="${fg}"/>`,
        symmetry: 1,
    },
    "checker-2x2": {
        id: "checker-2x2",
        label: "Checker",
        primary: (fg) =>
            `<rect x="-30" y="-30" width="26" height="26" fill="${fg}"/>` +
            `<rect x="4" y="-30" width="26" height="26" fill="${fg}" fill-opacity="0.4"/>` +
            `<rect x="-30" y="4" width="26" height="26" fill="${fg}" fill-opacity="0.4"/>` +
            `<rect x="4" y="4" width="26" height="26" fill="${fg}"/>`,
        symmetry: 2,
    },
    "pie-circle": {
        id: "pie-circle",
        label: "Pie circle",
        primary: (fg) => `<path d="M 0,0 L 0,-40 A 40 40 0 1 1 -34.6,20 Z" fill="${fg}"/>`,
    },
};

export interface IconSet {
    id: string;
    label: string;
    shapeIds: string[];
}

export const GEOMETRIC_ICON_SETS: IconSet[] = [
    {
        id: "sector",
        label: "Sector",
        shapeIds: ["quarter-circle", "round-blob", "semicircle", "semicircle-pair", "square", "circle"],
    },
    {
        id: "pennant",
        label: "Pennant",
        shapeIds: ["triangle", "leaf", "quatrefoil", "bowtie", "flag-dot", "square-dot", "checker-2x2"],
    },
    {
        id: "orbit",
        label: "Orbit",
        shapeIds: ["leaf", "pie-circle", "semicircle", "double-chevron", "pinwheel"],
    },
    {
        id: "classic",
        label: "Classic",
        shapeIds: ["triangle", "square", "circle", "leaf"],
    },
    {
        id: "mosaic",
        label: "Mosaic",
        shapeIds: ["leaf", "dot-grid", "square", "ring", "triangle", "asterisk", "arc-strip", "target"],
    },
    {
        id: "abstract",
        label: "Abstract",
        shapeIds: ["target", "semicircle", "comma", "quarter-circle", "bowtie", "ring", "double-ring", "twin-dot", "quatrefoil"],
    },
    {
        id: "arrows",
        label: "Arrows",
        shapeIds: ["chevron", "double-chevron", "zigzag", "bowtie", "triangle", "pinwheel"],
    },
    {
        id: "flowers",
        label: "Flowers",
        shapeIds: ["leaf", "vesica", "arc-strip", "star-4point"],
    },
];

export const DEFAULT_ICON_SET_ID = "sector";

export function getIconSet(iconSetId: string): IconSet {
    return GEOMETRIC_ICON_SETS.find((s) => s.id === iconSetId) ?? GEOMETRIC_ICON_SETS[0];
}

export function getShapesForSet(iconSetId: string): IconShape[] {
    return getIconSet(iconSetId).shapeIds.map((id) => ICON_SHAPES[id]);
}
