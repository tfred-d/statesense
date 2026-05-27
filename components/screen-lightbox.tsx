"use client";

import { useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface LightboxImage {
  src: string;
  alt: string;
}

interface Props {
  images: LightboxImage[];
  /** Currently-open image index, or null when closed. Controlled by the parent. */
  index: number | null;
  onIndexChange: (i: number | null) => void;
}

/**
 * Shared enlarge-on-click viewer. Works with any image src (public URLs or
 * base64 data URLs). Supports prev/next buttons and ArrowLeft/ArrowRight keys
 * when more than one image is present.
 */
export function ScreenLightbox({ images, index, onIndexChange }: Props) {
  const prev = useCallback(() => {
    if (index === null || index === 0) return;
    onIndexChange(index - 1);
  }, [index, onIndexChange]);

  const next = useCallback(() => {
    if (index === null || index === images.length - 1) return;
    onIndexChange(index + 1);
  }, [index, images.length, onIndexChange]);

  useEffect(() => {
    if (index === null) return;
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
  }, [index, prev, next]);

  return (
    <Dialog open={index !== null} onOpenChange={(o) => !o && onIndexChange(null)}>
      <DialogContent className="max-w-5xl p-3 sm:p-4">
        {index !== null && (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-md border bg-card">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={images[index].src} alt={images[index].alt} className="h-auto w-full" />
            </div>
            {images.length > 1 && (
              <div className="flex items-center justify-between gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={prev}
                  disabled={index === 0}
                  aria-label="Previous screen"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </Button>
                <p className="text-xs text-muted-foreground">
                  {index + 1} of {images.length}{" "}
                  <span className="hidden sm:inline">(arrow keys to navigate)</span>
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={next}
                  disabled={index === images.length - 1}
                  aria-label="Next screen"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
