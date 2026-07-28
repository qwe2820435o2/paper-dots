import type { GuideContent } from "@/content/guides";
import { guideFontClass } from "@/lib/fonts";
import GuideHero from "./GuideHero";
import GuideRail from "./GuideRail";
import GuideToolLinks from "./GuideToolLinks";
import GuideFeatures from "./GuideFeatures";
import GuideHowTo from "./GuideHowTo";
import GuideWhy from "./GuideWhy";
import GuideFaq from "./GuideFaq";
import GuideFinalCta from "./GuideFinalCta";

interface GuideTemplateProps {
    content: GuideContent;
    /** Editor route this guide leads into — passed down to whichever section needs a
     *  fallback CTA link. */
    appPath: string;
    /** Tool-specific hero visual, forwarded to GuideHero — see GuideHero.tsx. */
    heroVisual?: React.ReactNode;
    /** Tool-specific per-feature media overrides, forwarded to GuideFeatures — see
     *  GuideFeatureBlock.tsx. */
    featureVisuals?: Record<string, React.ReactNode>;
}

/** Composes the guide sections in the mockup's order, skipping whichever ones the sheet
 *  didn't fill in. `guideFontClass` + `guide-scope` are applied here and nowhere else, which
 *  is the entire mechanism keeping the guide fonts and CSS out of the Header, the Footer and
 *  every other route — see docs/guide-pages.md and src/lib/fonts.ts. */
export default function GuideTemplate({ content, appPath, heroVisual, featureVisuals }: GuideTemplateProps) {
    return (
        <div className={`${guideFontClass} guide-scope`}>
            <GuideHero hero={content.hero} appPath={appPath} heroVisual={heroVisual} />
            {content.toolLinks && (
                <>
                    <GuideRail />
                    <GuideToolLinks toolLinks={content.toolLinks} />
                </>
            )}
            {content.features.length > 0 && (
                <GuideFeatures features={content.features} visuals={featureVisuals} />
            )}
            {content.howTo && <GuideHowTo howTo={content.howTo} />}
            {content.why && <GuideWhy why={content.why} />}
            {content.faq && <GuideFaq faq={content.faq} />}
            {content.finalCta && <GuideFinalCta finalCta={content.finalCta} appPath={appPath} />}
        </div>
    );
}
