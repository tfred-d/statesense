import { ImageResponse } from "next/og";

// Code-generated social share image (1200×630). Used for og:image and, via
// fallback, twitter:image. To replace with a custom design, drop a PNG at
// app/opengraph-image.png — Next.js prefers the static file over this route.

export const alt = "StateSense — catch the missing states before handoff";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#ffffff",
          padding: 80,
          position: "relative",
          fontFamily: "sans-serif"
        }}
      >
        {/* Top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 14,
            backgroundColor: "#171717"
          }}
        />

        {/* Wordmark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 36,
            fontWeight: 700,
            color: "#171717"
          }}
        >
          StateSense
        </div>

        {/* Headline block, pinned to the bottom */}
        <div style={{ display: "flex", flexDirection: "column", marginTop: "auto" }}>
          <div
            style={{
              display: "flex",
              fontSize: 70,
              fontWeight: 700,
              color: "#171717",
              lineHeight: 1.05,
              letterSpacing: -1.5,
              maxWidth: 1000
            }}
          >
            Catch the missing states before handoff.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 30,
              color: "#525252",
              marginTop: 28,
              maxWidth: 900,
              lineHeight: 1.3
            }}
          >
            Audit your designs for the empty, error, and edge-case states you haven&apos;t
            covered yet.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
