import { getTranslations } from "next-intl/server";
import { GUIDE_WRAP } from "@/components/guide/guideLayout";
import { HOME_H2_STYLE } from "./homeLayout";

/** The avatar initial stays here rather than in the message files: it is the first letter of
 *  the reviewer's name, which is a proper noun and identical in every locale. */
const REVIEWS: Array<{ id: string; initial: string }> = [
    { id: "mira", initial: "M" },
    { id: "dan", initial: "D" },
    { id: "kenji", initial: "K" },
    { id: "priya", initial: "P" },
];

export default async function HomeReviews() {
    const t = await getTranslations("home.reviews");

    return (
        <section className="border-y border-guide-edge bg-guide-lime-3 py-24">
            <div className={GUIDE_WRAP}>
                <h2 className="text-center" style={HOME_H2_STYLE}>{t("heading")}</h2>

                <div className="mt-12 grid gap-5 lg:grid-cols-2">
                    {REVIEWS.map((review) => (
                        <div key={review.id} className="rounded-guide border-[1.5px] border-guide-edge bg-white px-[30px] py-7">
                            <div className="guide-display h-6 text-[44px] font-extrabold leading-[0.6] text-guide-lime">&ldquo;</div>
                            <blockquote className="text-[16.5px] leading-[1.55] text-guide-ink-2">
                                {t(`items.${review.id}.quote`)}
                            </blockquote>
                            <cite className="mt-5 flex items-center gap-2.5 not-italic">
                                <span className="guide-display grid h-[34px] w-[34px] place-items-center rounded-full border-[1.5px] border-guide-edge-strong bg-guide-lime text-sm font-extrabold text-guide-ink">
                                    {review.initial}
                                </span>
                                <span className="guide-display text-[15px] font-bold text-guide-ink">
                                    {t(`items.${review.id}.name`)}
                                </span>
                            </cite>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
