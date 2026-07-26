import type { GuideContent } from "@/content/guides";
import { GUIDE_WRAP } from "./guideLayout";
import RichText from "./RichText";
import GuideMedia from "./GuideMedia";
import GuideCtaButton from "./GuideCtaButton";

interface GuideHeroProps {
    hero: GuideContent["hero"];
    /** Editor route, used whenever the sheet leaves a CTA link cell empty. */
    appPath: string;
}

/** Single-column and centered when the sheet has not supplied a hero image yet — deliberately
 *  not a two-column layout with an empty box on the right, which is what the mockup's
 *  interactive "studio" panel is being replaced with (see docs/guide-pages.md risk #3). */
export default function GuideHero({ hero, appPath }: GuideHeroProps) {
    const ctaHref = hero.cta.href ?? appPath;

    return (
        <section className="pb-12 pt-14 lg:pt-20">
            <div className={GUIDE_WRAP}>
                <div
                    className={
                        hero.image
                            ? "grid items-center gap-12 lg:grid-cols-2"
                            : "mx-auto max-w-3xl text-center"
                    }
                >
                    <div>
                        <RichText as="h1" html={hero.headline} className="text-balance" />
                        <p className="mt-5 text-lg text-guide-ink-2">{hero.subheadline}</p>

                        <div
                            className={
                                hero.image
                                    ? "mt-8 flex flex-wrap items-center gap-4"
                                    : "mt-8 flex flex-wrap items-center justify-center gap-4"
                            }
                        >
                            <GuideCtaButton href={ctaHref} trackId="hero">
                                {hero.cta.text}
                            </GuideCtaButton>
                        </div>

                        {hero.formats.length > 0 && (
                            <ul
                                className={
                                    hero.image
                                        ? "mt-6 flex flex-wrap gap-2"
                                        : "mt-6 flex flex-wrap justify-center gap-2"
                                }
                            >
                                {hero.formats.map((format) => (
                                    <li
                                        key={format}
                                        className="guide-mono rounded-full border border-guide-edge bg-guide-card px-3 py-1 text-xs text-guide-mute"
                                    >
                                        {format}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>

                    {hero.image && <GuideMedia image={hero.image} aspect="aspect-[4/3]" priority />}
                </div>
            </div>
        </section>
    );
}
