import { ImageResponse } from "next/og";

// Browser-tab favicon. StateSense is a wordmark-only brand, so the favicon
// uses an "S" monogram as a compact device (the full wordmark is illegible at
// 32px). Black square (#171717, matching --primary) + white "S".
// To replace with a hand-designed mark, drop a favicon.ico or icon.png in
// app/ and delete this file — the static file takes precedence.

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#171717",
          borderRadius: 7,
          color: "#fafafa",
          fontSize: 24,
          fontWeight: 700,
          fontFamily: "sans-serif",
          // Optical nudge so the "S" sits dead-center.
          lineHeight: 1,
          paddingBottom: 1
        }}
      >
        S
      </div>
    ),
    { ...size }
  );
}
