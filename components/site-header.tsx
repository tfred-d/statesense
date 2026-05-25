import Link from "next/link";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-base tracking-tight">StateSense</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/about">About</Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/faq">FAQ</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/audit">New audit</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
}
