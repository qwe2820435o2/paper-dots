import type { Metadata } from "next";
import { getGuideContent } from "@/content/guides";
import { getGuideRoute } from "@/content/guides/registry";
import { buildGuideMetadata, buildGuideJsonLd } from "@/lib/guideSeo";
import GuideTemplate from "@/components/guide/GuideTemplate";
import GuideHeroStudio from "@/components/guide/GuideHeroStudio";
import GuideFeaturePattern from "@/components/guide/GuideFeaturePattern";
import { buildSampleShapeIconDataUrl } from "@/lib/polkaDotSampleIcons";

const SLUG = "polka-dot" as const;
const content = getGuideContent(SLUG);
const route = getGuideRoute(SLUG);

export const metadata: Metadata = buildGuideMetadata(content, route);

const jsonLd = buildGuideJsonLd(content, route);

// TEMP-MOCK: stand-ins for `Feature Image` cells the sheet hasn't filled in yet, matching the
// mockup's f1/f2 presets 1:1 so the layout can be checked now — features 3-5 fall back to the
// normal placeholder until images (real or mocked) exist for them too. Once the sheet supplies
// a real image for a given feature id, drop that entry here; GuideFeatureBlock prefers it
// automatically.
const FEATURE_VISUALS = {
    "1": (
        <GuideFeaturePattern
            config={{
                arrangement: "square",
                dotSize: 26,
                spacing: 78,
                rotation: 0,
                skewX: 0,
                skewY: 0,
                zoom: 1,
                backgroundColor: "#c5e89a",
                dotColor: "#15200d",
                opacity: 100,
                iconUrl: null,
                iconAspect: 1,
            }}
            overlayTitle="Presets"
            overlayItems={[{ label: "Classic", active: true }, { label: "Dense" }, { label: "Airy" }]}
            overlayPosition="bottom-left"
        />
    ),
    "2": (
        <GuideFeaturePattern
            config={{
                arrangement: "square",
                dotSize: 30,
                spacing: 74,
                rotation: -8,
                skewX: 0,
                skewY: 0,
                zoom: 1,
                backgroundColor: "#ffd9c2",
                dotColor: "#ff5d8f",
                opacity: 100,
                iconUrl: buildSampleShapeIconDataUrl("heart", "#ff5d8f"),
                iconAspect: 1,
            }}
            overlayTitle="Repeating unit"
            overlayItems={[{ label: "●" }, { label: "★" }, { label: "♥", active: true }, { label: "🍋" }, { label: "Aa" }]}
            overlayPosition="bottom-right"
        />
    ),
};

export default function PolkaDotGuidePage() {
    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <GuideTemplate
                content={content}
                appPath={route.appPath}
                heroVisual={<GuideHeroStudio />}
                featureVisuals={FEATURE_VISUALS}
            />
        </>
    );
}
