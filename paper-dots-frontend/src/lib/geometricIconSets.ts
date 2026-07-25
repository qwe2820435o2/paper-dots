/**
 * Base shape primitives for the geometric grid tool, each authored once in a -50..50
 * centered box (so rotation in geometricGrid.ts is a plain `rotate()` around the origin).
 * A few compound shapes (pennant-checkerboard, classic-dot-grid-6x6, mosaic-target-dot-ring,
 * mosaic-bullseye-double-ring, pennant-nested-squares-dot) bake more than one element directly
 * into `primary`.
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
    "sector-circle": {
        id: "sector-circle",
        label: "Circle",
        primary: (fg) => `<circle r="40" fill="${fg}"/>`,
        symmetry: 1,
    },
    "sector-square": {
        id: "sector-square",
        label: "Square",
        primary: (fg) => `<rect x="-40" y="-40" width="80" height="80" fill="${fg}"/>`,
        symmetry: 1,
    },
    "sector-disc-square-corner": {
        id: "sector-disc-square-corner",
        label: "Disc square corner",
        primary: (fg) => `<path d="M -40,0 L -40,-40 L 0,-40 A 40 40 0 1 1 -40,0 Z" fill="${fg}"/>`,
    },
    "sector-half-disc": {
        id: "sector-half-disc",
        label: "Half disc",
        primary: (fg) => `<path d="M -40,40 A 40 40 0 0 1 40,40 Z" fill="${fg}"/>`,
    },
    "sector-half-disc-narrow": {
        id: "sector-half-disc-narrow",
        label: "Half disc narrow",
        primary: (fg) => `<path d="M -40,-40 A 26 40 0 0 1 -40,40 Z" fill="${fg}"/>`,
    },
    "sector-quarter-disc": {
        id: "sector-quarter-disc",
        label: "Quarter disc",
        primary: (fg) => `<path d="M -40,-40 L 40,-40 A 80 80 0 0 1 -40,40 Z" fill="${fg}"/>`,
    },
    "sector-double-half-disc": {
        id: "sector-double-half-disc",
        label: "Double half disc",
        primary: (fg) =>
            `<path d="M -40,-40 A 32 40 0 0 1 -40,40 Z" fill="${fg}"/>` + `<path d="M 2,-40 A 32 40 0 0 1 2,40 Z" fill="${fg}"/>`,
    },
    "sector-square-notch": {
        id: "sector-square-notch",
        label: "Square notch",
        primary: (fg) => `<path d="M -40,-40 L 40,-40 L 40,40 A 40 40 0 0 0 -40,40 Z" fill="${fg}"/>`,
    },
    "sector-square-round": {
        id: "sector-square-round",
        label: "Square round",
        primary: (fg) => `<path d="M -40,-40 L 40,-40 L 40,0 A 40 40 0 0 1 -40,0 Z" fill="${fg}"/>`,
    },
    "sector-square-round-corner": {
        id: "sector-square-round-corner",
        label: "Square round corner",
        primary: (fg) => `<path d="M -40,-40 L 40,-40 L 40,0 A 40 40 0 0 1 0,40 L -40,40 Z" fill="${fg}"/>`,
    },
    "pennant-triangle-circle": {
        id: "pennant-triangle-circle",
        label: "Triangle circle",
        primary: (fg) => `<path fill-rule="evenodd" d="M -50,-50 L 50,-50 L -50,50 Z M -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0 Z" fill="${fg}"/>`,
    },
    "pennant-triangle-dots": {
        id: "pennant-triangle-dots",
        label: "Triangle dots",
        primary: (fg) =>
            `<path fill-rule="evenodd" d="M -50,-50 L 50,-50 L -50,50 Z M -34.17,-21.67 a 12.5,12.5 0 1,0 25,0 a 12.5,12.5 0 1,0 -25,0 Z M 9.17,21.67 a 12.5,12.5 0 1,0 25,0 a 12.5,12.5 0 1,0 -25,0 Z" fill="${fg}"/>`,
    },
    "pennant-checkerboard": {
        id: "pennant-checkerboard",
        label: "Checkerboard",
        primary: (fg) =>
            `<rect x="-50" y="-50" width="50" height="50" fill="${fg}" fill-opacity="0.5"/>` +
            `<rect x="0" y="-50" width="50" height="50" fill="${fg}"/>` +
            `<rect x="-50" y="0" width="50" height="50" fill="${fg}"/>` +
            `<rect x="0" y="0" width="50" height="50" fill="${fg}" fill-opacity="0.5"/>`,
        symmetry: 2,
    },
    "pennant-four-circles": {
        id: "pennant-four-circles",
        label: "Four circles",
        primary: (fg) =>
            `<circle cx="-25" cy="-25" r="25" fill="${fg}"/>` +
            `<circle cx="25" cy="-25" r="25" fill="${fg}"/>` +
            `<circle cx="-25" cy="25" r="25" fill="${fg}"/>` +
            `<circle cx="25" cy="25" r="25" fill="${fg}"/>`,
        symmetry: 1,
    },
    "pennant-half-rect-circle": {
        id: "pennant-half-rect-circle",
        label: "Half rect circle",
        primary: (fg) =>
            `<path fill-rule="evenodd" d="M -50,-50 L 0,-50 L 0,50 L -50,50 Z M -25,0 a 25,25 0 1,0 50,0 a 25,25 0 1,0 -50,0 Z" fill="${fg}"/>`,
    },
    "pennant-nested-squares-dot": {
        id: "pennant-nested-squares-dot",
        label: "Nested squares",
        primary: (fg) =>
            `<rect x="-50" y="-50" width="100" height="100" fill="${fg}" fill-opacity="0.2"/>` +
            `<rect x="-25" y="-25" width="50" height="50" fill="${fg}" fill-opacity="0.4"/>` +
            `<circle r="12.5" fill="${fg}"/>`,
        symmetry: 1,
    },
    "pennant-triangle-tile": {
        id: "pennant-triangle-tile",
        label: "Triangle tile",
        primary: (fg) =>
            `<path d="M 0,-50 L 0,0 L -50,0 Z" fill="${fg}"/>` +
            `<path d="M 50,-50 L 50,0 L 0,0 Z" fill="${fg}"/>` +
            `<path d="M 0,0 L 0,50 L -50,50 Z" fill="${fg}"/>` +
            `<path d="M 50,0 L 50,50 L 0,50 Z" fill="${fg}"/>`,
    },
    "orbit-circle-quarters": {
        id: "orbit-circle-quarters",
        label: "Circle quarters",
        primary: (fg) =>
            `<path d="M 0,0 L 0,-50 A 50,50 0 0,0 -50,0 Z" fill="${fg}" fill-opacity="0.4"/>` +
            `<path d="M 0,0 L 0,-50 A 50,50 0 0,1 50,0 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M 0,0 L -50,0 A 50,50 0 0,0 0,50 Z" fill="${fg}" fill-opacity="0.6"/>` +
            `<path d="M 0,0 L 50,0 A 50,50 0 0,1 0,50 Z" fill="${fg}"/>`,
    },
    "orbit-arches-down": {
        id: "orbit-arches-down",
        label: "Arches down",
        primary: (fg) =>
            `<path d="M 0,-50 L -50,-50 A 50,50 0 0,0 0,0 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M 0,-50 L 50,-50 A 50,50 0 0,1 0,0 Z" fill="${fg}" fill-opacity="0.4"/>` +
            `<path d="M 0,0 L -50,0 A 50,50 0 0,0 0,50 Z" fill="${fg}" fill-opacity="0.6"/>` +
            `<path d="M 0,0 L 50,0 A 50,50 0 0,1 0,50 Z" fill="${fg}"/>`,
    },
    "orbit-arches-up": {
        id: "orbit-arches-up",
        label: "Arches up",
        primary: (fg) =>
            `<path d="M 0,0 L 0,-50 A 50,50 0 0,0 -50,0 Z" fill="${fg}"/>` +
            `<path d="M 0,0 L 0,-50 A 50,50 0 0,1 50,0 Z" fill="${fg}" fill-opacity="0.6"/>` +
            `<path d="M 0,50 L 0,0 A 50,50 0 0,0 -50,50 Z" fill="${fg}" fill-opacity="0.4"/>` +
            `<path d="M 0,50 L 0,0 A 50,50 0 0,1 50,50 Z" fill="${fg}" fill-opacity="0.2"/>`,
    },
    "orbit-petals-all-anti": {
        id: "orbit-petals-all-anti",
        label: "Petals all anti",
        primary: (fg) =>
            `<path d="M 0,-50 A 50,50 0 0,1 -50,0 A 50,50 0 0,1 0,-50 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M 50,-50 A 50,50 0 0,1 0,0 A 50,50 0 0,1 50,-50 Z" fill="${fg}" fill-opacity="0.4"/>` +
            `<path d="M 0,0 A 50,50 0 0,1 -50,50 A 50,50 0 0,1 0,0 Z" fill="${fg}" fill-opacity="0.8"/>` +
            `<path d="M 50,0 A 50,50 0 0,1 0,50 A 50,50 0 0,1 50,0 Z" fill="${fg}" fill-opacity="0.6"/>`,
    },
    "orbit-petals-all-main": {
        id: "orbit-petals-all-main",
        label: "Petals all main",
        primary: (fg) =>
            `<path d="M -50,-50 A 50,50 0 0,0 0,0 A 50,50 0 0,0 -50,-50 Z" fill="${fg}" fill-opacity="0.4"/>` +
            `<path d="M 0,-50 A 50,50 0 0,0 50,0 A 50,50 0 0,0 0,-50 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M -50,0 A 50,50 0 0,0 0,50 A 50,50 0 0,0 -50,0 Z" fill="${fg}" fill-opacity="0.6"/>` +
            `<path d="M 0,0 A 50,50 0 0,0 50,50 A 50,50 0 0,0 0,0 Z" fill="${fg}" fill-opacity="0.8"/>`,
    },
    "orbit-petals-dome-bottom": {
        id: "orbit-petals-dome-bottom",
        label: "Petals dome bottom",
        primary: (fg) =>
            `<path d="M -50,-50 A 50,50 0 0,0 0,0 A 50,50 0 0,0 -50,-50 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M 50,-50 A 50,50 0 0,1 0,0 A 50,50 0 0,1 50,-50 Z" fill="${fg}" fill-opacity="0.4"/>` +
            `<path d="M 0,0 L -50,0 A 50,50 0 0,0 0,50 Z" fill="${fg}" fill-opacity="0.6"/>` +
            `<path d="M 0,0 L 50,0 A 50,50 0 0,1 0,50 Z" fill="${fg}"/>`,
    },
    "orbit-dome-top-petals": {
        id: "orbit-dome-top-petals",
        label: "Dome top petals",
        primary: (fg) =>
            `<path d="M 0,0 L 0,-50 A 50,50 0 0,0 -50,0 Z" fill="${fg}"/>` +
            `<path d="M 0,0 L 0,-50 A 50,50 0 0,1 50,0 Z" fill="${fg}" fill-opacity="0.6"/>` +
            `<path d="M 0,0 A 50,50 0 0,1 -50,50 A 50,50 0 0,1 0,0 Z" fill="${fg}" fill-opacity="0.4"/>` +
            `<path d="M 0,0 A 50,50 0 0,0 50,50 A 50,50 0 0,0 0,0 Z" fill="${fg}" fill-opacity="0.2"/>`,
    },
    "orbit-petals-left-anti": {
        id: "orbit-petals-left-anti",
        label: "Petals left anti",
        primary: (fg) =>
            `<path d="M 0,-50 A 50,50 0 0,1 -50,0 A 50,50 0 0,1 0,-50 Z" fill="${fg}" fill-opacity="0.4"/>` +
            `<path d="M 0,-50 A 50,50 0 0,0 50,0 A 50,50 0 0,0 0,-50 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M 0,0 A 50,50 0 0,1 -50,50 A 50,50 0 0,1 0,0 Z" fill="${fg}" fill-opacity="0.6"/>` +
            `<path d="M 0,0 A 50,50 0 0,0 50,50 A 50,50 0 0,0 0,0 Z" fill="${fg}" fill-opacity="0.8"/>`,
    },
    "orbit-triangles-ll": {
        id: "orbit-triangles-ll",
        label: "Triangles lower-left",
        primary: (fg) =>
            `<path d="M -50,-50 L -50,0 L 0,0 Z" fill="${fg}" fill-opacity="0.4"/>` +
            `<path d="M 0,-50 L 0,0 L 50,0 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M -50,0 L -50,50 L 0,50 Z" fill="${fg}"/>` +
            `<path d="M 0,0 L 0,50 L 50,50 Z" fill="${fg}" fill-opacity="0.6"/>`,
    },
    "orbit-triangles-lr": {
        id: "orbit-triangles-lr",
        label: "Triangles lower-right",
        primary: (fg) =>
            `<path d="M 0,-50 L 0,0 L -50,0 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M 50,-50 L 50,0 L 0,0 Z" fill="${fg}" fill-opacity="0.4"/>` +
            `<path d="M 0,0 L 0,50 L -50,50 Z" fill="${fg}" fill-opacity="0.6"/>` +
            `<path d="M 50,0 L 50,50 L 0,50 Z" fill="${fg}"/>`,
    },
    "orbit-triangles-ul": {
        id: "orbit-triangles-ul",
        label: "Triangles upper-left",
        primary: (fg) =>
            `<path d="M -50,-50 L 0,-50 L -50,0 Z" fill="${fg}"/>` +
            `<path d="M 0,-50 L 50,-50 L 0,0 Z" fill="${fg}" fill-opacity="0.6"/>` +
            `<path d="M -50,0 L 0,0 L -50,50 Z" fill="${fg}" fill-opacity="0.4"/>` +
            `<path d="M 0,0 L 50,0 L 0,50 Z" fill="${fg}" fill-opacity="0.2"/>`,
    },
    "orbit-triangles-ur": {
        id: "orbit-triangles-ur",
        label: "Triangles upper-right",
        primary: (fg) =>
            `<path d="M -50,-50 L 0,-50 L 0,0 Z" fill="${fg}" fill-opacity="0.6"/>` +
            `<path d="M 0,-50 L 50,-50 L 50,0 Z" fill="${fg}"/>` +
            `<path d="M -50,0 L 0,0 L 0,50 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M 0,0 L 50,0 L 50,50 Z" fill="${fg}" fill-opacity="0.4"/>`,
    },
    "classic-asterisk-4bar": {
        id: "classic-asterisk-4bar",
        label: "Asterisk 4-bar",
        primary: (fg) =>
            [0, 45, 90, 135]
                .map((a) => `<rect x="-40" y="-5.42" width="80" height="10.83" transform="rotate(${a})" fill="${fg}"/>`)
                .join(""),
        symmetry: 1,
    },
    "classic-circle": {
        id: "classic-circle",
        label: "Circle",
        primary: (fg) => `<circle r="50" fill="${fg}"/>`,
        symmetry: 1,
    },
    "classic-concentric-rings": {
        id: "classic-concentric-rings",
        label: "Concentric rings",
        primary: (fg) =>
            `<circle r="50" fill="${fg}" fill-opacity="0.2"/>` +
            `<circle r="40" fill="${fg}" fill-opacity="0.4"/>` +
            `<circle r="30" fill="${fg}" fill-opacity="0.6"/>` +
            `<circle r="20" fill="${fg}"/>`,
        symmetry: 1,
    },
    "classic-diagonal-stripes": {
        id: "classic-diagonal-stripes",
        label: "Diagonal stripes",
        primary: (fg) =>
            [
                { y: -40, opacity: 1 },
                { y: -20, opacity: 0.57 },
                { y: 0, opacity: 0.306 },
                { y: 20, opacity: 1 },
                { y: 40, opacity: 0.57 },
            ]
                .map(
                    ({ y, opacity }) =>
                        `<rect x="-75" y="${y - 10}" width="150" height="20" transform="rotate(45)" fill="${fg}"${
                            opacity < 1 ? ` fill-opacity="${opacity}"` : ""
                        }/>`,
                )
                .join(""),
    },
    "classic-disc-two-tone": {
        id: "classic-disc-two-tone",
        label: "Disc two-tone",
        primary: (fg) =>
            `<path d="M -50,-50 L 50,-50 L 50,0 A 50,50 0 0,1 -50,0 Z" fill="${fg}" fill-opacity="0.3"/>` +
            `<path d="M 10,-50 L 50,-50 L 50,0 A 50,50 0 0,1 10,49 Q -30,0 10,-50 Z" fill="${fg}"/>`,
    },
    "classic-disc-two-tone-flipped": {
        id: "classic-disc-two-tone-flipped",
        label: "Disc two-tone flipped",
        primary: (fg) =>
            `<path d="M -50,50 L 50,50 L 50,0 A 50,50 0 0,0 -50,0 Z" fill="${fg}" fill-opacity="0.3"/>` +
            `<path d="M 10,50 L 50,50 L 50,0 A 50,50 0 0,0 10,-49 Q -30,0 10,50 Z" fill="${fg}"/>`,
    },
    "classic-dot-grid-6x6": {
        id: "classic-dot-grid-6x6",
        label: "Dot grid 6x6",
        primary: (fg) =>
            [-45, -27, -9, 9, 27, 45]
                .flatMap((y) => [-45, -27, -9, 9, 27, 45].map((x) => `<circle cx="${x}" cy="${y}" r="5.13" fill="${fg}"/>`))
                .join(""),
        symmetry: 1,
    },
    "classic-half-round-bottom-dot": {
        id: "classic-half-round-bottom-dot",
        label: "Half round bottom dot",
        primary: (fg) =>
            `<path d="M -50,-50 L 50,-50 L 50,0 A 50,50 0 0,1 -50,0 Z" fill="${fg}" fill-opacity="0.2"/>` + `<circle r="30" fill="${fg}"/>`,
    },
    "classic-petal-anti-diagonal": {
        id: "classic-petal-anti-diagonal",
        label: "Petal anti-diagonal",
        primary: (fg) => `<path d="M 50,-50 A 103.33,103.33 0 0,1 -50,50 A 103.33,103.33 0 0,1 50,-50 Z" fill="${fg}"/>`,
        symmetry: 2,
    },
    "classic-petal-main-diagonal": {
        id: "classic-petal-main-diagonal",
        label: "Petal main-diagonal",
        primary: (fg) => `<path d="M -50,-50 A 103.33,103.33 0 0,0 50,50 A 103.33,103.33 0 0,0 -50,-50 Z" fill="${fg}"/>`,
        symmetry: 2,
    },
    "classic-square": {
        id: "classic-square",
        label: "Square",
        primary: (fg) => `<rect x="-50" y="-50" width="100" height="100" fill="${fg}"/>`,
        symmetry: 1,
    },
    "classic-star-10-point": {
        id: "classic-star-10-point",
        label: "Star 10-point",
        primary: (fg) =>
            `<path d="M 0,-40 L -6.57,-20.21 L -23.51,-32.36 L -17.19,-12.49 L -38.04,-12.36 L -21.25,0 L -38.04,12.36 L -17.19,12.49 L -23.51,32.36 L -6.57,20.21 L 0,40 L 6.57,20.21 L 23.51,32.36 L 17.19,12.49 L 38.04,12.36 L 21.25,0 L 38.04,-12.36 L 17.19,-12.49 L 23.51,-32.36 L 6.57,-20.21 Z" fill="${fg}"/>`,
    },
    "classic-two-triangles": {
        id: "classic-two-triangles",
        label: "Two triangles",
        primary: (fg) => `<path d="M -50,-50 L -50,50 L 0,50 Z" fill="${fg}"/>` + `<path d="M 0,-50 L 0,50 L 50,50 Z" fill="${fg}"/>`,
    },
    "mosaic-bowtie": {
        id: "mosaic-bowtie",
        label: "Bowtie ribbon",
        primary: (fg) => `<path d="M -50,-50 L 0,-26.67 L 50,-50 L 50,50 L 0,26.67 L -50,50 Z" fill="${fg}"/>`,
        symmetry: 2,
    },
    "mosaic-bullseye-double-ring": {
        id: "mosaic-bullseye-double-ring",
        label: "Bullseye double ring",
        primary: (fg) =>
            `<circle r="43.33" fill="none" stroke="${fg}" stroke-width="13.33"/>` +
            `<circle r="20.83" fill="none" stroke="${fg}" stroke-width="11.67"/>`,
        symmetry: 1,
    },
    "mosaic-comet-two-circles": {
        id: "mosaic-comet-two-circles",
        label: "Comet two circles",
        primary: (fg) => `<circle cx="-8.33" cy="-18.33" r="31.67" fill="${fg}"/>` + `<circle cx="18.33" cy="18.33" r="23.33" fill="${fg}"/>`,
    },
    "mosaic-dome-and-dot": {
        id: "mosaic-dome-and-dot",
        label: "Dome and dot",
        primary: (fg) => `<path d="M -50,0 A 50,50 0 0,1 50,0 Z" fill="${fg}"/>` + `<circle cx="0" cy="30" r="19.17" fill="${fg}"/>`,
    },
    "mosaic-dome-bottom-two-notches": {
        id: "mosaic-dome-bottom-two-notches",
        label: "Dome bottom two notches",
        primary: (fg) =>
            `<path fill-rule="evenodd" d="M -50,13.33 A 50,36.67 0 0,1 50,13.33 Z M -31.67,3.33 A 18.33,18.33 0 1,0 5,3.33 A 18.33,18.33 0 1,0 -31.67,3.33 Z M -5,3.33 A 18.33,18.33 0 1,0 31.67,3.33 A 18.33,18.33 0 1,0 -5,3.33 Z" fill="${fg}"/>`,
    },
    "mosaic-dome-top-one-notch": {
        id: "mosaic-dome-top-one-notch",
        label: "Dome top one notch",
        primary: (fg) =>
            `<path fill-rule="evenodd" d="M -50,-16.67 A 50,33.33 0 0,1 50,-16.67 Z M -16.67,0 A 16.67,16.67 0 1,0 16.67,0 A 16.67,16.67 0 1,0 -16.67,0 Z" fill="${fg}"/>`,
    },
    "mosaic-dot-and-dome-bottom": {
        id: "mosaic-dot-and-dome-bottom",
        label: "Dot and dome bottom",
        primary: (fg) => `<circle cx="0.83" cy="-24.17" r="19.17" fill="${fg}"/>` + `<path d="M -50,0 L 50,0 A 50,50 0 0,1 -50,0 Z" fill="${fg}"/>`,
    },
    "mosaic-dot-and-dome-left": {
        id: "mosaic-dot-and-dome-left",
        label: "Dot and dome left",
        primary: (fg) => `<path d="M 0,-50 A 50,50 0 0,0 0,50 Z" fill="${fg}"/>` + `<circle cx="26.67" cy="0" r="20" fill="${fg}"/>`,
    },
    "mosaic-dot-and-dome-right": {
        id: "mosaic-dot-and-dome-right",
        label: "Dot and dome right",
        primary: (fg) => `<circle cx="-28.33" cy="0" r="20" fill="${fg}"/>` + `<path d="M 0,-50 A 50,50 0 0,1 0,50 Z" fill="${fg}"/>`,
    },
    "mosaic-dot-partial-ring": {
        id: "mosaic-dot-partial-ring",
        label: "Dot partial ring",
        primary: (fg) =>
            `<circle r="20" fill="${fg}"/>` +
            `<path d="M -49.83,-4.33 A 50,50 0 1,0 0,-50 L 0,-33.33 A 33.33,33.33 0 1,1 -33.17,-2.92 Z" fill="${fg}"/>`,
    },
    "mosaic-pacman": {
        id: "mosaic-pacman",
        label: "Pacman",
        primary: (fg) => `<path d="M -13.33,0 L 4.28,37.77 A 41.67,41.67 0 1,1 4.28,-37.77 Z" fill="${fg}"/>`,
    },
    "mosaic-ring-thick": {
        id: "mosaic-ring-thick",
        label: "Ring thick",
        primary: (fg) => `<circle r="44.17" fill="none" stroke="${fg}" stroke-width="11.67"/>`,
        symmetry: 1,
    },
    "mosaic-ring-thin": {
        id: "mosaic-ring-thin",
        label: "Ring thin",
        primary: (fg) => `<circle r="26.25" fill="none" stroke="${fg}" stroke-width="22.5"/>`,
        symmetry: 1,
    },
    "mosaic-target-dot-ring": {
        id: "mosaic-target-dot-ring",
        label: "Target dot ring",
        primary: (fg) => `<circle r="41.25" fill="none" stroke="${fg}" stroke-width="17.5"/>` + `<circle r="26.25" fill="${fg}"/>`,
        symmetry: 1,
    },
    "abstract-bowtie": {
        id: "abstract-bowtie",
        label: "Bowtie full",
        primary: (fg) => `<path d="M -50,-50 L 0,0 L -50,50 Z" fill="${fg}"/>` + `<path d="M 50,-50 L 0,0 L 50,50 Z" fill="${fg}"/>`,
        symmetry: 2,
    },
    "abstract-chevrons": {
        id: "abstract-chevrons",
        label: "Chevrons",
        primary: (fg) => `<path d="M -50,-50 L 50,-50 L 0,0 Z" fill="${fg}"/>` + `<path d="M -50,0 L 50,0 L 0,50 Z" fill="${fg}"/>`,
    },
    "abstract-triangles-up-pair": {
        id: "abstract-triangles-up-pair",
        label: "Triangles up pair",
        primary: (fg) =>
            `<path d="M -48.33,1.67 L -1.67,1.67 L -25,-50 Z" fill="${fg}"/>` +
            `<path d="M 1.67,1.67 L 48.33,1.67 L 25,-50 Z" fill="${fg}"/>` +
            `<path d="M -48.33,50 L -1.67,50 L -25,0 Z" fill="${fg}"/>` +
            `<path d="M 1.67,50 L 48.33,50 L 25,0 Z" fill="${fg}"/>`,
    },
    "abstract-zigzag-a": {
        id: "abstract-zigzag-a",
        label: "Zigzag A",
        primary: (fg) =>
            `<polygon points="-48.33,-45 -48.33,-1.67 -28.33,-21.67 -25,-21.67 -21.67,-18.33 -21.67,21.67 -1.67,1.67 1.67,5 1.67,48.33 45,5 1.67,5 -1.67,1.67 18.33,-18.33 -21.67,-18.33 -25,-21.67 -25,-25 -5,-45" fill="${fg}"/>`,
    },
    "abstract-zigzag-b": {
        id: "abstract-zigzag-b",
        label: "Zigzag B",
        primary: (fg) =>
            `<polygon points="48.33,-45 5,-45 25,-25 25,-21.67 21.67,-18.33 -18.33,-18.33 1.67,1.67 -1.67,5 -45,5 -1.67,48.33 -1.67,5 1.67,1.67 21.67,21.67 21.67,-18.33 25,-21.67 28.33,-21.67 48.33,-1.67" fill="${fg}"/>`,
    },
    "abstract-zigzag-c": {
        id: "abstract-zigzag-c",
        label: "Zigzag C",
        primary: (fg) =>
            `<polygon points="45,1.67 1.67,-41.67 1.67,1.67 -1.67,5 -21.67,-15 -21.67,25 -25,28.33 -28.33,28.33 -48.33,8.33 -48.33,48.33 -8.33,48.33 -25,31.67 -21.67,25 18.33,1.67" fill="${fg}"/>`,
    },
    "abstract-zigzag-d": {
        id: "abstract-zigzag-d",
        label: "Zigzag D",
        primary: (fg) =>
            `<polygon points="-1.67,-45 -45,-1.67 -1.67,-1.67 1.67,1.67 -18.33,21.67 21.67,21.67 25,25 25,28.33 5,48.33 48.33,48.33 48.33,5 28.33,25 25,25 21.67,21.67 1.67,1.67 -1.67,-1.67" fill="${fg}"/>`,
    },
    "arrows-double-lens-split": {
        id: "arrows-double-lens-split",
        label: "Double lens split",
        primary: (fg) =>
            `<path d="M -25,-50 A 63.33,63.33 0 0,0 -25,50 L -25,-50 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M -25,-50 A 63.33,63.33 0 0,1 -25,50 L -25,-50 Z" fill="${fg}"/>` +
            `<path d="M 25,-50 A 63.33,63.33 0 0,0 25,50 L 25,-50 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M 25,-50 A 63.33,63.33 0 0,1 25,50 L 25,-50 Z" fill="${fg}"/>`,
    },
    "arrows-leaf-diagonal-a": {
        id: "arrows-leaf-diagonal-a",
        label: "Leaf diagonal A",
        primary: (fg) =>
            `<path d="M -50,50 A 103.33,103.33 0 0,1 50,-50 L -50,50 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M 50,-50 A 103.33,103.33 0 0,1 -50,50 L 50,-50 Z" fill="${fg}"/>`,
    },
    "arrows-leaf-diagonal-b": {
        id: "arrows-leaf-diagonal-b",
        label: "Leaf diagonal B",
        primary: (fg) =>
            `<path d="M -50,-50 A 103.33,103.33 0 0,0 50,50 L -50,-50 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M 50,50 A 103.33,103.33 0 0,0 -50,-50 L 50,50 Z" fill="${fg}"/>`,
    },
    "arrows-sparkle-large": {
        id: "arrows-sparkle-large",
        label: "Sparkle large",
        primary: (fg) =>
            `<path d="M -50,-50 A 50,50 0 0,0 50,-50 A 50,50 0 0,0 50,50 A 50,50 0 0,0 -50,50 A 50,50 0 0,0 -50,-50 Z" fill="${fg}"/>`,
        symmetry: 1,
    },
    "arrows-sparkle-small": {
        id: "arrows-sparkle-small",
        label: "Sparkle small",
        primary: (fg) =>
            `<path d="M 0,-50 L 14.17,-14.17 L 50,0 L 14.17,14.17 L 0,50 L -14.17,14.17 L -50,0 L -14.17,-14.17 Z" fill="${fg}"/>`,
        symmetry: 1,
    },
    "arrows-stacked-horizontal-lens": {
        id: "arrows-stacked-horizontal-lens",
        label: "Stacked horizontal lens",
        primary: (fg) =>
            `<path d="M -50,-23.33 A 49.17,23.33 0 0,1 50,-23.33 Z" fill="${fg}"/>` +
            `<path d="M -50,-23.33 A 49.17,23.33 0 0,0 50,-23.33 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M -50,26.67 A 49.17,23.33 0 0,1 50,26.67 Z" fill="${fg}"/>` +
            `<path d="M -50,26.67 A 49.17,23.33 0 0,0 50,26.67 Z" fill="${fg}" fill-opacity="0.2"/>`,
    },
    // The 6 vessel shapes below (cylinder/box) are visually asymmetric but deliberately declare
    // `symmetry: 1` anyway — not because they're symmetric, but to lock them to their upright 0°
    // orientation in the variant pool, since a sideways/upside-down vase would look broken. This
    // repurposes the field as an "orientation lock" rather than its literal documented meaning.
    "flowers-cylinder-tall-dark": {
        id: "flowers-cylinder-tall-dark",
        label: "Cylinder tall dark",
        primary: (fg) =>
            `<path d="M -27.5,-30 L -27.5,15 A 16.25,8.75 0 0,0 5,15 L 5,-30 Z" fill="${fg}" fill-opacity="0.4"/>` +
            `<ellipse cx="-11.25" cy="-30" rx="16.25" ry="8.75" fill="${fg}"/>`,
        symmetry: 1,
    },
    "flowers-box-tall-light": {
        id: "flowers-box-tall-light",
        label: "Box tall light",
        primary: (fg) =>
            `<path d="M -27.5,-30 L -27.5,15 A 16.25,8.75 0 0,0 -10,23.72 L -10,-30 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M -10,-30 L -10,23.72 A 16.25,8.75 0 0,0 5,15 L 5,-30 Z" fill="${fg}" fill-opacity="0.6"/>` +
            `<path d="M -11.25,-37.5 L 5,-30 L -11.25,-22.5 L -27.5,-30 Z" fill="${fg}"/>`,
        symmetry: 1,
    },
    "flowers-cylinder-medium-dark": {
        id: "flowers-cylinder-medium-dark",
        label: "Cylinder medium dark",
        primary: (fg) =>
            `<path d="M -27.5,-22.5 L -27.5,15 A 16.25,8.75 0 0,0 5,15 L 5,-22.5 Z" fill="${fg}" fill-opacity="0.4"/>` +
            `<ellipse cx="-11.25" cy="-22.5" rx="16.25" ry="8.75" fill="${fg}"/>`,
        symmetry: 1,
    },
    "flowers-box-medium-light": {
        id: "flowers-box-medium-light",
        label: "Box medium light",
        primary: (fg) =>
            `<path d="M -27.5,-22.5 L -27.5,15 A 16.25,8.75 0 0,0 -10,23.72 L -10,-22.5 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M -10,-22.5 L -10,23.72 A 16.25,8.75 0 0,0 5,15 L 5,-22.5 Z" fill="${fg}" fill-opacity="0.6"/>` +
            `<path d="M -11.25,-30 L 5,-22.5 L -11.25,-15 L -27.5,-22.5 Z" fill="${fg}"/>`,
        symmetry: 1,
    },
    "flowers-cylinder-short-dark": {
        id: "flowers-cylinder-short-dark",
        label: "Cylinder short dark",
        primary: (fg) =>
            `<path d="M -27.5,-5 L -27.5,15 A 16.25,8.75 0 0,0 5,15 L 5,-5 Z" fill="${fg}" fill-opacity="0.4"/>` +
            `<ellipse cx="-11.25" cy="-5" rx="16.25" ry="8.75" fill="${fg}"/>`,
        symmetry: 1,
    },
    "flowers-box-short-light": {
        id: "flowers-box-short-light",
        label: "Box short light",
        primary: (fg) =>
            `<path d="M -27.5,-5 L -27.5,15 A 16.25,8.75 0 0,0 -10,23.72 L -10,-5 Z" fill="${fg}" fill-opacity="0.2"/>` +
            `<path d="M -10,-5 L -10,23.72 A 16.25,8.75 0 0,0 5,15 L 5,-5 Z" fill="${fg}" fill-opacity="0.6"/>` +
            `<path d="M -11.25,-12.5 L 5,-5 L -11.25,2.5 L -27.5,-5 Z" fill="${fg}"/>`,
        symmetry: 1,
    },
    "flowers-eye-diamond-target": {
        id: "flowers-eye-diamond-target",
        label: "Eye diamond target",
        primary: (fg) =>
            `<path d="M 0,-48.33 L 28.33,-1.67 L 0,45 L -28.33,-1.67 Z" fill="${fg}" fill-opacity="0.3"/>` +
            `<ellipse cx="0" cy="-1.67" rx="21.67" ry="28.33" fill="${fg}" fill-opacity="0.45"/>` +
            `<rect x="-12.5" y="-14.17" width="25" height="25" rx="5.83" fill="${fg}"/>`,
    },
    "flowers-eye-horizontal-square": {
        id: "flowers-eye-horizontal-square",
        label: "Eye horizontal square",
        primary: (fg) =>
            `<ellipse cx="0" cy="-1.67" rx="46.67" ry="26.67" fill="${fg}" fill-opacity="0.3"/>` +
            `<rect x="-23.33" y="-25" width="18.33" height="18.33" rx="4.17" fill="${fg}"/>` +
            `<rect x="-23.33" y="3.33" width="18.33" height="18.33" rx="4.17" fill="${fg}"/>` +
            `<rect x="5" y="-25" width="18.33" height="18.33" rx="4.17" fill="${fg}"/>` +
            `<rect x="5" y="3.33" width="18.33" height="18.33" rx="4.17" fill="${fg}"/>`,
    },
    "flowers-eye-horizontal-cross": {
        id: "flowers-eye-horizontal-cross",
        label: "Eye horizontal cross",
        primary: (fg) =>
            `<path d="M -50,-1.67 A 65,65 0 0,1 50,-1.67 A 65,65 0 0,1 -50,-1.67 Z" fill="${fg}" fill-opacity="0.35"/>` +
            `<rect x="-19.17" y="-20.83" width="38.33" height="38.33" rx="13.33" fill="${fg}"/>`,
    },
    "flowers-eye-vertical-square": {
        id: "flowers-eye-vertical-square",
        label: "Eye vertical square",
        primary: (fg) =>
            `<ellipse cx="0" cy="-1.67" rx="25" ry="45" fill="${fg}" fill-opacity="0.3"/>` +
            `<rect x="-23.33" y="-25" width="18.33" height="18.33" rx="4.17" fill="${fg}"/>` +
            `<rect x="-23.33" y="3.33" width="18.33" height="18.33" rx="4.17" fill="${fg}"/>` +
            `<rect x="5" y="-25" width="18.33" height="18.33" rx="4.17" fill="${fg}"/>` +
            `<rect x="5" y="3.33" width="18.33" height="18.33" rx="4.17" fill="${fg}"/>`,
    },
    "flowers-eye-vertical-cross": {
        id: "flowers-eye-vertical-cross",
        label: "Eye vertical cross",
        primary: (fg) =>
            `<path d="M -1.67,-50 A 65,65 0 0,1 -1.67,50 A 65,65 0 0,1 -1.67,-50 Z" fill="${fg}" fill-opacity="0.3"/>` +
            `<rect x="-21.67" y="-20" width="40" height="40" rx="11.67" fill="${fg}"/>`,
    },
    "flowers-eye-target-square": {
        id: "flowers-eye-target-square",
        label: "Eye target square",
        primary: (fg) =>
            `<ellipse cx="0" cy="-1.67" rx="46.67" ry="28.33" fill="${fg}" fill-opacity="0.2"/>` +
            `<ellipse cx="0" cy="-1.67" rx="25.83" ry="21.67" fill="${fg}" fill-opacity="0.5"/>` +
            `<rect x="-10" y="-11.67" width="20" height="20" rx="5" fill="${fg}"/>`,
    },
    triangle: {
        id: "triangle",
        label: "Triangle",
        primary: (fg) => `<path d="M -50,-50 L 50,-50 L 50,50 Z" fill="${fg}"/>`,
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
        shapeIds: [
            "sector-circle",
            "sector-square",
            "sector-disc-square-corner",
            "sector-half-disc",
            "sector-half-disc-narrow",
            "sector-quarter-disc",
            "sector-double-half-disc",
            "sector-square-notch",
            "sector-square-round",
            "sector-square-round-corner",
        ],
    },
    {
        id: "pennant",
        label: "Pennant",
        shapeIds: [
            "pennant-triangle-circle",
            "pennant-triangle-dots",
            "pennant-checkerboard",
            "pennant-four-circles",
            "pennant-half-rect-circle",
            "pennant-nested-squares-dot",
            "pennant-triangle-tile",
        ],
    },
    {
        id: "orbit",
        label: "Orbit",
        shapeIds: [
            "orbit-circle-quarters",
            "orbit-arches-down",
            "orbit-arches-up",
            "orbit-petals-all-anti",
            "orbit-petals-all-main",
            "orbit-petals-dome-bottom",
            "orbit-dome-top-petals",
            "orbit-petals-left-anti",
            "orbit-triangles-ll",
            "orbit-triangles-lr",
            "orbit-triangles-ul",
            "orbit-triangles-ur",
        ],
    },
    {
        id: "classic",
        label: "Classic",
        shapeIds: [
            "classic-asterisk-4bar",
            "classic-circle",
            "classic-concentric-rings",
            "classic-diagonal-stripes",
            "classic-disc-two-tone",
            "classic-disc-two-tone-flipped",
            "classic-dot-grid-6x6",
            "classic-half-round-bottom-dot",
            "classic-petal-anti-diagonal",
            "classic-petal-main-diagonal",
            "classic-square",
            "classic-star-10-point",
            "classic-two-triangles",
        ],
    },
    {
        id: "mosaic",
        label: "Mosaic",
        shapeIds: [
            "mosaic-bowtie",
            "mosaic-bullseye-double-ring",
            "mosaic-comet-two-circles",
            "mosaic-dome-and-dot",
            "mosaic-dome-bottom-two-notches",
            "mosaic-dome-top-one-notch",
            "mosaic-dot-and-dome-bottom",
            "mosaic-dot-and-dome-left",
            "mosaic-dot-and-dome-right",
            "mosaic-dot-partial-ring",
            "pennant-four-circles",
            "mosaic-pacman",
            "mosaic-ring-thick",
            "mosaic-ring-thin",
            "mosaic-target-dot-ring",
        ],
    },
    {
        id: "abstract",
        label: "Abstract",
        shapeIds: [
            "abstract-bowtie",
            "abstract-chevrons",
            "triangle",
            "abstract-triangles-up-pair",
            "abstract-zigzag-a",
            "abstract-zigzag-b",
            "abstract-zigzag-c",
            "abstract-zigzag-d",
        ],
    },
    {
        id: "arrows",
        label: "Lens",
        shapeIds: [
            "arrows-double-lens-split",
            "classic-petal-anti-diagonal",
            "arrows-leaf-diagonal-a",
            "arrows-leaf-diagonal-b",
            "classic-petal-main-diagonal",
            "arrows-sparkle-large",
            "arrows-sparkle-small",
            "arrows-stacked-horizontal-lens",
        ],
    },
    {
        id: "flowers",
        label: "Vessel",
        shapeIds: [
            "flowers-cylinder-tall-dark",
            "flowers-box-tall-light",
            "flowers-cylinder-medium-dark",
            "flowers-box-medium-light",
            "flowers-cylinder-short-dark",
            "flowers-box-short-light",
            "flowers-eye-diamond-target",
            "flowers-eye-horizontal-square",
            "flowers-eye-horizontal-cross",
            "flowers-eye-vertical-square",
            "flowers-eye-vertical-cross",
            "flowers-eye-target-square",
        ],
    },
];

export const DEFAULT_ICON_SET_ID = "sector";

export function getIconSet(iconSetId: string): IconSet {
    return GEOMETRIC_ICON_SETS.find((s) => s.id === iconSetId) ?? GEOMETRIC_ICON_SETS[0];
}

export function getShapesForSet(iconSetId: string): IconShape[] {
    // Drops any shapeId that doesn't resolve to a real shape (e.g. a typo) instead of leaking
    // `undefined` into callers that assume every entry is a valid IconShape.
    return getIconSet(iconSetId)
        .shapeIds.map((id) => ICON_SHAPES[id])
        .filter((shape): shape is IconShape => shape !== undefined);
}
