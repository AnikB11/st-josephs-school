"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "up" | "left" | "right" | "scale" | "fade";

const VARIANT_CLASS: Record<Variant, string> = {
  up: "reveal reveal-up",
  left: "reveal reveal-left",
  right: "reveal reveal-right",
  scale: "reveal reveal-scale",
  fade: "reveal",
};

export function Reveal({
  variant = "up",
  delay = 0,
  className,
  children,
  once = true,
  amount = 0.15,
}: {
  variant?: Variant;
  delay?: number;
  className?: string;
  children: ReactNode;
  once?: boolean;
  amount?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          if (once) io.disconnect();
        } else if (!once) {
          setShown(false);
        }
      },
      { threshold: amount, rootMargin: "-40px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [once, amount]);

  return (
    <div
      ref={ref}
      className={cn(VARIANT_CLASS[variant], className)}
      data-shown={shown ? "true" : "false"}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}

/**
 * Stagger children — each direct child renders with an increasing delay.
 * Children should be wrappable; this clones them and adds a style delay.
 */
export function Stagger({
  children,
  step = 0.08,
  initial = 0,
  className,
}: {
  children: ReactNode;
  step?: number;
  initial?: number;
  className?: string;
}) {
  const arr = Array.isArray(children) ? children : [children];
  return (
    <div className={className}>
      {arr.map((child, i) => (
        <Reveal key={i} delay={initial + i * step}>
          {child}
        </Reveal>
      ))}
    </div>
  );
}
