import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { GUIDE_WRAP, GUIDE_SEC_HEAD } from "@/components/guide/guideLayout";
import { HOME_H2_STYLE } from "./homeLayout";
import HomeToolThumb, { type ToolThumbConfig } from "./HomeToolThumb";

interface ToolCard {
    id: string;
    label: string;
    description: string;
    href: string;
    thumb: ToolThumbConfig;
}

const TOOL_CARDS: ToolCard[] = [
    {
        id: "quote",
        label: "Photo Quote Maker",
        description: "Your words get their own color block instead of sitting on top of the photo.",
        href: "/photo-quote-maker",
        thumb: { kind: "quote", photo: "#e8967a", block: "#3c2a24", text: "#ffe4d2" },
    },
    {
        id: "overlay",
        label: "Photo Overlay Editor",
        description: "Scatter snowflakes, hearts, or stars across your photo, colored to match it.",
        href: "/photo-overlay-editor",
        thumb: { kind: "pattern", shape: "heart", size: 15, gap: 38, tilt: -6, bg: "#f0b79a", dot: "#c25a3e", opacity: 0.9 },
    },
    {
        id: "dots",
        label: "Polka Dot Generator",
        description: "Polka dot backgrounds in any size, spacing, and color. The one that started all this.",
        href: "/polka-dot",
        thumb: { kind: "pattern", shape: "circle", size: 16, gap: 44, tilt: 0, bg: "#c5e89a", dot: "#15200d" },
    },
    {
        id: "geo",
        label: "Geometric Pattern Generator",
        description: "Waves, grids, triangles, terrazzo. Backgrounds for posts, slides, or wallpapers.",
        href: "/geometric-pattern-generator",
        thumb: { kind: "pattern", shape: "tri", size: 20, gap: 40, tilt: 0, bg: "#ffd9c2", dot: "#e8967a", opacity: 0.85 },
    },
];

export default function HomeToolGrid() {
    return (
        <section id="tools" className="border-y border-guide-edge bg-guide-lime-3 py-24">
            <div className={GUIDE_WRAP}>
                <div className={GUIDE_SEC_HEAD}>
                    <h2 style={HOME_H2_STYLE}>Meet the free online aesthetic photo edit tools</h2>
                    <p className="mt-4 text-lg text-guide-ink-2">
                        Each tool does one thing and takes about a minute to work out. Simple enough if
                        you have never edited a photo, quick enough that designers use them to skip
                        opening anything heavier.
                    </p>
                </div>

                <div className="mt-[52px] grid grid-cols-1 gap-[22px] lg:grid-cols-3">
                    {TOOL_CARDS.map((tool) => (
                        <Link
                            key={tool.id}
                            href={tool.href}
                            className="group flex flex-col overflow-hidden rounded-guide border-[1.5px] border-guide-edge bg-white transition-all hover:-translate-y-1 hover:border-guide-edge-strong hover:shadow-guide"
                        >
                            <span className="relative block h-[200px] overflow-hidden border-b-[1.5px] border-guide-edge">
                                <HomeToolThumb id={tool.id} config={tool.thumb} />
                            </span>
                            <span className="flex flex-1 flex-col pb-6 pl-6 pr-6 pt-[22px]">
                                <span className="guide-display text-xl font-bold leading-[1.2] tracking-[-0.02em] text-guide-ink">
                                    {tool.label}
                                </span>
                                <span className="mb-[18px] mt-[9px] flex-1 text-[15px] leading-[1.5] text-guide-ink-2">
                                    {tool.description}
                                </span>
                                <span className="guide-display inline-flex items-center gap-[7px] font-bold text-guide-ink">
                                    Try it now
                                    <ArrowRight
                                        size={16}
                                        strokeWidth={2}
                                        className="transition-transform group-hover:translate-x-[3px]"
                                    />
                                </span>
                            </span>
                        </Link>
                    ))}

                    <div className="flex flex-col items-stretch gap-0 rounded-guide border-[1.5px] border-dashed border-guide-edge-strong bg-guide-lime-3 lg:col-span-2 lg:flex-row lg:items-center">
                        <span className="grid h-[200px] place-items-center text-guide-edge-strong lg:h-auto lg:w-[200px] lg:self-stretch lg:border-r-[1.5px] lg:border-dashed lg:border-guide-edge-strong">
                            <Plus size={38} strokeWidth={1.8} />
                        </span>
                        <span className="flex flex-1 flex-col justify-center pb-6 pl-6 pr-6 pt-[22px]">
                            <span className="guide-display text-xl font-bold leading-[1.2] tracking-[-0.02em] text-guide-ink">
                                More on the way
                            </span>
                            <span className="mt-[9px] text-[15px] leading-[1.5] text-guide-ink-2">
                                New tools land here as we build them. Same free, no watermark, no sign up.
                            </span>
                        </span>
                    </div>
                </div>
            </div>
        </section>
    );
}
