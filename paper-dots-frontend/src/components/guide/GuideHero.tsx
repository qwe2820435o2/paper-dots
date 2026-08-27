import type { GuideContent } from "@/content/guides";
import { GUIDE_WRAP } from "./guideLayout";
import RichText from "./RichText";
import GuideMedia from "./GuideMedia";
import GuideCtaButton from "./GuideCtaButton";
import GuideHeroStudio from "./GuideHeroStudio";
import UploadPhotoButton from "@/components/common/UploadPhotoButton";
import GuideBeforeAfterUploaderCta from "./GuideBeforeAfterUploaderCta";

interface GuideHeroProps {
    hero: GuideContent["hero"];
    /** Editor route, used whenever the sheet leaves a CTA link cell empty. */
    appPath: string;
    /** When set, the CTA becomes a real photo-upload control that lands in the given editor
     *  with the photo loaded — used by guide pages whose CTA copy ("Make a Photo Quote", "Add
     *  Photo Overlays") promises an upload that a plain link can't deliver. "before-after"
     *  renders the two-slot dropzone directly instead of a single-file button, since that
     *  editor needs two photos before it's "ready". */
    uploadTarget?: "dot" | "moment-card" | "before-after";
}

/** Always two-column: a real sheet image takes priority, otherwise every guide page falls
 *  back to the same GuideHeroStudio dot-pattern visual — DottyPic's brand signature, not a
 *  literal preview of that particular tool — so no guide page ships with an empty right
 *  column while its sheet image is still pending (see docs/guide-pages.md risk #3). */
export default function GuideHero({ hero, appPath, uploadTarget }: GuideHeroProps) {
    const ctaHref = hero.cta.href ?? appPath;
    const visual = hero.image ? (
        <GuideMedia
            image={hero.image}
            aspect="aspect-[1012/1164]"
            priority
            className="rounded-none shadow-none"
        />
    ) : (
        <GuideHeroStudio />
    );

    return (
        <section className="pb-12 pt-14 lg:pt-20">
            <div className={GUIDE_WRAP}>
                <div className="grid items-center gap-14 lg:grid-cols-[0.86fr_1.14fr]">
                    <div>
                        <RichText as="h1" html={hero.headline} className="text-balance" />
                        <p className="mt-5 text-lg text-guide-ink-2">{hero.subheadline}</p>

                        <div className="mt-8 flex flex-wrap items-center gap-4">
                            {uploadTarget === "before-after" ? (
                                <GuideBeforeAfterUploaderCta ctaLabel={hero.cta.text} />
                            ) : uploadTarget ? (
                                <UploadPhotoButton className="guide-btn" trackId="hero" target={uploadTarget}>
                                    {hero.cta.text}
                                </UploadPhotoButton>
                            ) : (
                                <GuideCtaButton href={ctaHref} trackId="hero">
                                    {hero.cta.text}
                                </GuideCtaButton>
                            )}
                        </div>

                        {hero.formats.length > 0 && (
                            <ul className="mt-6 flex flex-wrap gap-2">
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

                    {visual}
                </div>
            </div>
        </section>
    );
}
