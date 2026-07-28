import { buildPolkaDotSvgString, type PolkaDotConfig } from "@/lib/polkaDotGrid";
import { cn } from "@/lib/utils";
import { GUIDE_FEATURE_SHOT_ASPECT } from "./guideLayout";

interface OverlayItem {
    label: string;
    active?: boolean;
}

interface GuideFeaturePatternProps {
    config: PolkaDotConfig;
    overlayTitle: string;
    overlayItems: OverlayItem[];
    overlayPosition?: "bottom-left" | "bottom-right" | "top-right";
}

const PATTERN_SIZE = 640;

const POSITION_CLASSES: Record<NonNullable<GuideFeaturePatternProps["overlayPosition"]>, string> = {
    "bottom-left": "bottom-[18px] left-[18px]",
    "bottom-right": "bottom-[18px] right-[18px]",
    "top-right": "right-[18px] top-[18px]",
};

/** Mock "shot" visual standing in for a real per-feature screenshot the sheet has no field
 *  for (see the dropped-overlay note in GuideFeatureBlock.tsx). Same reasoning as
 *  GuideHeroStudio: the dot grid is real, server-rendered with the same pure SVG builder the
 *  editor's PNG export uses; the floating card on top is decorative art matching the mockup,
 *  not wired to anything. Only used where a page opts in via `featureVisuals` — once the
 *  sheet supplies a real `Feature Image`, that takes over automatically and this is unused. */
export default function GuideFeaturePattern({
    config,
    overlayTitle,
    overlayItems,
    overlayPosition = "bottom-left",
}: GuideFeaturePatternProps) {
    const svg = buildPolkaDotSvgString(config, PATTERN_SIZE, PATTERN_SIZE);
    const svgDataUrl = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;

    return (
        <div
            aria-hidden
            className={cn(GUIDE_FEATURE_SHOT_ASPECT, "relative overflow-hidden rounded-guide border border-guide-edge bg-guide-card shadow-guide")}
        >
            <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${svgDataUrl}")` }} />

            <div
                className={cn(
                    "guide-mono absolute w-max max-w-[calc(100%-36px)] rounded-[14px] border border-guide-edge bg-guide-card px-3.5 py-3 shadow-guide",
                    POSITION_CLASSES[overlayPosition],
                )}
            >
                <div className="mb-2 text-[10.5px] uppercase tracking-[0.12em] text-guide-mute">{overlayTitle}</div>
                <div className="flex flex-wrap gap-1.5">
                    {overlayItems.map((item) => (
                        <span
                            key={item.label}
                            className={cn(
                                "rounded-[8px] border px-2.5 py-1.5 text-[11.5px] text-guide-ink",
                                item.active ? "border-guide-edge-strong bg-guide-lime" : "border-guide-edge bg-white",
                            )}
                        >
                            {item.label}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
}
