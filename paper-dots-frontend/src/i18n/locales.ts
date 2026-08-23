/** The routing code is the URL segment (`/jp`) and deliberately differs from the ISO 639-1
 *  code that `hreflang` and `<html lang>` require (`ja`) — `jp` is not a valid language tag,
 *  so emitting it in markup would make the alternates invisible to search engines.
 *
 *  Every SEO helper therefore reads `htmlLang` / `ogLocale` from this table instead of
 *  reusing the routing code, which keeps the two vocabularies from ever being confused. */

export const LOCALES = ["en", "jp", "id"] as const;

export type AppLocale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: AppLocale = "en";

interface LocaleMeta {
    /** Value for `<html lang>` and `hreflang`. Must be a valid BCP 47 tag. */
    htmlLang: string;
    /** Value for `og:locale`. */
    ogLocale: string;
    /** What the language switcher shows. */
    label: string;
}

export const LOCALE_META: Record<AppLocale, LocaleMeta> = {
    en: { htmlLang: "en", ogLocale: "en_US", label: "EN" },
    jp: { htmlLang: "ja", ogLocale: "ja_JP", label: "JP" },
    id: { htmlLang: "id", ogLocale: "id_ID", label: "ID" },
};
