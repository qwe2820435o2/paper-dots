export interface Paper {
    id: string;
    label: string;
    /** Path under /public, served as the background fill. */
    src: string;
    /** Optional thumbnail; falls back to src. */
    thumb?: string;
}

/**
 * Background papers shown in the picker. The actual image files live in
 * /public/papers and are added in phase F. The "plain" entry is rendered as
 * a flat fill so the editor still works before any assets are present.
 */
export const PAPERS: Paper[] = [
    { id: "plain", label: "Plain", src: "" },
    { id: "kraft", label: "Kraft", src: "/papers/kraft.svg" },
    { id: "grid", label: "Grid", src: "/papers/grid.svg" },
    { id: "dots", label: "Dot Grid", src: "/papers/dots.svg" },
    { id: "noise", label: "Noise", src: "/papers/noise.svg" },
    { id: "lined", label: "Lined", src: "/papers/lined.svg" },
];

export function getPaper(id: string): Paper {
    return PAPERS.find((p) => p.id === id) ?? PAPERS[0];
}
