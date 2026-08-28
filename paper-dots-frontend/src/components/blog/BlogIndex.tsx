import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import type { AppLocale } from "@/i18n/locales";
import { isMissingListPage } from "@/lib/blogSeo";
import { guideFontClass } from "@/lib/fonts";
import { GUIDE_SEC_HEAD, GUIDE_WRAP } from "@/components/guide/guideLayout";
import { getPosts } from "@/lib/wordpress";
import BlogPagination from "@/components/blog/BlogPagination";
import BlogPostCard from "@/components/blog/BlogPostCard";

/** The whole of /blog and /blog/page/[n]. Both routes render this so the two can only ever
 *  differ by their page number. */
export default async function BlogIndex({ page, locale }: { page: number; locale: AppLocale }) {
    const result = await getPosts(locale, page);
    const t = await getTranslations({ locale, namespace: "blog" });

    // A page past the last one is a 404, not an empty grid. Page 1 stays reachable even with no
    // posts at all, so the blog has a landing page from the day it ships. The rule lives in
    // blogSeo so this and the route's generateMetadata cannot disagree.
    if (isMissingListPage(page, result)) notFound();

    return (
        <div className={`${guideFontClass} blog-scope min-h-[70vh] bg-guide-paper py-16 lg:py-24`}>
            <div className={GUIDE_WRAP}>
                <header className={GUIDE_SEC_HEAD}>
                    <h1 className="blog-display text-[clamp(40px,4.2vw,58px)] font-extrabold leading-[1.02] tracking-[-0.03em] text-guide-ink">
                        {t("heading")}
                    </h1>
                    <p className="mt-4 text-lg leading-[1.6] text-guide-ink-2">{t("lead")}</p>
                </header>

                <div className="mt-[52px]">
                    {result.posts.length > 0 ? (
                        <div className="grid grid-cols-1 gap-[22px] sm:grid-cols-2 lg:grid-cols-3">
                            {result.posts.map((post) => (
                                <BlogPostCard
                                    key={post.id}
                                    post={post}
                                    locale={locale}
                                    readMoreLabel={t("readMore")}
                                />
                            ))}
                        </div>
                    ) : (
                        // `ok` is what separates an empty CMS from an unreachable one — the
                        // second must not read as "we have never written anything".
                        <p className="rounded-guide border-[1.5px] border-dashed border-guide-edge bg-guide-card px-8 py-16 text-center text-[15px] text-guide-ink-2">
                            {result.ok ? t("empty") : t("unavailable")}
                        </p>
                    )}
                </div>

                <BlogPagination page={page} totalPages={result.totalPages} locale={locale} />
            </div>
        </div>
    );
}
