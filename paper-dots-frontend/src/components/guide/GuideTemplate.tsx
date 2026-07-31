import type { GuideContent } from "@/content/guides";
import type { GuideSlug } from "@/content/guides/registry";
import { guideFontClass } from "@/lib/fonts";
import GuideHero from "./GuideHero";
import GuideRail from "./GuideRail";
import GuideToolLinks from "./GuideToolLinks";
import { getDefaultToolLinks } from "./guideDefaultToolLinks";
import GuideFeatures from "./GuideFeatures";
import GuideHowTo from "./GuideHowTo";
import GuideWhy from "./GuideWhy";
import GuideFaq from "./GuideFaq";
import GuideFinalCta from "./GuideFinalCta";

interface GuideTemplateProps {
    content: GuideContent;
    /** This guide's own slug — used only to drop itself out of the "More tools" fallback. */
    slug: GuideSlug;
    /** Editor route this guide leads into — passed down to whichever section needs a
     *  fallback CTA link. */
    appPath: string;
}

/** Composes the guide sections in the mockup's order, skipping whichever ones the sheet
 *  didn't fill in. `guideFontClass` + `guide-scope` are applied here and nowhere else, which
 *  is the entire mechanism keeping the guide fonts and CSS out of the Header, the Footer and
 *  every other route — see docs/guide-pages.md and src/lib/fonts.ts. Every guide page renders
 *  through this same component with no per-tool props, so hero/feature/tool-links visual
 *  fallbacks (GuideHero, GuideFeatureBlock, guideDefaultToolLinks) apply identically
 *  everywhere. */
export default function GuideTemplate({ content, slug, appPath }: GuideTemplateProps) {
    const toolLinks = content.toolLinks ?? getDefaultToolLinks(slug);

    return (
        <div className={`${guideFontClass} guide-scope`}>
            <GuideHero hero={content.hero} appPath={appPath} />
            <GuideRail />
            <GuideToolLinks toolLinks={toolLinks} />
            {content.features.length > 0 && <GuideFeatures features={content.features} />}
            {content.howTo && <GuideHowTo howTo={content.howTo} />}
            {content.why && <GuideWhy why={content.why} />}
            {content.faq && <GuideFaq faq={content.faq} />}
            {content.finalCta && <GuideFinalCta finalCta={content.finalCta} appPath={appPath} />}
        </div>
    );
}
