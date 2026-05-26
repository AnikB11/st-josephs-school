"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SCHOOL } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let last = window.scrollY > 8;
    setScrolled(last);
    const onScroll = () => {
      const next = window.scrollY > 8;
      if (next !== last) {
        last = next;
        setScrolled(next);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-500",
        scrolled
          ? "border-b border-[hsl(var(--border))]/80 bg-[hsl(var(--ivory))]/85 backdrop-blur-xl supports-[backdrop-filter]:bg-[hsl(var(--ivory))]/75 shadow-[0_8px_30px_-12px_rgba(15,23,42,0.08)]"
          : "bg-transparent",
      )}
    >
      <div className="container-wide flex h-[68px] items-center justify-between">
        {/* School crest */}
        <Link href="/" aria-label={SCHOOL.name} className="group inline-flex shrink-0">
          <Image
            src="/logo.png"
            alt={SCHOOL.name}
            width={200}
            height={200}
            priority
            className="h-12 w-auto transition-transform group-hover:scale-[1.03] sm:h-14"
          />
        </Link>

        <nav className="hidden lg:flex items-center gap-2">
          {NAV_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname?.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                className={cn(
                  "nav-underline px-3 py-1.5 text-[14px] font-medium tracking-wide transition-colors",
                  active
                    ? "text-[hsl(var(--primary))]"
                    : "text-[hsl(var(--ink-soft))] hover:text-[hsl(var(--ink))]",
                )}
                data-active={active ? "true" : "false"}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/results" prefetch className="hidden md:inline-flex">
            <Button
              size="sm"
              className="h-9 rounded-full bg-[hsl(var(--primary))] px-4 text-[13px] font-semibold tracking-wide text-[hsl(var(--ivory))] hover:bg-[hsl(var(--primary))]/90"
            >
              Check Result
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden grid h-9 w-9 place-items-center rounded-full text-[hsl(var(--ink))] hover:bg-[hsl(var(--cream))] transition-colors"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-[hsl(var(--border))]/80 bg-[hsl(var(--ivory))]/95 backdrop-blur-xl">
          <nav className="container-wide flex flex-col py-4 gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                className="rounded-xl px-4 py-2.5 text-sm font-medium tracking-wide text-[hsl(var(--ink))] hover:bg-[hsl(var(--cream))] transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/results"
              className="mt-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold tracking-wide text-[hsl(var(--ivory))]"
            >
              Check Result
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
