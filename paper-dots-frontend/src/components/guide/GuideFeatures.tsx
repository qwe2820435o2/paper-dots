import type { GuideFeature } from "@/content/guides";
import GuideFeatureBlock from "./GuideFeatureBlock";

interface GuideFeaturesProps {
    features: GuideFeature[];
    /** Per-feature media overrides keyed by the sheet's Item ID — see GuideFeatureBlock. */
    visuals?: Record<string, React.ReactNode>;
}

export default function GuideFeatures({ features, visuals }: GuideFeaturesProps) {
    return (
        <section className="space-y-20 py-20">
            {features.map((feature, i) => (
                <GuideFeatureBlock
                    key={feature.id}
                    feature={feature}
                    flip={i % 2 === 1}
                    visual={visuals?.[feature.id]}
                />
            ))}
        </section>
    );
}
