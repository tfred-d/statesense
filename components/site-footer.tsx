import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background print:hidden">
      <div className="container py-8 text-sm text-muted-foreground">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p>
            We don&apos;t store your screens or use them to train any model. Your API key
            stays in your browser.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/faq" className="hover:text-foreground">
              FAQ
            </Link>
            <Link href="/about" className="hover:text-foreground">
              About
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
