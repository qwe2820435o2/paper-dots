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

/** Media library host for the headless WordPress blog, derived from the same env var
 *  `src/lib/wordpress.ts` reads so the two can never drift apart. WordPress returns absolute
 *  URLs on its own origin for uploaded images, and `next/image` refuses any host not listed
 *  here. */
const WP_MEDIA_HOST = new URL(
  process.env.WORDPRESS_API_URL ?? "https://wordpress-dot.up.railway.app/wp-json/wp/v2"
).hostname;

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: WP_MEDIA_HOST,
        // Wide enough to cover a theme- or plugin-served image, narrow enough that the
        // optimizer still cannot be pointed at arbitrary paths on the host.
        pathname: "/wp-content/**",
      },
    ],
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
