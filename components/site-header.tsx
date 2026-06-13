"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll(); // sync if the page loads already scrolled
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        // border-b is always present (1px reserved, no layout shift); its color
        // fades from transparent to the faint border tone once scrolled.
        "sticky top-0 z-40 border-b bg-background transition-colors print:hidden",
        scrolled ? "border-border" : "border-transparent"
      )}
    >
      <div className="container flex h-14 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <span className="text-base tracking-tight">StateSense</span>
        </Link>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/sample">Sample</Link>
          </Button>
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
