"use client";

import Link from "next/link";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  FileText,
  Megaphone,
  Pin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { useCarousel } from "@/components/site/use-carousel";

export type NoticeCard = {
  id: string;
  title: string;
  slug: string;
  category: string;
  is_pinned: boolean | null;
  published_at: string;
  body: string | null;
  pdf_url: string | null;
};

/**
 * Horizontal scroll-snap carousel for the homepage notices hero section.
 * Renders every available notice. Auto-advances every 5s; pauses on hover,
 * focus, when the tab is hidden, and for users with `prefers-reduced-motion`.
 */
export function NoticesSlider({ notices }: { notices: NoticeCard[] }) {
  const { trackRef, canPrev, canNext, scrollByCard, pauseProps } = useCarousel({
    cardSelector: "[data-notice-card]",
    gapPx: 20,
    autoplayMs: 5000,
  });

  return (
    <div className="relative mt-14" {...pauseProps}>
      <div
        ref={trackRef}
        className="-mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-2 [scrollbar-width:none] sm:-mx-7 sm:px-7 [&::-webkit-scrollbar]:hidden"
        aria-label="Notices carousel"
      >
        {notices.map((n) => (
          <Link
            key={n.id}
            href={`/notices/${n.slug}`}
            data-notice-card
            className="group block w-[85%] shrink-0 snap-start sm:w-[calc((100%-1.25rem)/2)] lg:w-[calc((100%-2.5rem)/3)]"
          >
            <article className="h-full rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] p-7 transition-all hover:-translate-y-1 hover:border-[hsl(var(--primary))]/30 hover:shadow-[0_24px_50px_-30px_rgba(15,23,42,0.25)]">
              <div className="flex items-center gap-2">
                <Badge
                  variant={n.is_pinned ? "default" : "secondary"}
                  className={
                    n.is_pinned
                      ? "bg-[hsl(var(--primary))] text-[hsl(var(--ivory))]"
                      : ""
                  }
                >
                  {n.is_pinned && <Pin className="mr-1 h-3 w-3" />}
                  {n.category}
                </Badge>
                <span
                  className="text-xs text-[hsl(var(--ink-soft))]"
                  suppressHydrationWarning
                >
                  {formatDate(n.published_at)}
                </span>
              </div>
              <h3 className="font-display mt-5 line-clamp-2 text-xl font-semibold leading-snug text-[hsl(var(--ink))] group-hover:text-[hsl(var(--primary))]">
                {n.title}
              </h3>
              {n.body && (
                <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-[hsl(var(--ink-soft))]">
                  {n.body}
                </p>
              )}
              <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-[hsl(var(--primary))]">
                {n.pdf_url ? (
                  <>
                    <FileText className="h-3.5 w-3.5" /> Read PDF
                  </>
                ) : (
                  <>
                    <Megaphone className="h-3.5 w-3.5" /> Read notice
                  </>
                )}
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </article>
          </Link>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
          disabled={!canPrev}
          aria-label="Previous notice"
          className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] text-[hsl(var(--ink))] transition-all hover:border-[hsl(var(--primary))]/30 hover:text-[hsl(var(--primary))] disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollByCard(1)}
          disabled={!canNext}
          aria-label="Next notice"
          className="grid h-10 w-10 place-items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--ivory))] text-[hsl(var(--ink))] transition-all hover:border-[hsl(var(--primary))]/30 hover:text-[hsl(var(--primary))] disabled:pointer-events-none disabled:opacity-30"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
