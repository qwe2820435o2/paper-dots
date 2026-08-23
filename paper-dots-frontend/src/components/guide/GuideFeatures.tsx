import type { GuideFeature } from "@/content/guides";
import GuideFeatureBlock from "./GuideFeatureBlock";

export default function GuideFeatures({ features, appPath }: { features: GuideFeature[]; appPath: string }) {
    return (
        <section className="space-y-20 py-20">
            {features.map((feature, i) => (
                <GuideFeatureBlock key={feature.id} feature={feature} flip={i % 2 === 1} appPath={appPath} />
            ))}
        </section>
    );
}
