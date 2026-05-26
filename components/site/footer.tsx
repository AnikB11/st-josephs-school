import Link from "next/link";
import { Mail, MapPin, Phone, Facebook, Instagram, Youtube } from "lucide-react";
import { SCHOOL, NAV_LINKS } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="relative isolate overflow-hidden bg-[hsl(var(--primary))] text-[hsl(var(--ivory))]">
      {/* hairline gold rule at the top */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[hsl(var(--gold))]/60 to-transparent" />
      {/* soft radial wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-40"
        style={{
          background:
            "radial-gradient(60% 50% at 20% 0%, rgba(255,255,255,0.10), transparent 60%)",
        }}
      />

      <div className="container-wide relative z-10 py-20">
        {/* Big wordmark band */}
        <div className="mb-14 flex flex-col gap-6 border-b border-white/15 pb-12 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[hsl(var(--gold))]/90">
              <span className="gold-rule">Since {SCHOOL.founded}</span>
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
              {SCHOOL.name}.
              <span className="block text-white/60">{SCHOOL.tagline}.</span>
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <a
              aria-label="Facebook"
              href={SCHOOL.social.facebook}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-all hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--primary))]"
            >
              <Facebook className="h-4 w-4" />
            </a>
            <a
              aria-label="Instagram"
              href={SCHOOL.social.instagram}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-all hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--primary))]"
            >
              <Instagram className="h-4 w-4" />
            </a>
            <a
              aria-label="YouTube"
              href={SCHOOL.social.youtube}
              className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-all hover:bg-[hsl(var(--gold))] hover:text-[hsl(var(--primary))]"
            >
              <Youtube className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Quick Links */}
          <div>
            <h4 className="font-display text-[12px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--gold))]/90 mb-5">
              Explore
            </h4>
            <ul className="space-y-3 text-[14px] font-sans">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="nav-underline text-white/80 hover:text-white"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h4 className="font-display text-[12px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--gold))]/90 mb-5">
              Portals
            </h4>
            <ul className="space-y-3 text-[14px] font-sans">
              <li><Link href="/student" className="nav-underline text-white/80 hover:text-white">Student Portal</Link></li>
              <li><Link href="/parent" className="nav-underline text-white/80 hover:text-white">Parent Portal</Link></li>
              <li><Link href="/teacher" className="nav-underline text-white/80 hover:text-white">Teacher Portal</Link></li>
              <li><Link href="/alumni-portal" className="nav-underline text-white/80 hover:text-white">Alumni Portal</Link></li>
              <li><Link href="/results" className="nav-underline text-white/80 hover:text-white">Results</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="lg:col-span-2">
            <h4 className="font-display text-[12px] font-semibold uppercase tracking-[0.22em] text-[hsl(var(--gold))]/90 mb-5">
              Reach us
            </h4>
            <ul className="space-y-4 text-[14px] font-sans text-white/85">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-1 shrink-0 text-[hsl(var(--gold))]" />
                <span className="leading-relaxed">{SCHOOL.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 shrink-0 text-[hsl(var(--gold))]" />
                <a href={`tel:${SCHOOL.phone}`} className="nav-underline hover:text-white">
                  {SCHOOL.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 shrink-0 text-[hsl(var(--gold))]" />
                <a href={`mailto:${SCHOOL.email}`} className="nav-underline hover:text-white">
                  {SCHOOL.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/15 pt-8 text-[12px] font-medium text-white/60 sm:flex-row sm:items-center">
          <p suppressHydrationWarning>© {new Date().getFullYear()} {SCHOOL.name}. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href={`mailto:${SCHOOL.email}`} className="nav-underline hover:text-white">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
