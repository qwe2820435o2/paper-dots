/** Hero and feature images for guide pages, maintained by hand instead of via the Google
 *  Sheet sync — image assets live in `public/<slug>/` and are wired up here once, independent
 *  of copy syncs. `features` is keyed by the sheet's Item ID (matches `GuideFeature.id`). */

import type { GuideSlug } from "./registry";
import type { GuideImage } from "./types";

interface ManualGuideImages {
    hero?: GuideImage;
    features?: Record<string, GuideImage>;
}

export const MANUAL_GUIDE_IMAGES: Partial<Record<GuideSlug, ManualGuideImages>> = {
    dot: {
        hero: {
            src: "/photo-overlay-editor/photo-overlay-editor-hero-1012x1164.png",
            alt: "Photo overlay editor hero showing a photo with color-matched overlays",
            aspect: "aspect-[1012/1164]",
            frameless: true,
        },
        features: {
            "1": {
                src: "/photo-overlay-editor/Feature-01-Auto-Color-Match.png",
                alt: "Overlay colors automatically matched to the photo",
            },
            "2": {
                src: "/photo-overlay-editor/Feature-02-Layouts-That-Flip-With-Your-Photo.png",
                alt: "Overlay shapes for every season and mood",
            },
            "3": {
                src: "/photo-overlay-editor/Feature-03-Layouts-That-Flip-With-Your-Photo.png",
                alt: "Overlay layout flipping between horizontal and vertical photos",
            },
            "4": {
                src: "/photo-overlay-editor/Feature-04-Full-Control-Over-Overlay-Strength.png",
                alt: "Sliders for controlling overlay count, size, opacity, and color",
            },
            "5": {
                src: "/photo-overlay-editor/Feature-05-Free-Export-Text-Overlays.png",
                alt: "Free export with an added text overlay on the final image",
            },
        },
    },
};
