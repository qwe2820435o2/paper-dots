import type { GuideFeature } from "@/content/guides";
import { GUIDE_WRAP, GUIDE_FEATURE_SHOT_ASPECT } from "./guideLayout";
import { GUIDE_DEFAULT_FEATURE_VISUALS } from "./guideDefaultFeatureVisuals";
import RichText from "./RichText";
import GuideMedia from "./GuideMedia";
import GuideCtaButton from "./GuideCtaButton";
import { cn } from "@/lib/utils";

interface GuideFeatureBlockProps {
    feature: GuideFeature;
    /** Alternates media/copy sides, matching blocks 2 and 4 in the mockup. */
    flip: boolean;
    /** Editor route this guide leads into — used when the sheet's Feature Button left its
     *  link cell empty (there's no per-feature link column at all, only text). */
    appPath: string;
}

/** A real sheet image takes priority; otherwise every feature id falls back to the shared
 *  GUIDE_DEFAULT_FEATURE_VISUALS dot-pattern mocks (same on every guide page, not just
 *  polka-dot's own). An id with no matching preset falls back further to
 *  GuideMediaPlaceholder. The mockup's decorative overlay card is otherwise dropped entirely:
 *  it was hand-authored per feature and has no corresponding sheet field. */
export default function GuideFeatureBlock({ feature, flip, appPath }: GuideFeatureBlockProps) {
    const media = feature.image ? (
        <GuideMedia image={feature.image} aspect={GUIDE_FEATURE_SHOT_ASPECT} />
    ) : (
        GUIDE_DEFAULT_FEATURE_VISUALS[feature.id] ?? <GuideMedia image={null} aspect={GUIDE_FEATURE_SHOT_ASPECT} />
    );

    return (
        <div className={GUIDE_WRAP}>
            <div className={cn("grid items-center gap-16 lg:grid-cols-2", flip && "lg:[&>*:first-child]:order-2")}>
                <div>
                    <RichText as="h2" html={feature.heading} />
                    <RichText as="p" html={feature.body} className="mt-4 text-guide-ink-2" />
                    {feature.cta && (
                        <div className="mt-6">
                            <GuideCtaButton href={feature.cta.href ?? appPath} trackId={`feature-${feature.id}`}>
                                {feature.cta.text}
                            </GuideCtaButton>
                        </div>
                    )}
                </div>
                {media}
            </div>
        </div>
    );
}
