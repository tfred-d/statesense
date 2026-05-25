import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="container py-24 sm:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Catch the missing states before handoff.
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            Upload your screens. Get a checklist of the empty, error, and edge-case
            states your design hasn&apos;t covered yet.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/audit">
                Run an audit <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sample">See a sample</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Value props */}
      <section className="border-t border-border bg-secondary/30 py-14">
        <div className="container grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <h3 className="font-semibold">Specific</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Every finding points to a screen and an element. No vague advice.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Costs cents</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Bring your own Anthropic key. About 5 to 20 cents per audit.
            </p>
          </div>
          <div>
            <h3 className="font-semibold">Private</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Your screens go to Anthropic for analysis only. Never stored, never used to train.
            </p>
          </div>
        </div>
      </section>

      {/* How */}
      <section className="container py-16">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <ol className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-4">
          {[
            { n: 1, title: "Add your key", body: "Anthropic API key, stored in your browser." },
            { n: 2, title: "Upload screens", body: "1 to 6 of them, in order." },
            { n: 3, title: "Describe the feature", body: "Type a few lines or drop a PRD." },
            { n: 4, title: "Get the audit", body: "About 15 seconds." }
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
          <h2 className="text-2xl font-semibold tracking-tight">Audit your next feature.</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Drop in your screens. See what an extra pair of eyes would catch.
          </p>
          <Button size="lg" className="mt-5" asChild>
            <Link href="/audit">
              Run an audit <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
