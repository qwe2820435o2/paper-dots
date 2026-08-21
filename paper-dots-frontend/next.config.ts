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
];

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
    const rootHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "X-Frame-Options", value: "DENY" },
      { key: "X-XSS-Protection", value: "1; mode=block" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    ];

    if (process.env.DISABLE_INDEXING === "true") {
      rootHeaders.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    }

    return [
      {
        source: "/:path*",
        headers: rootHeaders,
      },
      {
        source: "/papers/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/:path(.*\\.(?:png|webp|svg|ico|jpg|jpeg|woff2))",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);
