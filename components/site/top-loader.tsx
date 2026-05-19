"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function TopLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout;

    if (isLoading) {
      setOpacity(1);
      setProgress(15);

      // Fast initial load to 70%, then slow creep
      progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev;
          const step = prev < 70 ? 10 : prev < 85 ? 2 : 0.5;
          return prev + step;
        });
      }, 200);
    } else if (progress > 0) {
      // Finish line
      setProgress(100);
      
      // Fade out after completion
      setTimeout(() => {
        setOpacity(0);
        // Reset after fade out
        setTimeout(() => {
          setProgress(0);
        }, 300);
      }, 300);
    }

    return () => clearInterval(progressInterval);
  }, [isLoading]);

  useEffect(() => {
    // When path or search params change, navigation is complete
    setIsLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore links that open in a new tab or modified clicks
      if (
        target.target === "_blank" ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey ||
        e.altKey
      ) {
        return;
      }

      // Handle internal routing
      if (href.startsWith("/") || href.startsWith(window.location.origin)) {
        const url = new URL(href, window.location.origin);
        const isSamePath = url.pathname === window.location.pathname;
        const isSameQuery = url.search === window.location.search;

        // Only trigger loading if we are actually navigating to a new route
        if (!isSamePath || !isSameQuery) {
          setIsLoading(true);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  if (progress === 0 && opacity === 0) return null;

  return (
    <div
      className="fixed inset-x-0 top-0 z-[99999] pointer-events-none"
      style={{ opacity, transition: "opacity 300ms ease-in-out" }}
    >
      <div
        className="h-[2.5px] bg-[#2563EB] relative"
        style={{
          width: `${progress}%`,
          transition: `width ${isLoading ? "200ms ease-out" : "300ms ease-in-out"}`,
        }}
      >
        <div className="absolute right-0 top-0 h-full w-[100px] bg-transparent" />
      </div>
    </div>
  );
}

export function TopLoader() {
  return (
    <Suspense fallback={null}>
      <TopLoaderInner />
    </Suspense>
  );
}
