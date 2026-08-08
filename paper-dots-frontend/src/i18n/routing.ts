import { defineRouting } from "next-intl/routing";
import { DEFAULT_LOCALE, LOCALES } from "./locales";

/** `localePrefix: "as-needed"` keeps every existing English URL byte-identical (`/faq`, not
 *  `/en/faq`), so none of the site's earned ranking signals need a redirect hop.
 *
 *  `localeDetection: false` is deliberate: `/` must always be English. With detection on, a
 *  visitor whose browser prefers Japanese would be bounced from the canonical `/` to `/jp`,
 *  which makes the default locale's URLs unreachable without a manual override cookie. The
 *  language switcher is the only thing that changes locale. */
export const routing = defineRouting({
    locales: LOCALES,
    defaultLocale: DEFAULT_LOCALE,
    localePrefix: "as-needed",
    localeDetection: false,
});
