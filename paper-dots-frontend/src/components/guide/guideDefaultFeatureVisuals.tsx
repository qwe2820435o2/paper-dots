import GuideFeaturePattern from "./GuideFeaturePattern";
import { buildSampleShapeIconDataUrl } from "@/lib/polkaDotSampleIcons";

/** Brand-consistent default for every feature slot's media across every guide page, not just
 *  polka-dot's own — same reasoning as GuideHeroStudio: DottyPic's dot pattern is the site's
 *  visual signature, so it reads fine as generic filler art under an unrelated tool's copy
 *  until that tool's sheet supplies a real `Feature Image`. Keyed by the sheet's Item ID,
 *  matching how `features[]` is indexed elsewhere. */
export const GUIDE_DEFAULT_FEATURE_VISUALS: Record<string, React.ReactNode> = {
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
    "3": (
        <GuideFeaturePattern
            config={{
                arrangement: "diagonal",
                dotSize: 22,
                spacing: 68,
                rotation: 0,
                skewX: 0,
                skewY: 0,
                zoom: 1,
                backgroundColor: "#e7e3d8",
                dotColor: "#2a3d1f",
                opacity: 100,
                iconUrl: null,
                iconAspect: 1,
            }}
            overlayTitle="Spacing"
            overlayItems={[{ label: "Tight" }, { label: "Even", active: true }, { label: "Loose" }]}
            overlayPosition="top-right"
        />
    ),
    "4": (
        <GuideFeaturePattern
            config={{
                arrangement: "square",
                dotSize: 20,
                spacing: 82,
                rotation: 0,
                skewX: 10,
                skewY: 0,
                zoom: 1,
                backgroundColor: "#ffffff",
                dotColor: "#ff5d8f",
                opacity: 100,
                iconUrl: buildSampleShapeIconDataUrl("star", "#ff5d8f"),
                iconAspect: 1,
            }}
            overlayTitle="Colors"
            overlayItems={[{ label: "Lime", active: true }, { label: "Sand" }, { label: "Peach" }, { label: "Ink" }]}
            overlayPosition="bottom-left"
        />
    ),
    "5": (
        <GuideFeaturePattern
            config={{
                arrangement: "diagonal",
                dotSize: 28,
                spacing: 70,
                rotation: -15,
                skewX: 0,
                skewY: 0,
                zoom: 1,
                backgroundColor: "#15200d",
                dotColor: "#c5e89a",
                opacity: 92,
                iconUrl: buildSampleShapeIconDataUrl("leaf", "#c5e89a"),
                iconAspect: 1,
            }}
            overlayTitle="Export"
            overlayItems={[{ label: "PNG", active: true }, { label: "JPEG" }, { label: "SVG" }]}
            overlayPosition="bottom-right"
        />
    ),
};
