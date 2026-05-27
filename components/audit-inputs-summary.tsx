"use client";

import { useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { ScreenLightbox, type LightboxImage } from "./screen-lightbox";
import type { ScreenInput } from "@/lib/types";

interface Props {
  screens: ScreenInput[];
  context: string;
}

/** Compact reminder of what was audited, shown above the results. Thumbnails
 *  enlarge on click. Hidden in print so the saved PDF stays findings-only. */
export function AuditInputsSummary({ screens, context }: Props) {
  const [showContext, setShowContext] = useState(false);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const trimmed = context.trim();

  const images: LightboxImage[] = screens.map((s, i) => ({
    src: `data:${s.media_type};base64,${s.data}`,
    alt: `Screen ${i}`
  }));

  return (
    <section className="rounded-lg border bg-secondary/20 p-4 print:hidden">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
        Audited
      </p>

      <div className="mt-3 flex flex-wrap gap-3">
        {screens.map((s, i) => (
          <figure key={i} className="space-y-1">
            <button
              type="button"
              onClick={() => setOpenIndex(i)}
              className="block overflow-hidden rounded border bg-card transition-shadow hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              aria-label={`Open Screen ${i}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:${s.media_type};base64,${s.data}`}
                alt={`Screen ${i}`}
                className="h-16 w-auto object-cover"
              />
            </button>
            <figcaption className="text-center text-[10px] text-muted-foreground">
              Screen {i}
            </figcaption>
          </figure>
        ))}
      </div>

      {trimmed && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowContext((v) => !v)}
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
            aria-expanded={showContext}
          >
            {showContext ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
            Context you provided
          </button>
          {showContext && (
            <p className="mt-2 whitespace-pre-wrap rounded-md bg-card p-3 text-xs leading-relaxed text-muted-foreground">
              {trimmed}
            </p>
          )}
        </div>
      )}

      <ScreenLightbox images={images} index={openIndex} onIndexChange={setOpenIndex} />
    </section>
  );
}
