import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultsView } from "@/components/results-view";
import { SampleScreens } from "@/components/sample-screens";
import { SAMPLE_RESEND_AUDIT } from "@/lib/sample-audit";

export const metadata: Metadata = {
  title: "Sample audit · StateSense",
  description:
    "See an actual StateSense audit on Resend's email-details flow. 11 findings across screen and flow scope."
};

export default function SamplePage() {
  return (
    <div className="container max-w-3xl py-10">
      <div className="rounded-lg border bg-secondary/30 p-4 text-sm">
        <p className="font-medium">This is a sample audit.</p>
        <p className="mt-1 text-muted-foreground">
          We ran StateSense on Resend&apos;s &ldquo;Sent Email Details&rdquo; flow. The 6 screens
          are below — click any to enlarge. The findings are below that.{" "}
          <Link href="/audit" className="font-medium text-primary underline-offset-4 hover:underline">
            Run your own audit →
          </Link>
        </p>
      </div>

      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-sm font-semibold tracking-tight">Screens audited</h2>
          <p className="text-xs text-muted-foreground">
            Screens via{" "}
            <a
              href="https://mobbin.com"
              target="_blank"
              rel="noreferrer"
              className="underline-offset-4 hover:underline"
            >
              Mobbin
            </a>
          </p>
        </div>
        <SampleScreens />
      </section>

      <section className="mt-10">
        <ResultsView result={SAMPLE_RESEND_AUDIT} />
      </section>

      <section className="mt-12 rounded-lg border bg-card p-6 text-center">
        <h2 className="text-xl font-semibold tracking-tight">Try it on your own design.</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Drop in your screens, get a list of states you haven&apos;t covered.
        </p>
        <Button size="lg" className="mt-4" asChild>
          <Link href="/audit">
            Run an audit <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
