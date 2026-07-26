import type { GuideContent } from "@/content/guides";
import { GUIDE_WRAP } from "./guideLayout";

interface GuideHowToProps {
    howTo: NonNullable<GuideContent["howTo"]>;
}

/** Step numbers come from array position, not sheet data — the sheet's Item ID only decides
 *  ordering (see docs/guide-pages.md §4), the visible "1/2/3" badge is rendered here. */
export default function GuideHowTo({ howTo }: GuideHowToProps) {
    return (
        <section className="bg-guide-lime-3 py-20">
            <div className={GUIDE_WRAP}>
                <h2 className="text-center">{howTo.heading}</h2>
                <ol className="mt-12 grid gap-8 lg:grid-cols-3">
                    {howTo.steps.map((step, i) => (
                        <li key={step.id} className="rounded-guide bg-guide-card p-8 shadow-guide">
                            <div className="guide-mono flex h-9 w-9 items-center justify-center rounded-full bg-guide-lime text-sm font-bold text-guide-ink">
                                {i + 1}
                            </div>
                            <h3 className="mt-4">{step.heading}</h3>
                            <p className="mt-2 text-guide-ink-2">{step.body}</p>
                        </li>
                    ))}
                </ol>
            </div>
        </section>
    );
}
