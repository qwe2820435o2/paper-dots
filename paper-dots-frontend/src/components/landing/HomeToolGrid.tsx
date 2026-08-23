import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Plus } from "lucide-react";
import { GUIDE_WRAP, GUIDE_SEC_HEAD } from "@/components/guide/guideLayout";
import { HOME_H2_STYLE } from "./homeLayout";
import HomeToolThumb, { type ToolThumbConfig } from "./HomeToolThumb";
import Reveal from "./Reveal";

interface ToolCard {
    /** Feeds the thumbnail's internal SVG element ids — kept short and locale-invariant. */
    id: string;
    /** Key under the `tools` namespace; the card name is shared with the header and footer so
     *  a tool is never called two different things in the same locale. */
    toolKey: string;
    href: string;
    thumb: ToolThumbConfig;
}

const TOOL_CARDS: ToolCard[] = [
    {
        id: "quote",
        toolKey: "momentCard",
        href: "/photo-quote-maker",
        thumb: { kind: "quote", photo: "#e8967a", block: "#3c2a24", text: "#ffe4d2" },
    },
    {
        id: "overlay",
        toolKey: "dot",
        href: "/photo-overlay-editor",
        thumb: { kind: "pattern", shape: "heart", size: 15, gap: 38, tilt: -6, bg: "#f0b79a", dot: "#c25a3e", opacity: 0.9 },
    },
    {
        id: "dots",
        toolKey: "polkaDot",
        href: "/polka-dot",
        thumb: { kind: "pattern", shape: "circle", size: 16, gap: 44, tilt: 0, bg: "#c5e89a", dot: "#15200d" },
    },
    {
        id: "geo",
        toolKey: "geometricPatterns",
        href: "/geometric-pattern-generator",
        thumb: { kind: "pattern", shape: "tri", size: 20, gap: 40, tilt: 0, bg: "#ffd9c2", dot: "#e8967a", opacity: 0.85 },
    },
];

export default async function HomeToolGrid() {
    const t = await getTranslations("home.toolGrid");
    const tTools = await getTranslations("tools");

    return (
        <section id="tools" className="border-y border-guide-edge bg-guide-lime-3 py-24">
            <div className={GUIDE_WRAP}>
                <Reveal className={GUIDE_SEC_HEAD}>
                    <h2 style={HOME_H2_STYLE}>{t("heading")}</h2>
                    <p className="mt-4 text-lg text-guide-ink-2">{t("lead")}</p>
                </Reveal>

                <div className="mt-[52px] grid grid-cols-1 gap-[22px] lg:grid-cols-3">
                    {TOOL_CARDS.map((tool) => (
                        <Reveal key={tool.id}>
                            <Link
                                href={tool.href}
                                className="group flex h-full flex-col overflow-hidden rounded-guide border-[1.5px] border-guide-edge bg-white transition-all hover:-translate-y-1 hover:border-guide-edge-strong hover:shadow-guide"
                            >
                                <span className="relative block h-[200px] overflow-hidden border-b-[1.5px] border-guide-edge">
                                    <HomeToolThumb id={tool.id} config={tool.thumb} />
                                </span>
                                <span className="flex flex-1 flex-col pb-6 pl-6 pr-6 pt-[22px]">
                                    <span className="guide-display text-xl font-bold leading-[1.2] tracking-[-0.02em] text-guide-ink">
                                        {tTools(`${tool.toolKey}.label`)}
                                    </span>
                                    <span className="mb-[18px] mt-[9px] flex-1 text-[15px] leading-[1.5] text-guide-ink-2">
                                        {t(`cards.${tool.toolKey}`)}
                                    </span>
                                    <span className="guide-display inline-flex items-center gap-[7px] font-bold text-guide-ink">
                                        {t("tryItNow")}
                                        <ArrowRight
                                            size={16}
                                            strokeWidth={2}
                                            className="transition-transform group-hover:translate-x-[3px]"
                                        />
                                    </span>
                                </span>
                            </Link>
                        </Reveal>
                    ))}

                    <Reveal className="lg:col-span-2">
                        <div className="flex h-full flex-col items-stretch gap-0 rounded-guide border-[1.5px] border-dashed border-guide-edge-strong bg-guide-lime-3 lg:flex-row lg:items-center">
                            <span className="grid h-[200px] place-items-center text-guide-edge-strong lg:h-auto lg:w-[200px] lg:self-stretch lg:border-r-[1.5px] lg:border-dashed lg:border-guide-edge-strong">
                                <Plus size={38} strokeWidth={1.8} />
                            </span>
                            <span className="flex flex-1 flex-col justify-center pb-6 pl-6 pr-6 pt-[22px]">
                                <span className="guide-display text-xl font-bold leading-[1.2] tracking-[-0.02em] text-guide-ink">
                                    {t("more.heading")}
                                </span>
                                <span className="mt-[9px] text-[15px] leading-[1.5] text-guide-ink-2">
                                    {t("more.body")}
                                </span>
                            </span>
                        </div>
                    </Reveal>
                </div>
            </div>
        </section>
    );
}
