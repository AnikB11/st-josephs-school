"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type TabItem = {
  id: string;
  label: string;
  content: ReactNode;
};

/**
 * Sticky horizontal tab nav with same-page content switching.
 * - Hash-based deep linking (?#story syncs active tab)
 * - Only the active panel is mounted (cheap)
 * - Indicator is a single transform-animated bar (no per-tab nodes)
 * - Mobile: horizontally scrollable, touch-friendly
 * - Premium fade/slide between panels via plain CSS
 */
export function TabbedPage({ tabs }: { tabs: TabItem[] }) {
  const [activeId, setActiveId] = useState<string>(tabs[0]?.id ?? "");
  const barRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicator, setIndicator] = useState<{ left: number; width: number }>({
    left: 0,
    width: 0,
  });

  // Read hash on mount + listen for hashchange (back/forward, external links)
  useEffect(() => {
    const apply = () => {
      const h = window.location.hash.replace("#", "");
      if (h && tabs.some((t) => t.id === h)) setActiveId(h);
    };
    apply();
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, [tabs]);

  // Position the active indicator under the active tab.
  const measure = useCallback(() => {
    const bar = barRef.current;
    const btn = buttonRefs.current.get(activeId);
    if (!bar || !btn) return;
    const barRect = bar.getBoundingClientRect();
    const btnRect = btn.getBoundingClientRect();
    setIndicator({
      left: btnRect.left - barRect.left + bar.scrollLeft,
      width: btnRect.width,
    });
    // Scroll the active tab into view on mobile.
    btn.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "nearest" });
  }, [activeId]);

  useLayoutEffect(() => {
    measure();
  }, [measure]);

  useEffect(() => {
    const ro = new ResizeObserver(measure);
    if (barRef.current) ro.observe(barRef.current);
    window.addEventListener("resize", measure);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const onPick = useCallback((id: string) => {
    setActiveId(id);
    // Update hash without scrolling
    if (typeof history !== "undefined") {
      history.replaceState(null, "", `#${id}`);
    }
  }, []);

  const active = tabs.find((t) => t.id === activeId) ?? tabs[0];

  return (
    <>
      {/* Sticky tab bar — sits under the navbar (h-[68px]) */}
      <div
        className="sticky top-[68px] z-30 border-y border-[hsl(var(--border))]/80 bg-[hsl(var(--ivory))]/85 backdrop-blur-xl supports-[backdrop-filter]:bg-[hsl(var(--ivory))]/70"
      >
        <div className="container-wide relative">
          <div
            ref={barRef}
            role="tablist"
            aria-label="Section navigation"
            className="relative flex gap-1 overflow-x-auto py-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          >
            {tabs.map((t) => {
              const isActive = t.id === activeId;
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    if (el) buttonRefs.current.set(t.id, el);
                    else buttonRefs.current.delete(t.id);
                  }}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${t.id}`}
                  id={`tab-${t.id}`}
                  onClick={() => onPick(t.id)}
                  className={cn(
                    "relative shrink-0 rounded-full px-4 py-2.5 text-[13px] font-medium tracking-wide transition-colors",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))]/40",
                    isActive
                      ? "text-[hsl(var(--primary))]"
                      : "text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))]",
                  )}
                >
                  {t.label}
                </button>
              );
            })}
            {/* Animated indicator */}
            <span
              aria-hidden
              className="pointer-events-none absolute bottom-0 h-[2px] rounded-full bg-[hsl(var(--primary))] transition-[transform,width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{
                transform: `translateX(${indicator.left}px)`,
                width: indicator.width,
              }}
            />
          </div>
        </div>
      </div>

      {/* Panel — re-mounts on activeId change to trigger CSS enter animation */}
      <div
        key={active?.id}
        role="tabpanel"
        id={`panel-${active?.id ?? ""}`}
        aria-labelledby={`tab-${active?.id ?? ""}`}
        className="tab-panel-enter"
      >
        {active?.content}
      </div>
    </>
  );
}
