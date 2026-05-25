"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const SCREENS = [0, 1, 2, 3, 4, 5];

export function SampleScreens() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const prev = useCallback(() => {
    setOpenIndex((i) => (i === null || i === 0 ? i : i - 1));
  }, []);

  const next = useCallback(() => {
    setOpenIndex((i) => (i === null || i === SCREENS.length - 1 ? i : i + 1));
  }, []);

  useEffect(() => {
    if (openIndex === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        next();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIndex, prev, next]);

  return (
    <>
      <div className="mt-3 grid grid-cols-3 gap-3 sm:grid-cols-6">
        {SCREENS.map((i) => (
          <figure key={i} className="space-y-1.5">
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="block w-full overflow-hidden rounded-md border bg-card transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Open Screen ${i}`}
            >
              <Image
                src={`/sample/resend/screen-${i}.png`}
                alt={`Screen ${i}`}
                width={300}
                height={200}
                className="h-auto w-full"
              />
            </button>
            <figcaption className="text-center text-xs text-muted-foreground">
              Screen {i}
            </figcaption>
          </figure>
        ))}
      </div>

      <Dialog open={openIndex !== null} onOpenChange={(open) => !open && setOpenIndex(null)}>
        <DialogContent className="max-w-5xl p-3 sm:p-4">
          {openIndex !== null && (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-md border bg-card">
                <Image
                  src={`/sample/resend/screen-${openIndex}.png`}
                  alt={`Screen ${openIndex}`}
                  width={1920}
                  height={1080}
                  className="h-auto w-full"
                  priority
                />
              </div>
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prev}
                  disabled={openIndex === 0}
                  aria-label="Previous screen"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </Button>
                <p className="text-xs text-muted-foreground">
                  Screen {openIndex + 1} of {SCREENS.length} <span className="hidden sm:inline">(arrow keys to navigate)</span>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={next}
                  disabled={openIndex === SCREENS.length - 1}
                  aria-label="Next screen"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
