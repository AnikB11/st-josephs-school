"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCarousel } from "@/components/site/use-carousel";

export type GallerySlide = {
  src: string;
  alt: string;
};

/**
 * Horizontal scroll-snap gallery carousel for the homepage hero gallery
 * section. Auto-advances every 5s; pauses on hover/focus, while the tab
 * is hidden, and for users with `prefers-reduced-motion`.
 */
export function GallerySlider({ slides }: { slides: GallerySlide[] }) {
  const { trackRef, canPrev, canNext, scrollByCard, pauseProps } = useCarousel({
    cardSelector: "[data-gallery-card]",
    gapPx: 20,
    autoplayMs: 5000,
  });

  return (
    <div className="relative mt-14" {...pauseProps}>
      <div
        ref={trackRef}
        className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-2 [scrollbar-width:none] sm:-mx-7 sm:px-7 [&::-webkit-scrollbar]:hidden"
        aria-label="Gallery carousel"
      >
        {slides.map((img, i) => (
          <div
            key={i}
            data-gallery-card
            className="group relative w-[88%] shrink-0 snap-start overflow-hidden rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--sand))] shadow-sm sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
            style={{ aspectRatio: "4/3" }}
          >
            {/* Subtle hover overlay (kept faint so it doesn't fight the
                photo). On touch devices the overlay never appears, which
                is intentional — the photo is the point. */}
            <div className="absolute inset-0 z-10 bg-gradient-to-t from-[hsl(var(--ink))]/60 via-transparent to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
            <Image
              src={img.src}
              alt={img.alt}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 88vw"
              className="object-cover transition-transform duration-1000 group-hover:scale-105"
            />
            <div className="absolute bottom-5 left-5 z-20 translate-y-2 opacity-0 transition-all duration-700 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="rounded-full border border-white/15 bg-white/20 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white backdrop-blur-md">
                {img.alt}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          disabled={!canPrev}
          aria-label="Previous photo"
          className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] text-[hsl(var(--ink))] transition-all hover:border-[hsl(var(--primary))]/30 hover:text-[hsl(var(--primary))] disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          disabled={!canNext}
          aria-label="Next photo"
          className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] text-[hsl(var(--ink))] transition-all hover:border-[hsl(var(--primary))]/30 hover:text-[hsl(var(--primary))] disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
