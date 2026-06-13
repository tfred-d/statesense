import { ImageResponse } from "next/og";

// Apple touch icon (iOS home screen / bookmarks / shared links). 180×180.
// iOS applies its own rounded-corner mask, so we render a full-bleed black
// square with the "S" monogram and let the OS round it.

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
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
          color: "#fafafa",
          fontSize: 120,
          fontWeight: 700,
          fontFamily: "sans-serif",
          lineHeight: 1,
          paddingBottom: 6
        }}
      >
        S
      </div>
    ),
    { ...size }
  );
}
