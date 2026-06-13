import Link from "next/link";
import { ArrowRight, Crosshair, KeyRound, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  { n: 1, title: "Add your key", body: "Stored locally in your browser." },
  { n: 2, title: "Upload screens", body: "1 to 6 of them, in order." },
  { n: 3, title: "Describe the feature", body: "Type a few lines or drop a PRD." },
  { n: 4, title: "Get the audit", body: "About 15 seconds." }
];

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="hero-grid">
        <div className="container py-24 sm:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Catch the missing states before handoff.
            </h1>
            <p className="mx-auto mt-5 max-w-lg text-balance text-lg leading-relaxed text-muted-foreground">
              Get a checklist of the empty, error, and edge cases your design hasn&apos;t
              covered yet.
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
        </div>
      </section>

      {/* Value props */}
      <section className="bg-secondary/40 py-14">
        <div className="container grid grid-cols-1 gap-10 md:grid-cols-3">
          <div>
            <Crosshair className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <h3 className="mt-3 font-semibold">Specific</h3>
            <p className="mt-1 text-balance text-sm text-muted-foreground">
              Every finding points to a screen and an element. No vague advice.
            </p>
          </div>
          <div>
            <KeyRound className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <h3 className="mt-3 font-semibold">No signup</h3>
            <p className="mt-1 text-balance text-sm text-muted-foreground">
              No account, no waitlist. Bring your own API key and you&apos;re in.
            </p>
          </div>
          <div>
            <ShieldCheck className="h-6 w-6 text-primary" strokeWidth={1.5} />
            <h3 className="mt-3 font-semibold">Private</h3>
            <p className="mt-1 text-balance text-sm text-muted-foreground">
              Your screens aren&apos;t stored, and they&apos;re never used to train any model.
            </p>
          </div>
        </div>
      </section>

      {/* How it works — timeline (horizontal on desktop, vertical on mobile) */}
      <section className="container py-16">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-left">
          How it works
        </h2>
        <div className="relative mt-10">
          {/* Desktop: horizontal line, node-center to node-center (nodes centered
              in 25%-wide columns → 12.5% and 87.5%). */}
          <div
            className="absolute left-[12.5%] right-[12.5%] top-4 hidden h-px bg-border sm:block"
            aria-hidden
          />
          <ol className="grid grid-cols-1 gap-8 sm:grid-cols-4 sm:gap-6">
            {STEPS.map((s, idx) => (
              <li key={s.n} className="relative flex flex-col items-center text-center">
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                  {s.n}
                </div>
                <h3 className="mt-4 font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
                {/* Mobile connector: from the base of this step down to the top
                    of the next node (spans the gap-8 = 2rem gutter). */}
                {idx < STEPS.length - 1 && (
                  <span
                    className="absolute left-1/2 top-full h-8 w-px -translate-x-1/2 bg-border sm:hidden"
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* CTA — dark card, contained on desktop, full-bleed on mobile */}
      <section className="py-16">
        <div className="container">
          <div className="-mx-6 bg-primary px-6 py-14 text-center text-primary-foreground sm:mx-0 sm:rounded-2xl">
            <h2 className="text-2xl font-semibold tracking-tight">Audit your next feature.</h2>
            <p className="mx-auto mt-2 max-w-md text-balance text-sm text-primary-foreground/70">
              Drop in your screens. See what an extra pair of eyes would catch.
            </p>
            <Button size="lg" variant="secondary" className="mt-5" asChild>
              <Link href="/audit">
                Run an audit <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
