import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About · StateSense"
};

export default function AboutPage() {
  return (
    <div className="container max-w-2xl py-12">
      <h1 className="text-3xl font-bold tracking-tight">About StateSense</h1>

      <section className="mt-6 space-y-3 text-sm leading-relaxed">
        <p>
          Designers focus on the happy path. Real users hit failure paths — empty inboxes,
          expired sessions, dropped connections, long names, edge counts. Those gaps usually
          surface late, when engineering is already building.
        </p>
        <p>
          StateSense applies a hand-curated library of 65 UX heuristics to your screens and
          flow, anchored to specific elements, and tells you what&apos;s missing before
          handoff. Not a generic AI prompt — a structured, opinionated audit.
        </p>
      </section>

      <h2 className="mt-10 text-lg font-semibold">How findings are scoped</h2>
      <ul className="mt-3 space-y-2 text-sm">
        <li>
          <strong>Screen scope</strong> — single-screen issues (missing empty state, no loading
          frame, undesigned error state, etc.). Always active.
        </li>
        <li>
          <strong>Flow scope</strong> — issues across multiple screens (missing step, no back
          path, state lost between screens). Activates with 2+ screens.
        </li>
        <li>
          <strong>PRD alignment</strong> — design vs. stated requirements (features missing,
          design contradicts the PRD, journey incomplete). Activates when you upload context.
        </li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold">How findings are framed</h2>
      <ul className="mt-3 space-y-2 text-sm">
        <li>
          <strong>Gap</strong> — the state is provably absent. Directive: &ldquo;Add X.&rdquo;
        </li>
        <li>
          <strong>Recommendation</strong> — better answer in most cases. &ldquo;Consider X.&rdquo;
        </li>
        <li>
          <strong>Question</strong> — may be intentional. &ldquo;Is there a reason X?&rdquo;
        </li>
      </ul>

      <h2 className="mt-10 text-lg font-semibold">The library is the product</h2>
      <p className="mt-3 text-sm leading-relaxed">
        We invest disproportionately in the heuristics themselves — they&apos;re what
        distinguishes StateSense from a generic prompt against any LLM. Every heuristic must
        produce findings a designer can act on by changing something visible in the design.
        If the fix lives in code, the heuristic doesn&apos;t belong here.
      </p>

      <div className="mt-10">
        <Button asChild>
          <Link href="/audit">Try it</Link>
        </Button>
      </div>
    </div>
  );
}
