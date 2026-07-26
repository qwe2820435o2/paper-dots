import type { GuideFeature } from "@/content/guides";
import { GUIDE_WRAP } from "./guideLayout";
import RichText from "./RichText";
import GuideMedia from "./GuideMedia";
import { cn } from "@/lib/utils";

interface GuideFeatureBlockProps {
    feature: GuideFeature;
    /** Alternates media/copy sides, matching blocks 2 and 4 in the mockup. */
    flip: boolean;
}

/** The mockup's decorative overlay card on top of each feature image is intentionally
 *  dropped — it was hand-authored per feature and has no corresponding sheet field. */
export default function GuideFeatureBlock({ feature, flip }: GuideFeatureBlockProps) {
    return (
        <div className={GUIDE_WRAP}>
            <div className={cn("grid items-center gap-10 lg:grid-cols-2", flip && "lg:[&>*:first-child]:order-2")}>
                <div>
                    <RichText as="h2" html={feature.heading} />
                    <RichText as="p" html={feature.body} className="mt-4 text-guide-ink-2" />
                </div>
                <GuideMedia image={feature.image} aspect="aspect-[4/3]" />
            </div>
        </div>
    );
}
