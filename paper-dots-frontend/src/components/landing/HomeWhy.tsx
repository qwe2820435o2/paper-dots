import { GUIDE_WRAP } from "@/components/guide/guideLayout";
import { HOME_H2_STYLE } from "./homeLayout";
import { cn } from "@/lib/utils";

interface WhyCard {
    id: string;
    heading: string;
    body: string;
    dotClassName: string;
}

const WHY_CARDS: WhyCard[] = [
    {
        id: "free",
        heading: "Free, and not the kind that runs out",
        body: "Every tool, every shape, and every export size is free right now and will stay that way. There is no premium tier keeping the better options out of reach, no credits to buy, and no fourteen day clock quietly counting down while you work. What you can make today is what you will still be able to make next month.",
        dotClassName: "bg-guide-lime border-guide-edge-strong",
    },
    {
        id: "no-watermark",
        heading: "Nothing stamped on your work, ever",
        body: "No logo in the corner, no faint diagonal text across the middle, and nothing baked into the file that announces which tool you used. You will never reach the download button and find out that removing a mark costs money. The image you export is the image you made, and it is yours to post anywhere you like.",
        dotClassName: "bg-guide-pop border-[#e0447a]",
    },
    {
        id: "unlimited",
        heading: "Make as many as you want",
        body: "No daily cap, no export counter ticking down in the corner, and no queue when the site is busy. Try ten versions of the same photo and keep the one you like. Nothing here is metered, so there is no reason to be careful about how much you use it.",
        dotClassName: "bg-guide-ink border-guide-ink",
    },
    {
        id: "no-account",
        heading: "No account, no email, no waiting",
        body: "There is no sign up screen standing between you and the tools. No password to invent, no verification link to dig out of your spam folder, and no newsletter box already ticked on your behalf. Open a page and it is working. If you want to make one image and never come back, that is completely fine.",
        dotClassName: "bg-white border-guide-edge-strong",
    },
];

export default function HomeWhy() {
    return (
        <section id="why" className="py-24">
            <div className={GUIDE_WRAP}>
                <h2 style={HOME_H2_STYLE}>Why choose DottyPic?</h2>

                <div className="mt-[52px] grid gap-5 lg:grid-cols-2">
                    {WHY_CARDS.map((card) => (
                        <div
                            key={card.id}
                            className="rounded-guide border-[1.5px] border-guide-edge bg-white px-[30px] py-8 transition-all hover:-translate-y-[3px] hover:border-guide-edge-strong"
                        >
                            <span
                                aria-hidden
                                className={cn("mb-[22px] inline-block h-[15px] w-[15px] rounded-full border-[1.5px]", card.dotClassName)}
                            />
                            <h3 style={{ letterSpacing: "-.015em", lineHeight: 1.25 }}>{card.heading}</h3>
                            <p className="mt-3 text-[15.5px] text-guide-ink-2">{card.body}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
