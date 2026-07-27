import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  compress: true,
  devIndicators: false,
  async redirects() {
    return [
      { source: "/decorate", destination: "/photo-overlay-editor", permanent: true },
      { source: "/dot", destination: "/photo-overlay-editor", permanent: true },
      { source: "/moment-card", destination: "/photo-quote-maker", permanent: true },
      { source: "/geometric-patterns", destination: "/geometric-pattern-generator", permanent: true },
      { source: "/dot/app", destination: "/create/dot", permanent: true },
      { source: "/moment-card/app", destination: "/create/moment-card", permanent: true },
      { source: "/polka-dot/app", destination: "/create/polka-dot", permanent: true },
      { source: "/geometric-patterns/app", destination: "/create/geometric-patterns", permanent: true },
    ];
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

export default nextConfig;
