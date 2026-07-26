import type { GuideContent } from "@/content/guides";
import { guideFontClass } from "@/lib/fonts";
import GuideHero from "./GuideHero";
import GuideRail from "./GuideRail";
import GuideToolLinks from "./GuideToolLinks";

interface GuideTemplateProps {
    content: GuideContent;
    /** Editor route this guide leads into — passed down to whichever section needs a
     *  fallback CTA link. */
    appPath: string;
}

/** Composes the guide sections in the mockup's order, skipping whichever ones the sheet
 *  didn't fill in. `guideFontClass` + `guide-scope` are applied here and nowhere else, which
 *  is the entire mechanism keeping the guide fonts and CSS out of the Header, the Footer and
 *  every other route — see docs/guide-pages.md and src/lib/fonts.ts. */
export default function GuideTemplate({ content, appPath }: GuideTemplateProps) {
    return (
        <div className={`${guideFontClass} guide-scope`}>
            <GuideHero hero={content.hero} appPath={appPath} />
            {content.toolLinks && (
                <>
                    <GuideRail />
                    <GuideToolLinks toolLinks={content.toolLinks} />
                </>
            )}
        </div>
    );
}
