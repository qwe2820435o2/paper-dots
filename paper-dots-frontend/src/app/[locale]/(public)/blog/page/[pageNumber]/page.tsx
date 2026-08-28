import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { DEFAULT_LOCALE, type AppLocale } from "@/i18n/locales";
import { blogNotFoundMetadata, buildBlogListMetadata, isMissingListPage } from "@/lib/blogSeo";
import { getPosts } from "@/lib/wordpress";
import BlogIndex from "@/components/blog/BlogIndex";

type Params = Promise<{ locale: AppLocale; pageNumber: string }>;

/** Rejects "1", "01", "2.5", "-3" and anything else that would give one page of results a
 *  second URL. Page 1 lives at /blog. */
function parsePageNumber(raw: string): number | null {
    if (!/^[1-9]\d*$/.test(raw)) return null;
    const page = Number(raw);
    return page > 1 ? page : null;
}

/** Pages 2..N. All three locales serve the same posts today, so the page count is read once
 *  against the default locale; when WordPress goes multilingual this takes the parent's locale
 *  instead. A CMS outage yields no params and the pages fall back to on-demand ISR. */
export async function generateStaticParams() {
    const { totalPages } = await getPosts(DEFAULT_LOCALE, 1);

    return Array.from({ length: Math.max(0, totalPages - 1) }, (_, index) => ({
        pageNumber: String(index + 2),
    }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const { locale, pageNumber } = await params;
    const page = parsePageNumber(pageNumber);
    if (page === null) return blogNotFoundMetadata(locale);

    // Mirrors the check BlogIndex makes on the same (deduplicated) request, so a page past the
    // last one is noindex'd rather than shipping a canonical for a URL that holds nothing.
    if (isMissingListPage(page, await getPosts(locale, page))) {
        return blogNotFoundMetadata(locale);
    }

    return buildBlogListMetadata(page, locale);
}

export default async function BlogListPagedPage({ params }: { params: Params }) {
    const { locale, pageNumber } = await params;
    setRequestLocale(locale);

    const page = parsePageNumber(pageNumber);
    if (page === null) notFound();

    return <BlogIndex page={page} locale={locale} />;
}
