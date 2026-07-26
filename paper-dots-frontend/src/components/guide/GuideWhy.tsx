import type { GuideContent } from "@/content/guides";
import { GUIDE_WRAP } from "./guideLayout";

interface GuideWhyProps {
    why: NonNullable<GuideContent["why"]>;
}

/** Matches the mockup's four dot colors (lime, pop pink, white, accent teal), cycling by
 *  index rather than hard-coding per card — the sheet only supplies copy, not color. */
const DOT_COLORS = ["bg-guide-lime", "bg-guide-pop", "bg-white", "bg-guide-accent"];

export default function GuideWhy({ why }: GuideWhyProps) {
    return (
        <section className="bg-guide-band py-20 text-guide-band-fg">
            <div className={GUIDE_WRAP}>
                <h2>{why.heading}</h2>
                <div className="mt-12 grid gap-6 lg:grid-cols-2">
                    {why.cards.map((card, i) => (
                        <div
                            key={card.id}
                            className="rounded-guide border border-guide-band-edge p-8"
                        >
                            <span
                                aria-hidden
                                className={`inline-block h-3 w-3 rounded-full ${DOT_COLORS[i % DOT_COLORS.length]}`}
                            />
                            <h3 className="mt-4 text-guide-band-fg">{card.heading}</h3>
                            <p className="mt-2 text-guide-band-mute">{card.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
