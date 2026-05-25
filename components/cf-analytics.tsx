// Cloudflare Web Analytics — free, cookieless, privacy-friendly.
// Server component: the <script> tag is included at SSR time so there's no
// JS-side state. If the token isn't set, the component renders nothing.

export function CloudflareAnalytics() {
  const token = process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;
  if (!token) return null;

  return (
    <script
      defer
      src="https://static.cloudflareinsights.com/beacon.min.js"
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
