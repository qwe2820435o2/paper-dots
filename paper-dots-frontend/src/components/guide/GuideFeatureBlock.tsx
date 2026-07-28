import type { GuideFeature } from "@/content/guides";
import { GUIDE_WRAP, GUIDE_FEATURE_SHOT_ASPECT } from "./guideLayout";
import RichText from "./RichText";
import GuideMedia from "./GuideMedia";
import { cn } from "@/lib/utils";

interface GuideFeatureBlockProps {
    feature: GuideFeature;
    /** Alternates media/copy sides, matching blocks 2 and 4 in the mockup. */
    flip: boolean;
    /** Overrides the sheet-image/placeholder media below — see GuideFeaturePattern, opted
     *  into per feature id via GuideTemplate's `featureVisuals` map. Once the sheet supplies
     *  a real `Feature Image` for that id, remove the override and `feature.image` takes
     *  over automatically. */
    visual?: React.ReactNode;
}

/** The mockup's decorative overlay card on top of each feature image is otherwise dropped —
 *  it was hand-authored per feature and has no corresponding sheet field — unless a page
 *  passes one in via `visual`. */
export default function GuideFeatureBlock({ feature, flip, visual }: GuideFeatureBlockProps) {
    return (
        <div className={GUIDE_WRAP}>
            <div className={cn("grid items-center gap-16 lg:grid-cols-2", flip && "lg:[&>*:first-child]:order-2")}>
                <div>
                    <RichText as="h2" html={feature.heading} />
                    <RichText as="p" html={feature.body} className="mt-4 text-guide-ink-2" />
                </div>
                {visual ?? <GuideMedia image={feature.image} aspect={GUIDE_FEATURE_SHOT_ASPECT} />}
            </div>
        </div>
    );
}
