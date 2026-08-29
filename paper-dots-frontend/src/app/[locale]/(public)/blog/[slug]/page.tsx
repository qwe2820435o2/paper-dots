import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { DEFAULT_LOCALE, type AppLocale } from "@/i18n/locales";
import { guideFontClass } from "@/lib/fonts";
import { GUIDE_WRAP } from "@/components/guide/guideLayout";
import {
    BLOG_PATH,
    blogNotFoundMetadata,
    buildBlogPostMetadata,
    buildPostJsonLd,
    formatPostDate,
    wpTimestamp,
} from "@/lib/blogSeo";
import { featuredImage, getAllPosts, getPostBySlug } from "@/lib/wordpress";
import { rewriteInternalLinks } from "@/lib/blogContent";

type Params = Promise<{ locale: AppLocale; slug: string }>;

/** All three locales serve the same posts, so one slug list covers every locale — Next crosses
 *  it with the locales the root layout generates. Under a multilingual WordPress each
 *  translation gets its own slug and this takes the parent's locale instead.
 *
 *  Returning nothing when WordPress is unreachable is deliberate: `dynamicParams` stays on, so
 *  posts still render on first request rather than failing the build. */
export async function generateStaticParams() {
    const posts = await getAllPosts(DEFAULT_LOCALE);
    return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale, slug } = await params;
    const post = await getPostBySlug(slug, locale);
    // notFound() is left to the page body; returning metadata here instead is what puts the
    // noindex on the response, which notFound() alone cannot do.
    if (!post) return blogNotFoundMetadata(locale);

    return buildBlogPostMetadata(post, locale);
}

export default async function BlogPostPage({ params }: { params: Params }) {
    const { locale, slug } = await params;
    setRequestLocale(locale);

    const post = await getPostBySlug(slug, locale);
    if (!post) notFound();

    const t = await getTranslations({ locale, namespace: "blog" });
    const tCrumb = await getTranslations({ locale, namespace: "breadcrumb" });
    const featured = featuredImage(post);
    const jsonLd = buildPostJsonLd(post, { home: tCrumb("home"), blog: t("heading") });

    // Links the editor made to other posts are absolute WordPress URLs, which would walk the
    // reader off the site onto the bare CMS. The post list is what turns them back into local
    // paths; it costs one extra request, deduplicated across the whole build by the fetch cache
    // because every locale asks for the same URL.
    const content = rewriteInternalLinks(post.content.rendered, await getAllPosts(locale), locale);

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            <div className={`${guideFontClass} blog-scope bg-guide-paper py-14 lg:py-20`}>
                <div className={GUIDE_WRAP}>
                    <article className="mx-auto max-w-[760px]">
                        <Link
                            href={BLOG_PATH}
                            className="blog-display inline-flex items-center gap-2 text-[15px] font-bold text-guide-ink-2 transition-colors hover:text-guide-ink"
                        >
                            <ArrowLeft size={16} strokeWidth={2} />
                            {t("backToList")}
                        </Link>

                        <time
                            dateTime={wpTimestamp(post.date_gmt)}
                            className="mt-10 block text-[14px] font-medium text-guide-mute"
                        >
                            {formatPostDate(post, locale)}
                        </time>

                        <h1
                            className="blog-display mt-3 text-[clamp(34px,3.6vw,50px)] font-extrabold leading-[1.05] tracking-[-0.03em] text-guide-ink"
                            dangerouslySetInnerHTML={{ __html: post.title.rendered }}
                        />

                        {featured && (
                            <Image
                                src={featured.url}
                                alt={featured.alt}
                                width={featured.width}
                                height={featured.height}
                                priority
                                sizes="(min-width: 800px) 760px, 100vw"
                                className="mt-10 h-auto w-full rounded-guide border-[1.5px] border-guide-edge object-cover"
                            />
                        )}

                        {/* WordPress hands back `content.rendered` as serialized Gutenberg HTML —
                            columns, alignment, embeds and all — so rendering it verbatim is the
                            only way the layout an editor built survives the trip.

                            It is injected unsanitized, which trusts every account on the
                            WordPress install: a compromised login is stored XSS on dottypic.com.
                            Note this is a weaker position than RichText.tsx, whose HTML comes
                            from a spreadsheet, passes the sync script's allowlist, and is read in
                            a git diff before it ships. None of those three hold here. */}
                        <div
                            className="blog-content mt-12"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    </article>
                </div>
            </div>
        </>
    );
}
