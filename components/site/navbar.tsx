"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, GraduationCap } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { NAV_LINKS, SCHOOL } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300",
        scrolled
          ? "border-b border-slate-200/70 bg-white/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/70"
          : "bg-transparent",
      )}
    >
      <div className="container-wide flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <GraduationCap className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="hidden sm:flex flex-col leading-tight">
            <span className="font-display text-sm font-semibold text-slate-900">
              {SCHOOL.shortName}
            </span>
            <span className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
              Est. {SCHOOL.founded}
            </span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                  active ? "text-primary" : "text-slate-600 hover:text-slate-900",
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/results" className="hidden md:inline-flex">
            <Button variant="ghost" size="sm">Check Result</Button>
          </Link>
          <SignedOut>
            <Link href="/login" className="hidden md:inline-flex">
              <Button size="sm">Sign in</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "h-8 w-8" } }} />
          </SignedIn>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden grid h-9 w-9 place-items-center rounded-md text-slate-700 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-slate-200/70 bg-white">
          <nav className="container-wide flex flex-col py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="py-2.5 text-sm font-medium text-slate-700"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/results" className="py-2.5 text-sm font-medium text-slate-700">
              Check Result
            </Link>
            <SignedOut>
              <Link href="/login" className="mt-2">
                <Button className="w-full">Sign in</Button>
              </Link>
            </SignedOut>
          </nav>
        </div>
      )}
    </header>
  );
}
