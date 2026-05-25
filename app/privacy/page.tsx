import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy · StateSense",
  description: "What we collect, what we don't, and where your data goes."
};

export default function PrivacyPage() {
  return (
    <article className="container max-w-2xl py-12 prose prose-neutral">
      <h1 className="text-3xl font-bold tracking-tight">Privacy</h1>
      <p className="mt-2 text-muted-foreground">
        StateSense is designed so we see as little of your data as possible. The short version:
      </p>

      <blockquote className="my-6 border-l-4 border-primary bg-secondary/40 p-4 not-italic">
        Your screens are sent to Anthropic for analysis, never stored by us, and never used to
        train any model. Your API key stays in your browser.
      </blockquote>

      <h2 className="mt-10 text-xl font-semibold">What stays in your browser</h2>
      <ul className="mt-2 space-y-2 text-sm">
        <li>
          <strong>Your Anthropic API key.</strong> Stored in <code>localStorage</code>. Used only
          as the auth header when we call Anthropic on your behalf. Click <em>Forget my key</em>{" "}
          at any time to remove it.
        </li>
        <li>
          <strong>Thumbs up / down on findings.</strong> Stored locally. Aggregate counts (no
          text) are sent to our analytics so we can track if findings are useful.
        </li>
        <li>
          <strong>Dismissed findings.</strong> Stored locally. We never see which findings you
          dismiss.
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold">What touches our server</h2>
      <ul className="mt-2 space-y-2 text-sm">
        <li>
          <strong>Your screens and context, in transit.</strong> Our Next.js API route attaches
          the analysis prompt to your request and forwards it to Anthropic. We do not log
          request bodies. The route runs on Vercel; the screens are held in memory only for the
          duration of the request, then discarded.
        </li>
        <li>
          <strong>Your API key, in transit.</strong> Sent as a header on the request to our
          route. We do not log headers, do not store the key, and do not use it for anything
          other than the one audit you triggered.
        </li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold">What we send to Anthropic</h2>
      <p className="mt-2 text-sm">
        Your screens (as base64 images), your context (if you provided one), the audit prompt
        (our heuristic library), and your API key as the bearer token. Anthropic&apos;s API
        policy: API inputs are not used to train models.
      </p>

      <h2 className="mt-10 text-xl font-semibold">What we measure</h2>
      <p className="mt-2 text-sm">
        Aggregate page views and audit-completion counts via Cloudflare Web Analytics
        (cookieless, no PII). Never finding text, never screens, never your key.
      </p>

      <h2 className="mt-10 text-xl font-semibold">If you have concerns</h2>
      <p className="mt-2 text-sm">
        The whole thing is built so you don&apos;t need to take our word for it — open the
        DevTools Network tab during an audit and watch exactly what gets sent.
      </p>
    </article>
  );
}
