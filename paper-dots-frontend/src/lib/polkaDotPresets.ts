import type { Arrangement } from "@/lib/polkaDotGrid";

export interface PolkaDotPreset {
    id: string;
    label: string;
    arrangement: Arrangement;
    dotSize: number;
    spacing: number;
    rotation: number;
    skewX: number;
    skewY: number;
    zoom: number;
}

export const POLKA_DOT_PRESETS: PolkaDotPreset[] = [
    {
        id: "classic",
        label: "Classic",
        arrangement: "square",
        dotSize: 14,
        spacing: 36,
        rotation: 0,
        skewX: 0,
        skewY: 0,
        zoom: 1,
    },
    {
        id: "checker",
        label: "Checker",
        arrangement: "diagonal",
        dotSize: 14,
        spacing: 40,
        rotation: 0,
        skewX: 0,
        skewY: 0,
        zoom: 1,
    },
    {
        id: "diamond",
        label: "Diamond",
        arrangement: "square",
        dotSize: 12,
        spacing: 34,
        rotation: 45,
        skewX: 0,
        skewY: 0,
        zoom: 1,
    },
    {
        id: "tilted",
        label: "Tilted",
        arrangement: "diagonal",
        dotSize: 10,
        spacing: 30,
        rotation: 20,
        skewX: 15,
        skewY: 0,
        zoom: 1,
    },
    {
        id: "big-dots",
        label: "Big Dots",
        arrangement: "square",
        dotSize: 26,
        spacing: 44,
        rotation: 0,
        skewX: 0,
        skewY: 0,
        zoom: 1,
    },
    {
        id: "confetti",
        label: "Confetti",
        arrangement: "diagonal",
        dotSize: 10,
        spacing: 26,
        rotation: -15,
        skewX: -20,
        skewY: 10,
        zoom: 1.2,
    },
];

export interface PolkaDotPalette {
    id: string;
    label: string;
    dotColor: string;
    backgroundColor: string;
}

export const POLKA_DOT_PALETTES: PolkaDotPalette[] = [
    { id: "classic", label: "Classic", dotColor: "#1a1a2e", backgroundColor: "#F8FCF2" },
    { id: "morandi", label: "Morandi", dotColor: "#7d6b64", backgroundColor: "#f0e6df" },
    { id: "ocean", label: "Ocean", dotColor: "#1d4e6b", backgroundColor: "#dff0f7" },
    { id: "sunset", label: "Sunset", dotColor: "#b23a48", backgroundColor: "#fdece0" },
    { id: "forest", label: "Forest", dotColor: "#2f4d3a", backgroundColor: "#e6f0e2" },
    { id: "mono", label: "Mono", dotColor: "#ffffff", backgroundColor: "#1a1a2e" },
];
