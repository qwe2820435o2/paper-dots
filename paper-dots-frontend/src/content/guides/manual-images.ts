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
    "moment-card": {
        hero: {
            src: "/photo-quote-maker/photo-quote-maker-hero-1012x1164.png",
            alt: "Photo quote maker hero showing a photo turned into a quote card",
            aspect: "aspect-[1012/1164]",
            frameless: true,
        },
        features: {
            "1": {
                src: "/photo-quote-maker/Feature-01-Photo-Quote-Maker-With-Clean-Text-Space.png",
                alt: "Photo quote maker with clean text space over the photo",
                aspect: "aspect-[1794/1260]",
                frameless: true,
            },
            "2": {
                src: "/photo-quote-maker/Feature-02-Auto-Colors-From-Your-Photo.png",
                alt: "Quote card colors automatically matched to the photo",
                aspect: "aspect-[1794/1260]",
                frameless: true,
            },
            "3": {
                src: "/photo-quote-maker/Feature-03-Smart-Crop-for-Better-Composition.png",
                alt: "Smart crop for a better quote card composition",
                aspect: "aspect-[1794/1260]",
                frameless: true,
            },
            "4": {
                src: "/photo-quote-maker/Feature-04-No-Templates-or-Layer-Fuss.png",
                alt: "Simple quote editor with no templates or layers to manage",
                aspect: "aspect-[1794/1260]",
                frameless: true,
            },
            "5": {
                src: "/photo-quote-maker/Feature-05-Your-Words-Free-and-Unwatermarked.png",
                alt: "Free export of a quote card with no watermark",
                aspect: "aspect-[1794/1260]",
                frameless: true,
            },
        },
    },
    "polka-dot": {
        hero: {
            src: "/polka-dot/cover-photo-polka-dot-generator.png",
            alt: "Polka dot generator hero showing a live pattern preview and controls",
            aspect: "aspect-[2025/2328]",
            frameless: true,
        },
        features: {
            "1": {
                src: "/polka-dot/01-feature-one-click.png",
                alt: "Polka dot pattern generated in one click",
                aspect: "aspect-[1794/1260]",
                frameless: true,
            },
            "2": {
                src: "/polka-dot/02-feature-shapes-emoji-text.png",
                alt: "Dots swapped for shapes, emoji, or text",
                aspect: "aspect-[1794/1260]",
                frameless: true,
            },
            "3": {
                src: "/polka-dot/03-feature-upload-image.png",
                alt: "A custom uploaded image used as the dot unit",
                aspect: "aspect-[1794/1260]",
                frameless: true,
            },
            "4": {
                src: "/polka-dot/04-feature-size-spacing-tilt.png",
                alt: "Controls for dot size, spacing, and tilt",
                aspect: "aspect-[1794/1260]",
                frameless: true,
            },
            "5": {
                src: "/polka-dot/05-feature-export-formats.png",
                alt: "Export options for different formats and sizes",
                aspect: "aspect-[1794/1260]",
                frameless: true,
            },
        },
    },
};
