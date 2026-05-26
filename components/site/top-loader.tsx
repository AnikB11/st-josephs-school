"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/**
 * Minimal top-of-page progress bar. Uses a single CSS transform — no
 * keyframes, no framer-motion. Avoids the "bar jumps from 20% to 100%"
 * jitter that comes from a slow trickle outlasting a fast navigation.
 *
 * Phases:
 *  idle      → bar invisible, scaleX 0
 *  loading   → bar climbs smoothly toward 85% over 1.5s, then holds
 *  complete  → bar snaps to 100% in 150ms, fades out
 */

type Phase = "idle" | "loading" | "complete";

const BAR_COLOR = "hsl(217, 91%, 60%)";

export function TopLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [phase, setPhase] = useState<Phase>("idle");

  const loadingUrl = useRef<string | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const start = useCallback((url: string) => {
    if (loadingUrl.current === url) return;
    loadingUrl.current = url;
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    setPhase("loading");
  }, []);

  const complete = useCallback(() => {
    loadingUrl.current = null;
    setPhase("complete");
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    // Match the fade-out duration below (300ms) so the element unmounts
    // only after it's fully transparent.
    fadeTimer.current = setTimeout(() => setPhase("idle"), 300);
  }, []);

  // Intercept <a> clicks to detect navigation start instantly.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement)?.closest("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (anchor.target === "_blank") return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      try {
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname && url.search === window.location.search) return;
        start(url.pathname + url.search);
      } catch {
        /* ignore */
      }
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, [start]);

  // Complete when the route changes.
  useEffect(() => {
    if (phase === "loading") complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  useEffect(() => () => {
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
  }, []);

  if (phase === "idle") return null;

  const scaleX = phase === "loading" ? 0.85 : 1;
  const opacity = phase === "complete" ? 0 : 1;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[99999] h-[2px]"
      style={{
        opacity,
        transition: "opacity 300ms ease-out",
      }}
    >
      <div
        className="h-full w-full origin-left"
        style={{
          background: BAR_COLOR,
          transform: `scaleX(${scaleX})`,
          // Slow ease while loading (1.5s to 85%), snappy finish (150ms).
          transition:
            phase === "loading"
              ? "transform 1500ms cubic-bezier(0.1, 0.7, 0.1, 1)"
              : "transform 150ms ease-out",
          boxShadow: "0 0 6px hsla(217, 91%, 60%, 0.45)",
        }}
      />
    </div>
  );
}
