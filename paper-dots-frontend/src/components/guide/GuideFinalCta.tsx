import type { GuideContent } from "@/content/guides";
import { GUIDE_WRAP } from "./guideLayout";
import GuideCtaButton from "./GuideCtaButton";

interface GuideFinalCtaProps {
    finalCta: NonNullable<GuideContent["finalCta"]>;
    appPath: string;
}

export default function GuideFinalCta({ finalCta, appPath }: GuideFinalCtaProps) {
    const ctaHref = finalCta.cta.href ?? appPath;

    return (
        <section className="py-4 pb-20">
            <div className={GUIDE_WRAP}>
                <div className="rounded-guide bg-guide-lime-2 px-8 py-16 text-center">
                    <h2>{finalCta.heading}</h2>
                    <p className="mx-auto mt-4 max-w-xl text-guide-ink-2">{finalCta.body}</p>
                    <div className="mt-8">
                        <GuideCtaButton href={ctaHref} trackId="final-cta">
                            {finalCta.cta.text}
                        </GuideCtaButton>
                    </div>
                </div>
            </div>
        </section>
    );
}
