import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getGuideContent } from "@/content/guides";
import { getGuideRoute } from "@/content/guides/registry";
import { buildGuideMetadata, buildGuideJsonLd } from "@/lib/guideSeo";
import type { AppLocale } from "@/i18n/locales";
import GuideTemplate from "@/components/guide/GuideTemplate";

const SLUG = "polka-dot" as const;
const route = getGuideRoute(SLUG);

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: AppLocale }>;
}): Promise<Metadata> {
    const { locale } = await params;
    return buildGuideMetadata(getGuideContent(SLUG, locale), route, locale);
}

export default async function PolkaDotGuidePage({
    params,
}: {
    params: Promise<{ locale: AppLocale }>;
}) {
    const { locale } = await params;
    setRequestLocale(locale);

    // Falls back to the English copy for any locale whose sheet column is not filled in yet.
    const content = getGuideContent(SLUG, locale);
    const t = await getTranslations("breadcrumb");
    const jsonLd = buildGuideJsonLd(content, route, t("home"));

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />
            <GuideTemplate content={content} slug={SLUG} appPath={route.appPath} />
        </>
    );
}
