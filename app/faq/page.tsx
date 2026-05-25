import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ · StateSense"
};

const faqs = [
  {
    q: "Why bring my own API key?",
    a: "Anthropic charges per call. Routing audits through your key means StateSense costs nothing to run, which is how we keep it free for everyone. Each audit costs roughly $0.05 to $0.20 depending on screen count."
  },
  {
    q: "Is my key safe?",
    a: "It lives in your browser's localStorage. We send it on the call to our API route, which uses it as the bearer token to Anthropic and then forgets it. We don't log, store, or transmit it anywhere else."
  },
  {
    q: "Do my screens get stored?",
    a: "No. They pass through our server in memory only, long enough to attach the audit prompt, then they're handed to Anthropic. Anthropic doesn't use API inputs for training."
  },
  {
    q: "Why only Responsive Web?",
    a: "v1 ships with a single platform with a strong heuristic library. iOS and Android are visible in the platform selector but disabled. They'll activate when the libraries are ready."
  },
  {
    q: "How many screens can I upload?",
    a: "1 to 6 screens, up to 5 MB each. Order matters: they're numbered as uploaded. Flow-scope heuristics activate when you upload two or more."
  },
  {
    q: "What does the feature context do?",
    a: "It activates the intent scope, which checks that the design serves the features and constraints stated in your description or PRD. Without context, only screen and flow scopes apply."
  },
  {
    q: "Can I share an audit?",
    a: "Not as a live link in v1. Export to Markdown, PDF, or JSON and share the file. We don't store audits on the server. That's the privacy promise."
  },
  {
    q: "What if a finding is wrong?",
    a: "Mark it thumbs-down. The state stays in your browser; nothing's collected on our side. Over time, low-rated heuristics will get tightened or cut."
  }
];

export default function FaqPage() {
  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl font-bold tracking-tight">FAQ</h1>
      <div className="mt-8 space-y-6">
        {faqs.map((f) => (
          <section key={f.q}>
            <h2 className="text-base font-semibold">{f.q}</h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
          </section>
        ))}
      </div>
    </div>
  );
}
