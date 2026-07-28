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
                <div className="rounded-[36px] border-[1.5px] border-[#b0d986] bg-guide-lime px-10 py-[78px] text-center shadow-guide-lg">
                    <h2 className="mb-3.5 text-[clamp(34px,3.2vw,46px)]">{finalCta.heading}</h2>
                    <p className="mx-auto max-w-[520px] text-lg text-[#2c3a20]">{finalCta.body}</p>
                    <div className="mt-8">
                        <GuideCtaButton href={ctaHref} trackId="final-cta" className="guide-btn-invert">
                            {finalCta.cta.text}
                        </GuideCtaButton>
                    </div>
                </div>
            </div>
        </section>
    );
}
