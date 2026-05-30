"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Shared scroll-snap carousel logic for horizontal card/image strips.
 *
 *  - Tracks `canPrev` / `canNext` from the actual scroll position (with 2px
 *    slack to defeat subpixel rounding at the bounds).
 *  - `scrollByCard` measures the first card via the supplied selector so
 *    the step matches whatever responsive width the card is currently at.
 *  - Optional autoplay: ticks every `autoplayMs`, wraps from end → start,
 *    pauses on hover/focus, when the tab is hidden, and when the user has
 *    `prefers-reduced-motion`. Spread `pauseProps` onto the wrapping
 *    container to wire the hover/focus pause.
 */
export function useCarousel({
  cardSelector,
  gapPx,
  autoplayMs,
}: {
  cardSelector: string;
  gapPx: number;
  autoplayMs?: number;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const [paused, setPaused] = useState(false);

  const measure = useCallback(() => {
    const t = trackRef.current;
    if (!t) return;
    setCanPrev(t.scrollLeft > 2);
    setCanNext(t.scrollLeft + t.clientWidth < t.scrollWidth - 2);
  }, []);

  useEffect(() => {
    measure();
    const t = trackRef.current;
    if (!t) return;
    t.addEventListener("scroll", measure, { passive: true });
    const ro = new ResizeObserver(measure);
    ro.observe(t);
    return () => {
      t.removeEventListener("scroll", measure);
      ro.disconnect();
    };
  }, [measure]);

  const scrollByCard = useCallback(
    (direction: 1 | -1) => {
      const t = trackRef.current;
      if (!t) return;
      const firstCard = t.querySelector<HTMLElement>(cardSelector);
      const cardWidth = firstCard?.getBoundingClientRect().width ?? 320;
      t.scrollBy({ left: direction * (cardWidth + gapPx), behavior: "smooth" });
    },
    [cardSelector, gapPx],
  );

  // Autoplay tick. Wraps from end → start with a smooth scroll back so the
  // jump doesn't feel jarring. Skipped entirely when paused or when the user
  // has asked the OS for reduced motion.
  useEffect(() => {
    if (!autoplayMs || paused) return;
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const id = setInterval(() => {
      const t = trackRef.current;
      if (!t) return;
      const atEnd = t.scrollLeft + t.clientWidth >= t.scrollWidth - 4;
      if (atEnd) {
        t.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        scrollByCard(1);
      }
    }, autoplayMs);
    return () => clearInterval(id);
  }, [autoplayMs, paused, scrollByCard]);

  // Don't burn frames advancing a carousel on a hidden tab.
  useEffect(() => {
    if (!autoplayMs) return;
    const onVis = () => setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [autoplayMs]);

  const pauseProps = autoplayMs
    ? {
        onMouseEnter: () => setPaused(true),
        onMouseLeave: () => setPaused(false),
        onFocus: () => setPaused(true),
        onBlur: () => setPaused(false),
      }
    : {};

  return { trackRef, canPrev, canNext, scrollByCard, pauseProps };
}
