import { ImageResponse } from "next/og";

export const alt = "Paper Dots — Decorate your photos with paper textures and scattered dots";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#FFF7FA",
          position: "relative",
          overflow: "hidden",
          fontFamily: "sans-serif",
        }}
      >
        {/* Decorative dots — top right */}
        {[
          { top: 32, right: 60, size: 10, opacity: 0.18 },
          { top: 56, right: 32, size: 6, opacity: 0.12 },
          { top: 20, right: 110, size: 7, opacity: 0.14 },
          { top: 80, right: 80, size: 5, opacity: 0.10 },
        ].map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              top: d.top,
              right: d.right,
              width: d.size,
              height: d.size,
              borderRadius: "50%",
              background: "#F39EB6",
              opacity: d.opacity,
              display: "flex",
            }}
          />
        ))}

        {/* Decorative dots — bottom left */}
        {[
          { bottom: 40, left: 40, size: 9, opacity: 0.15 },
          { bottom: 70, left: 72, size: 6, opacity: 0.10 },
          { bottom: 20, left: 80, size: 5, opacity: 0.12 },
          { bottom: 60, left: 20, size: 7, opacity: 0.10 },
        ].map((d, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              bottom: d.bottom,
              left: d.left,
              width: d.size,
              height: d.size,
              borderRadius: "50%",
              background: "#F39EB6",
              opacity: d.opacity,
              display: "flex",
            }}
          />
        ))}

        {/* Left: product image */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 580,
            height: 630,
            paddingLeft: 56,
            paddingRight: 36,
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 8px 40px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)",
              width: "100%",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${base}/hero-before-after.png`}
              alt=""
              width={488}
              height={274}
              style={{ width: "100%", display: "block", objectFit: "cover" }}
            />
          </div>
        </div>

        {/* Right: branding */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingRight: 64,
            gap: 0,
          }}
        >
          {/* Logo + name */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${base}/logo.png`}
              alt="Paper Dots"
              width={48}
              height={48}
              style={{ borderRadius: 10, display: "block" }}
            />
            <span
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "#1a1a2e",
                letterSpacing: "-0.5px",
              }}
            >
              Paper Dots
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontSize: 48,
              fontWeight: 700,
              color: "#1a1a2e",
              lineHeight: 1.15,
              letterSpacing: "-1px",
              marginBottom: 20,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>Decorate your</span>
            <span>photos instantly.</span>
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: 20,
              color: "#64748b",
              marginBottom: 36,
              display: "flex",
            }}
          >
            Paper textures &amp; scattered dots.
          </div>

          {/* Pills */}
          <div style={{ display: "flex", gap: 10 }}>
            {["Free", "No sign-up", "Instant"].map((label) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  padding: "8px 18px",
                  borderRadius: 999,
                  background: "rgba(243,158,182,0.08)",
                  color: "#F39EB6",
                  fontSize: 15,
                  fontWeight: 500,
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom accent bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "#F39EB6",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
