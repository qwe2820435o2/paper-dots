import { getTranslations } from "next-intl/server";
import { GUIDE_WRAP } from "@/components/guide/guideLayout";
import { HOME_H2_STYLE } from "./homeLayout";
import { cn } from "@/lib/utils";
import Reveal from "./Reveal";

/** Only the swatch styling stays here — the heading and body live under
 *  `home.why.cards.<id>` so all three locales share one card order. */
const WHY_CARDS: Array<{ id: string; dotClassName: string }> = [
    { id: "free", dotClassName: "bg-guide-lime border-guide-edge-strong" },
    { id: "noWatermark", dotClassName: "bg-guide-pop border-[#e0447a]" },
    { id: "unlimited", dotClassName: "bg-guide-ink border-guide-ink" },
    { id: "noAccount", dotClassName: "bg-white border-guide-edge-strong" },
];

export default async function HomeWhy() {
    const t = await getTranslations("home.why");

    return (
        <section id="why" className="py-24">
            <div className={GUIDE_WRAP}>
                <Reveal>
                    <h2 style={HOME_H2_STYLE}>{t("heading")}</h2>
                </Reveal>

                <div className="mt-[52px] grid gap-5 lg:grid-cols-2">
                    {WHY_CARDS.map((card) => (
                        <Reveal key={card.id}>
                            <div className="h-full rounded-guide border-[1.5px] border-guide-edge bg-white px-[30px] py-8 transition-all hover:-translate-y-[3px] hover:border-guide-edge-strong">
                                <span
                                    aria-hidden
                                    className={cn("mb-[22px] inline-block h-[15px] w-[15px] rounded-full border-[1.5px]", card.dotClassName)}
                                />
                                <h3 style={{ letterSpacing: "-.015em", lineHeight: 1.25 }}>
                                    {t(`cards.${card.id}.heading`)}
                                </h3>
                                <p className="mt-3 text-[15.5px] text-guide-ink-2">
                                    {t(`cards.${card.id}.body`)}
                                </p>
                            </div>
                        </Reveal>
                    ))}
                </div>
            </div>
        </section>
    );
}
