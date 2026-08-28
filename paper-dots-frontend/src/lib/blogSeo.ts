import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { DEFAULT_LOCALE, LOCALE_META, type AppLocale } from "@/i18n/locales";
import { localizedPath, ogImages } from "@/lib/i18nSeo";
import { SITE_URL } from "@/lib/site";
import { featuredImage, plainText, truncate, type PostsPage, type WPPost } from "@/lib/wordpress";

export const BLOG_PATH = "/blog";

/** Page 1 is `/blog`, never `/blog/page/1` — one page of results, one URL. */
export function blogListPath(page: number): string {
    return page <= 1 ? BLOG_PATH : `${BLOG_PATH}/page/${page}`;
}

export function blogPostPath(slug: string): string {
    return `${BLOG_PATH}/${slug}`;
}

/** WordPress omits the trailing `Z` on its GMT timestamps, so they parse as local time unless
 *  it is appended. Everything machine-readable (`<time dateTime>`, JSON-LD, OG article times)
 *  goes through here. */
export function wpTimestamp(gmt: string): string {
    return `${gmt}Z`;
}

/** Formatted from `date_gmt` — the only timestamp WordPress hands out with an unambiguous zone —
 *  and rendered in UTC rather than the viewer's zone, so the prerendered markup and the
 *  browser's hydration agree on what day a post went out. */
export function formatPostDate(post: WPPost, locale: AppLocale): string {
    return new Intl.DateTimeFormat(LOCALE_META[locale].htmlLang, {
        dateStyle: "long",
        timeZone: "UTC",
    }).format(new Date(wpTimestamp(post.date_gmt)));
}

/** All three locales serve the same English posts today, so every blog URL canonicalises to the
 *  unprefixed English one and no hreflang set is emitted. The two are mutually exclusive:
 *  hreflang requires each alternate to be self-canonical, so declaring both would leave a search
 *  engine to pick which of the contradictions to honour.
 *
 *  This function is the single switch point for going multilingual. Once WordPress serves
 *  translations, it returns a self-canonical plus an hreflang map built from each translation's
 *  own slug — no page, route or sitemap entry changes. */
function blogAlternates(path: string): Metadata["alternates"] {
    return { canonical: localizedPath(path, DEFAULT_LOCALE) };
}

/** Whether a paginated list URL points at nothing. The single rule, shared by the route's
 *  metadata and its body, so the two can never disagree about whether a page is a 404.
 *
 *  `ok` is what separates "past the last page" from "the CMS did not answer" — without it a
 *  failed request reads as a missing page, and these routes are prerendered, so one blip during
 *  `next build` would bake a permanent 404 into a page that has posts. */
export function isMissingListPage(page: number, result: PostsPage): boolean {
    return page > 1 && result.ok && result.posts.length === 0;
}

/** Metadata for a blog URL that does not exist.
 *
 *  `notFound()` renders the right UI, but the response still carries HTTP 200 — a site-wide
 *  Next 15.5 + next-intl issue, see docs/blog-soft-404-mitigation.md. Until the root cause is
 *  fixed, this at least keeps the soft 404 out of the search index, which matters far more here
 *  than it did before: /blog/<any string at all> reaches this branch, where previously only a
 *  handful of fixed routes could.
 *
 *  Next already injects its own `noindex` on a notFound() response, so the robots field here is
 *  belt-and-braces — what this actually adds is the title (the response would otherwise present
 *  itself under the site's homepage title) and, more importantly, the suppressed canonical.
 *
 *  `canonical: null` replaces the root layout's alternates, which would otherwise have every
 *  non-existent blog URL declare itself a duplicate of the homepage and carry the site's full
 *  hreflang set. Combining that with noindex is contradictory markup, and pointing thousands of
 *  junk URLs at the homepage is not a signal worth sending. */
export async function blogNotFoundMetadata(locale: AppLocale): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: "notFound" });

    return {
        title: t("heading"),
        robots: { index: false, follow: false },
        alternates: { canonical: null },
    };
}

/** Metadata for `/blog` and `/blog/page/[n]`. Shared so the two routes cannot drift apart. */
export async function buildBlogListMetadata(page: number, locale: AppLocale): Promise<Metadata> {
    const t = await getTranslations({ locale, namespace: "blog.meta" });
    const tOg = await getTranslations({ locale, namespace: "og" });

    const title = page > 1 ? t("titlePaged", { page }) : t("title");
    const images = ogImages(locale, tOg("alt"));

    return {
        title,
        description: t("description"),
        alternates: blogAlternates(blogListPath(page)),
        openGraph: {
            title: page > 1 ? title : t("ogTitle"),
            description: t("description"),
            url: blogListPath(page),
            type: "website",
            siteName: "Dottypic",
            locale: LOCALE_META[locale].ogLocale,
            images,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: t("description"),
            images: images.map((image) => image.url),
        },
    };
}

export async function buildBlogPostMetadata(post: WPPost, locale: AppLocale): Promise<Metadata> {
    const title = plainText(post.title.rendered);
    const description = truncate(plainText(post.excerpt.rendered));
    const tOg = await getTranslations({ locale, namespace: "og" });

    // A post's own featured image makes a far better card than the site-wide OG art; the
    // generated card is the fallback for posts that have none.
    const featured = featuredImage(post);
    const images = featured
        ? [{ url: featured.url, width: featured.width, height: featured.height, alt: featured.alt || title }]
        : ogImages(locale, tOg("alt"));

    return {
        title,
        description,
        alternates: blogAlternates(blogPostPath(post.slug)),
        openGraph: {
            title,
            description,
            url: blogPostPath(post.slug),
            type: "article",
            publishedTime: wpTimestamp(post.date_gmt),
            modifiedTime: wpTimestamp(post.modified_gmt),
            siteName: "Dottypic",
            locale: LOCALE_META[locale].ogLocale,
            images,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: images.map((image) => image.url),
        },
    };
}

/** BlogPosting + BreadcrumbList, matching the single-@graph shape buildGuideJsonLd() uses.
 *  Breadcrumb labels are passed in rather than hardcoded so they follow the page's locale. */
export function buildPostJsonLd(post: WPPost, labels: { home: string; blog: string }) {
    const url = `${SITE_URL}${blogPostPath(post.slug)}`;
    const headline = plainText(post.title.rendered);
    const featured = featuredImage(post);
    const publisher = { "@type": "Organization", name: "Dottypic", url: SITE_URL };

    return {
        "@context": "https://schema.org",
        "@graph": [
            {
                "@type": "BlogPosting",
                headline,
                description: truncate(plainText(post.excerpt.rendered)),
                url,
                mainEntityOfPage: { "@type": "WebPage", "@id": url },
                datePublished: wpTimestamp(post.date_gmt),
                dateModified: wpTimestamp(post.modified_gmt),
                author: publisher,
                publisher,
                ...(featured && { image: [featured.url] }),
            },
            {
                "@type": "BreadcrumbList",
                itemListElement: [
                    { "@type": "ListItem", position: 1, name: labels.home, item: SITE_URL },
                    {
                        "@type": "ListItem",
                        position: 2,
                        name: labels.blog,
                        item: `${SITE_URL}${BLOG_PATH}`,
                    },
                    { "@type": "ListItem", position: 3, name: headline, item: url },
                ],
            },
        ],
    };
}
