import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SCHOOL } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Page not found",
  description: `The page you were looking for isn't here. Explore ${SCHOOL.name} or contact the school office for help finding what you need.`,
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-[80vh] items-center overflow-hidden surface-ivory">
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,transparent_30%,hsl(var(--ivory))_85%)]"
      />
      <div className="container-wide">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(var(--primary))]">
            <span className="gold-rule">Error 404</span>
          </p>
          <h1 className="font-display mt-6 text-balance text-5xl font-semibold leading-[1.02] tracking-tight text-[hsl(var(--ink))] sm:text-6xl">
            This page took a different path.
          </h1>
          <p className="mt-6 text-base leading-relaxed text-[hsl(var(--ink-soft))] sm:text-lg">
            The link you followed may be outdated, or the page may have moved.
            Head back to the home page or try one of the sections below —
            you&apos;ll find what you need.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Link href="/">
              <Button
                size="lg"
                className="group h-12 rounded-full bg-[hsl(var(--primary))] px-7 text-[14px] font-semibold tracking-wide text-[hsl(var(--ivory))] shadow-md hover:bg-[hsl(var(--primary))]/90"
              >
                <Home className="mr-2 h-4 w-4" />
                Back to home
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full border-[hsl(var(--primary))]/20 bg-white/60 px-7 text-[14px] font-semibold tracking-wide text-[hsl(var(--ink))] hover:bg-white"
              >
                Contact the school
              </Button>
            </Link>
          </div>

          <div className="mt-16 grid gap-3 sm:grid-cols-3">
            {[
              { href: "/about", label: "About" },
              { href: "/academics", label: "Academics" },
              { href: "/admissions", label: "Admissions" },
              { href: "/campus-life", label: "Campus Life" },
              { href: "/notices", label: "Notices" },
              { href: "/results", label: "Check Result" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-white/70 px-4 py-3 text-sm font-medium text-[hsl(var(--ink))] transition-colors hover:border-[hsl(var(--primary))]/30 hover:bg-white"
              >
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-[hsl(var(--primary))]" />
                  {l.label}
                </span>
                <ArrowRight className="h-4 w-4 text-[hsl(var(--ink-soft))]" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
