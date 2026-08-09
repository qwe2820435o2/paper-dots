import type { GuideFeature } from "@/content/guides";
import { GUIDE_WRAP, GUIDE_FEATURE_SHOT_ASPECT } from "./guideLayout";
import { GUIDE_DEFAULT_FEATURE_VISUALS } from "./guideDefaultFeatureVisuals";
import RichText from "./RichText";
import GuideMedia from "./GuideMedia";
import { cn } from "@/lib/utils";

interface GuideFeatureBlockProps {
    feature: GuideFeature;
    /** Alternates media/copy sides, matching blocks 2 and 4 in the mockup. */
    flip: boolean;
}

/** A real sheet image takes priority; otherwise every feature id falls back to the shared
 *  GUIDE_DEFAULT_FEATURE_VISUALS dot-pattern mocks (same on every guide page, not just
 *  polka-dot's own). An id with no matching preset falls back further to
 *  GuideMediaPlaceholder. The mockup's decorative overlay card is otherwise dropped entirely:
 *  it was hand-authored per feature and has no corresponding sheet field. A real image uses
 *  its own native pixel ratio rather than the shared GUIDE_FEATURE_SHOT_ASPECT (which stays
 *  reserved for the mocks/placeholder), so object-cover never has to crop it. */
export default function GuideFeatureBlock({ feature, flip }: GuideFeatureBlockProps) {
    const media = feature.image ? (
        <GuideMedia image={feature.image} aspect="aspect-[1794/1260]" className="shadow-none" />
    ) : (
        GUIDE_DEFAULT_FEATURE_VISUALS[feature.id] ?? <GuideMedia image={null} aspect={GUIDE_FEATURE_SHOT_ASPECT} />
    );

    return (
        <div className={GUIDE_WRAP}>
            <div className={cn("grid items-center gap-16 lg:grid-cols-2", flip && "lg:[&>*:first-child]:order-2")}>
                <div>
                    <RichText as="h2" html={feature.heading} />
                    <RichText as="p" html={feature.body} className="mt-4 text-guide-ink-2" />
                </div>
                {media}
            </div>
        </div>
    );
}
