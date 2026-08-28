import type { Metadata } from "next";
import { setRequestLocale } from "next-intl/server";
import type { AppLocale } from "@/i18n/locales";
import { buildBlogListMetadata } from "@/lib/blogSeo";
import BlogIndex from "@/components/blog/BlogIndex";

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
    const { locale } = await params;
    return buildBlogListMetadata(1, locale);
}

export default async function BlogListPage({
    params,
}: {
    params: Promise<{ locale: AppLocale }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    return <BlogIndex page={1} locale={locale} />;
}
