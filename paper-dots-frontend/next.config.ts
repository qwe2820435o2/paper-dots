import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** Every legacy path needs a second entry carrying an optional locale prefix. `redirects()`
 *  runs before the i18n middleware, so `/jp/decorate` would otherwise reach the router as an
 *  unknown route and 404 instead of landing on `/jp/photo-overlay-editor`. `:locale` is
 *  constrained to the prefixed locales only — `en` is unprefixed and already covered by the
 *  bare source. */
const LEGACY_PATHS: Array<{ from: string; to: string }> = [
  { from: "/decorate", to: "/photo-overlay-editor" },
  { from: "/dot", to: "/photo-overlay-editor" },
  { from: "/moment-card", to: "/photo-quote-maker" },
  { from: "/geometric-patterns", to: "/geometric-pattern-generator" },
  { from: "/dot/app", to: "/create/dot" },
  { from: "/moment-card/app", to: "/create/moment-card" },
  { from: "/polka-dot/app", to: "/create/polka-dot" },
  { from: "/geometric-patterns/app", to: "/create/geometric-patterns" },
  { from: "/faq", to: "/" },
];

const IMMUTABLE_CACHE = "public, max-age=31536000, immutable";
/** Long enough that repeat views come out of cache, short enough that replacing a file in
 *  place reaches visitors the same day. */
const REVALIDATED_CACHE = "public, max-age=3600, stale-while-revalidate=86400";

/** Everything under `public/` is served from a fixed, unhashed URL, so `immutable` is a promise
 *  we can only keep for files that are never edited in place — and these two groups are. The
 *  guide/home artwork gets re-exported (e84fc01 resized every one of them) and the brand icons
 *  were replaced wholesale by the logo change, which is exactly why `favicon.ico` and
 *  `icon-192.png` then sat stale in Cloudflare's edge for a month, back when one blanket rule
 *  marked every image extension immutable. Next stamps `immutable` on `/_next/static` and on the
 *  `icon.svg` / `apple-icon.png` metadata routes itself, and those URLs are content-hashed, so
 *  nothing here needs to cover them. */
const OVERWRITTEN_IMAGE_DIRS =
  "home|polka-dot|photo-overlay-editor|photo-quote-maker|geometric-pattern-generator";
const OVERWRITTEN_BRAND_FILES =
  "favicon.ico|icon-192.png|icon-512.png|logo-dark.svg|hero-before-after.png";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
  devIndicators: false,
  async redirects() {
    return LEGACY_PATHS.flatMap(({ from, to }) => [
      { source: from, destination: to, permanent: true },
      { source: `/:locale(jp|id)${from}`, destination: `/:locale${to}`, permanent: true },
    ]);
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // `papers` and `emoji` are append-only libraries — a texture or an emoji is added, never
      // replaced — so their fixed URLs really are immutable.
      {
        source: "/:dir(papers|emoji)/:path*",
        headers: [{ key: "Cache-Control", value: IMMUTABLE_CACHE }],
      },
      {
        source: `/:dir(${OVERWRITTEN_IMAGE_DIRS})/:file(.+\\.(?:png|webp|jpg|jpeg|svg))`,
        headers: [{ key: "Cache-Control", value: REVALIDATED_CACHE }],
      },
      {
        source: `/:file(${OVERWRITTEN_BRAND_FILES})`,
        headers: [{ key: "Cache-Control", value: REVALIDATED_CACHE }],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
