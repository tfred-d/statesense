"use client";

import { useState } from "react";
import Image from "next/image";
import { ScreenLightbox, type LightboxImage } from "./screen-lightbox";

const SCREENS = [0, 1, 2, 3, 4, 5];

const IMAGES: LightboxImage[] = SCREENS.map((i) => ({
  src: `/sample/resend/screen-${i}.png`,
  alt: `Screen ${i}`
}));

export function SampleScreens() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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

      <ScreenLightbox images={IMAGES} index={openIndex} onIndexChange={setOpenIndex} />
    </>
  );
}
