import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()"
  },
  {
    key: "Content-Security-Policy",
    // Allow Cloudflare Web Analytics beacon. No third-party scripts on /audit.
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' static.cloudflareinsights.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "connect-src 'self' static.cloudflareinsights.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join("; ")
  }
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @react-pdf/renderer ships partially-uncompiled code that breaks the
  // Next.js build/runtime without explicit transpilation.
  transpilePackages: ["@react-pdf/renderer"],
  // We don't want server-side request logs to capture API keys or uploaded content.
  // Vercel's default platform logs don't capture request bodies; we just avoid
  // anything custom that would.
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
  // Don't fail the production build on ESLint warnings — we typecheck strictly.
  eslint: { ignoreDuringBuilds: false },
  typescript: { ignoreBuildErrors: false }
};

export default nextConfig;
