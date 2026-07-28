import type { GuideContent } from "@/content/guides";
import { GUIDE_WRAP, GUIDE_SEC_HEAD } from "./guideLayout";

interface GuideWhyProps {
    why: NonNullable<GuideContent["why"]>;
}

/** Matches the mockup's four dot colors (lime, pop pink, white, accent teal), cycling by
 *  index rather than hard-coding per card — the sheet only supplies copy, not color. */
const DOT_COLORS = ["bg-guide-lime", "bg-guide-pop", "bg-white", "bg-guide-accent"];

export default function GuideWhy({ why }: GuideWhyProps) {
    return (
        <section className="bg-guide-ink py-20 text-guide-band-fg">
            <div className={GUIDE_WRAP}>
                <div className={GUIDE_SEC_HEAD}>
                    <h2>{why.heading}</h2>
                </div>
                <div className="mt-[52px] grid gap-5 lg:grid-cols-2">
                    {why.cards.map((card, i) => (
                        <div
                            key={card.id}
                            className="rounded-guide border border-guide-band-edge bg-guide-band px-[30px] py-8"
                        >
                            <span
                                aria-hidden
                                className={`mb-[22px] inline-block h-4 w-4 rounded-full ${DOT_COLORS[i % DOT_COLORS.length]}`}
                            />
                            <h3 className="text-guide-band-fg">{card.heading}</h3>
                            <p className="mt-2 text-guide-band-mute">{card.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
