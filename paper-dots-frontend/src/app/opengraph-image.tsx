import { ImageResponse } from "next/og";

// TODO: replace with real Paper Dots OG alt text
export const alt = "Paper Dots";
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
          flexDirection: "row",
          background: "#fafafa",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Left: hero illustration */}
        <div
          style={{
            display: "flex",
            width: 620,
            height: 630,
            flexShrink: 0,
            overflow: "hidden",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${base}/hero-booth.png`}
            alt=""
            width={620}
            height={630}
            style={{ objectFit: "contain" }}
          />
        </div>

        {/* Right: branding + copy */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            paddingLeft: 40,
            paddingRight: 64,
          }}
        >
          {/* Brand name image */}
          <div style={{ display: "flex", marginBottom: 28 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`${base}/brand.png`}
              alt="Paper Dots"
              width={248}
              height={88}
            />
          </div>

          {/* Main title */}
          <div
            style={{
              display: "flex",
              fontSize: 54,
              fontWeight: 800,
              color: "#1a1a1a",
              lineHeight: 1.15,
              marginBottom: 20,
              fontFamily: "sans-serif",
            }}
          >
            Paper Dots
          </div>

          {/* Tagline */}
          <div
            style={{
              display: "flex",
              fontSize: 22,
              color: "#6b6b6b",
              fontFamily: "sans-serif",
            }}
          >
            No app needed · Free · Instant download
          </div>
        </div>

        {/* Bottom accent line */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 6,
            background: "#1a1a1a",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
