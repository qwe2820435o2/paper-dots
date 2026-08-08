import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";

export default createMiddleware(routing);

export const config = {
    /** Skips `/api`, Next's internals, and anything with a file extension. The extension rule
     *  is what keeps `/sitemap.xml`, `/robots.txt`, `/icon.svg`, `/manifest.json` and the whole
     *  of `public/` (papers, logos, emoji) out of the locale rewrite — they are locale-invariant
     *  assets and prefixing them would 404. `/opengraph-image` has no extension on purpose and
     *  does get rewritten, since each locale renders its own card. */
    matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
