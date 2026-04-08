export interface Paper {
    id: string;
    label: string;
    /** Path under /public, served as the background fill. */
    src: string;
    /** Representative hex color of the paper, used when dot color is auto. */
    color: string;
    /** Optional thumbnail; falls back to src. */
    thumb?: string;
}

/**
 * Background papers shown in the picker. The actual image files live in
 * /public/papers and are added in phase F. The "plain" entry is rendered as
 * a flat fill so the editor still works before any assets are present.
 */
export const PAPERS: Paper[] = [
    { id: "plain", label: "Plain", src: "", color: "#fafafa" },
    { id: "kraft", label: "Kraft", src: "/papers/kraft.svg", color: "#e8d9b8" },
    { id: "grid", label: "Grid", src: "/papers/grid.svg", color: "#fafafa" },
    { id: "dots", label: "Dot Grid", src: "/papers/dots.svg", color: "#fafafa" },
    { id: "noise", label: "Noise", src: "/papers/noise.svg", color: "#fafafa" },
    { id: "lined", label: "Lined", src: "/papers/lined.svg", color: "#fafafa" },
];

export function getPaper(id: string): Paper {
    return PAPERS.find((p) => p.id === id) ?? PAPERS[0];
}
