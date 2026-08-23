import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import type { GuideContent, GuideLocale } from "@/content/guides";
import type { GuideRegistryEntry } from "@/content/guides/registry";
import { SITE_URL } from "@/lib/site";
import { LOCALE_META } from "@/i18n/locales";
import { buildAlternates, localizedPath, ogImages } from "@/lib/i18nSeo";

/** The guide locales are exactly the app's routing locales, so `og:locale` comes from the
 *  same table the `<html lang>` and hreflang values do rather than a second copy here. */
export async function buildGuideMetadata(
    content: GuideContent,
    route: GuideRegistryEntry,
    locale: GuideLocale = "en"
): Promise<Metadata> {
    const title = content.meta.title;
    const t = await getTranslations({ locale, namespace: "og" });
    const images = ogImages(locale, t("alt"));
    return {
        title,
        description: content.meta.description,
        alternates: buildAlternates(route.guidePath, locale),
        openGraph: {
            title,
            description: content.meta.description,
            url: route.guidePath,
            type: "website",
            locale: LOCALE_META[locale].ogLocale,
            images,
        },
        twitter: {
            card: "summary_large_image",
            title,
            description: content.meta.description,
            images: images.map((image) => image.url),
        },
    };
}

/** The editor keeps its existing title/description untouched; this only adds the
 *  self-canonical and takes it out of the index. See docs/guide-pages.md §"为什么 /x/app 设
 *  noindex" — the guide and the editor are topically identical, so every ranking signal
 *  should concentrate on the guide instead of splitting across both. */
export function buildEditorMetadata(
    base: Pick<Metadata, "title" | "description">,
    route: GuideRegistryEntry,
    locale: GuideLocale = "en"
): Metadata {
    return {
        ...base,
        // Self-canonical only — no hreflang set, because the page is noindex in every locale
        // and alternates between excluded URLs would just be noise.
        alternates: {
            canonical: localizedPath(route.appPath, locale),
        },
        robots: {
            index: false,
            follow: true,
        },
    };
}

/** A single @graph combining SoftwareApplication, FAQPage and BreadcrumbList. HowTo is
 *  deliberately omitted — Google retired HowTo rich results in 2023, so it would add payload
 *  with no visible benefit. FAQPage answers are stripped of the RichText allowlist's inline
 *  HTML: JSON-LD text fields must be plain text. */
export function buildGuideJsonLd(
    content: GuideContent,
    route: GuideRegistryEntry,
    /** Breadcrumb label for the site root. Passed in rather than hardcoded so it follows the
     *  page's locale — it is the only literal user-facing string in this module. */
    homeLabel: string
) {
    const url = `${SITE_URL}${route.guidePath}`;

    const graph: Record<string, unknown>[] = [
        {
            "@type": "SoftwareApplication",
            name: content.name,
            url,
            applicationCategory: "DesignApplication",
            operatingSystem: "Any",
            offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
            ...(content.features.length > 0 && {
                featureList: content.features.map((feature) => stripInlineHtml(feature.heading)),
            }),
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: homeLabel, item: SITE_URL },
                { "@type": "ListItem", position: 2, name: content.name, item: url },
            ],
        },
    ];

    if (content.faq && content.faq.items.length > 0) {
        graph.push({
            "@type": "FAQPage",
            mainEntity: content.faq.items.map((item) => ({
                "@type": "Question",
                name: stripInlineHtml(item.question),
                acceptedAnswer: { "@type": "Answer", text: stripInlineHtml(item.answer) },
            })),
        });
    }

    return {
        "@context": "https://schema.org",
        "@graph": graph,
    };
}

function stripInlineHtml(html: string): string {
    return html.replace(/<[^>]+>/g, "");
}
