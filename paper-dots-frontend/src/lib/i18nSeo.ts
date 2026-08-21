import type { Metadata } from "next";
import { DEFAULT_LOCALE, LOCALES, LOCALE_META, type AppLocale } from "@/i18n/locales";

/** Path with the locale prefix the router actually serves. The default locale is unprefixed
 *  (`localePrefix: "as-needed"`), so `/faq` stays `/faq` rather than becoming `/en/faq`. */
export function localizedPath(path: string, locale: AppLocale): string {
    return locale === DEFAULT_LOCALE ? path : `${localizedPrefix(locale)}${path === "/" ? "" : path}`;
}

function localizedPrefix(locale: AppLocale): string {
    return `/${locale}`;
}

/** Canonical + hreflang set for one locale-less path.
 *
 *  The `languages` keys are BCP 47 tags (`ja`), not the routing codes (`jp`) — Google ignores
 *  an `hreflang` it cannot parse, so the two vocabularies deliberately differ here. Values are
 *  the real routed paths. `x-default` points at the unprefixed default locale. */
export function buildAlternates(path: string, locale: AppLocale): Metadata["alternates"] {
    const languages: Record<string, string> = {};
    for (const code of LOCALES) {
        languages[LOCALE_META[code].htmlLang] = localizedPath(path, code);
    }
    languages["x-default"] = localizedPath(path, DEFAULT_LOCALE);

    return {
        canonical: localizedPath(path, locale),
        languages,
    };
}

/** The locale's OG card. A page that exports its own `openGraph` replaces the layout's whole
 *  object — and that also suppresses Next's automatic injection of the `opengraph-image.tsx`
 *  output — so every such page has to name the image itself or ship without a card. */
export function ogImages(locale: AppLocale) {
    return [{ url: localizedPath("/opengraph-image", locale), width: 1200, height: 630 }];
}
