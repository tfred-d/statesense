import Link from "next/link";
import { ArrowRight, Check, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="container py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Find the missing states in your designs before handoff.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            StateSense audits app designs for unhappy-path gaps — empty states, error frames,
            offline behavior, missing flow steps — against a curated library of 65 UX heuristics.
            Free, browser-only, bring your own Anthropic key.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/audit">
                Start an audit <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/about">How it works</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            ~$0.05–$0.20 per audit on your Anthropic key · no signup required
          </p>
        </div>
      </section>

      {/* Value props */}
      <section className="border-t border-border bg-secondary/30 py-16">
        <div className="container grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <Zap className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-semibold">One audit, dozens of catches</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Every audit applies all relevant heuristics from the library — loading, error,
              empty, auth, validation, flow continuity, PRD alignment — anchored to specific
              screens and elements.
            </p>
          </div>
          <div>
            <ShieldCheck className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-semibold">Your screens never touch our servers</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              StateSense is a thin pass-through. Your screens go from your browser to Anthropic
              and back. Nothing is stored, nothing is logged, nothing trains a model.
            </p>
          </div>
          <div>
            <Check className="h-6 w-6 text-primary" />
            <h3 className="mt-3 font-semibold">Designer-shown, not engineer-implemented</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Every finding is fixable in the design file. We don&apos;t flag code concerns
              dressed up as design audits.
            </p>
          </div>
        </div>
      </section>

      {/* How */}
      <section className="container py-16">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <ol className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4">
          {[
            { n: 1, title: "Add your key", body: "Paste your Anthropic API key. Stored only in your browser." },
            { n: 2, title: "Upload screens", body: "1–6 PNG / JPG / WEBP files. Order matters." },
            { n: 3, title: "Add context", body: "Paste a PRD or short description (optional but unlocks PRD-alignment checks)." },
            { n: 4, title: "Run audit", body: "10–15 seconds. Findings grouped by scope, sortable by severity." }
          ].map((s) => (
            <li key={s.n} className="rounded-lg border bg-card p-5">
              <div className="text-xs font-semibold text-muted-foreground">Step {s.n}</div>
              <h3 className="mt-1 font-semibold">{s.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-14">
        <div className="container text-center">
          <h2 className="text-2xl font-semibold tracking-tight">Try it on a real flow</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Bring a Figma export of a feature you&apos;re about to hand off. See what an extra
            pair of eyes would catch.
          </p>
          <Button size="lg" className="mt-5" asChild>
            <Link href="/audit">
              Start an audit <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
