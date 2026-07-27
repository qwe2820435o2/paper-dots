import type { Metadata } from "next";
import type { GuideContent, GuideLocale } from "@/content/guides";
import type { GuideRegistryEntry } from "@/content/guides/registry";
import { SITE_URL } from "@/lib/site";

const OG_LOCALE: Record<GuideLocale, string> = {
    en: "en_US",
    ja: "ja_JP",
};

/** `locale` only ever gets "en" today; once /ja routes exist this — plus an
 *  `alternates.languages` entry — is the one place that needs to grow, not the page files. */
export function buildGuideMetadata(
    content: GuideContent,
    route: GuideRegistryEntry,
    locale: GuideLocale = "en"
): Metadata {
    const title = `${content.name} · Dottypic`;
    return {
        title,
        description: content.meta.description,
        alternates: {
            canonical: route.guidePath,
        },
        openGraph: {
            title,
            description: content.meta.description,
            url: route.guidePath,
            type: "website",
            locale: OG_LOCALE[locale],
        },
        twitter: {
            title,
            description: content.meta.description,
        },
    };
}

/** The editor keeps its existing title/description untouched; this only adds the
 *  self-canonical and takes it out of the index. See docs/guide-pages.md §"为什么 /x/app 设
 *  noindex" — the guide and the editor are topically identical, so every ranking signal
 *  should concentrate on the guide instead of splitting across both. */
export function buildEditorMetadata(base: Pick<Metadata, "title" | "description">, route: GuideRegistryEntry): Metadata {
    return {
        ...base,
        alternates: {
            canonical: route.appPath,
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
export function buildGuideJsonLd(content: GuideContent, route: GuideRegistryEntry) {
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
                { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
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
